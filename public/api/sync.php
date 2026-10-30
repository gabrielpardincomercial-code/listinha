<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
    // Protect data directory from direct web access
    file_put_contents($dataDir . '/.htaccess', "Order Deny,Allow\nDeny from all\n");
}

$dbFile = $dataDir . '/listinha.sqlite';
$useSqlite = extension_loaded('pdo_sqlite');

// Initialize database or JSON storage
function getDb() {
    global $dbFile, $useSqlite;
    if ($useSqlite) {
        $db = new PDO('sqlite:' . $dbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create tables if not exist
        $db->exec("
            CREATE TABLE IF NOT EXISTS lists (
                id TEXT PRIMARY KEY,
                title TEXT,
                type TEXT,
                emoji TEXT,
                description TEXT,
                owner_id TEXT,
                collaborators_json TEXT,
                event_details_json TEXT,
                created_at INTEGER,
                updated_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                list_id TEXT,
                name TEXT,
                category TEXT,
                quantity_type TEXT,
                quantity REAL,
                weight_preset TEXT,
                unit_label TEXT,
                custom_quantity TEXT,
                completed INTEGER,
                completed_at INTEGER,
                completed_by_json TEXT,
                assigned_to_json TEXT,
                price_estimate REAL,
                note TEXT,
                created_at INTEGER,
                created_by_json TEXT,
                updated_at INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_items_list ON items(list_id);
            CREATE INDEX IF NOT EXISTS idx_items_updated ON items(updated_at);
        ");
        return $db;
    }
    return null;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    $db = getDb();

    // 1. GET LIST & ITEMS
    if ($action === 'get_list') {
        $listId = $_GET['list_id'] ?? '';
        if (!$listId) {
            echo json_encode(['error' => 'list_id required']);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM lists WHERE id = ?");
        $stmt->execute([$listId]);
        $listRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listRow) {
            echo json_encode(['exists' => false, 'list' => null, 'items' => []]);
            exit();
        }

        $list = [
            'id' => $listRow['id'],
            'title' => $listRow['title'],
            'type' => $listRow['type'],
            'emoji' => $listRow['emoji'],
            'description' => $listRow['description'],
            'ownerId' => $listRow['owner_id'],
            'collaborators' => json_decode($listRow['collaborators_json'] ?: '[]', true),
            'eventDetails' => json_decode($listRow['event_details_json'] ?: 'null', true),
            'createdAt' => (int)$listRow['created_at'],
            'updatedAt' => (int)$listRow['updated_at'],
        ];

        $stmtItems = $db->prepare("SELECT * FROM items WHERE list_id = ? ORDER BY created_at DESC");
        $stmtItems->execute([$listId]);
        $itemRows = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        $items = [];
        foreach ($itemRows as $row) {
            $items[] = [
                'id' => $row['id'],
                'listId' => $row['list_id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'quantityType' => $row['quantity_type'],
                'quantity' => (float)$row['quantity'],
                'weightPreset' => $row['weight_preset'],
                'unitLabel' => $row['unit_label'],
                'customQuantity' => $row['custom_quantity'],
                'completed' => (bool)$row['completed'],
                'completedAt' => $row['completed_at'] ? (int)$row['completed_at'] : null,
                'completedBy' => json_decode($row['completed_by_json'] ?: 'null', true),
                'assignedTo' => json_decode($row['assigned_to_json'] ?: 'null', true),
                'priceEstimate' => $row['price_estimate'] ? (float)$row['price_estimate'] : null,
                'note' => $row['note'],
                'createdAt' => (int)$row['created_at'],
                'createdBy' => json_decode($row['created_by_json'] ?: 'null', true),
            ];
        }

        echo json_encode(['exists' => true, 'list' => $list, 'items' => $items, 'server_time' => time() * 1000]);
        exit();
    }

    // 2. SAVE OR UPDATE LIST
    if ($action === 'save_list') {
        $list = $input['list'] ?? null;
        if (!$list || empty($list['id'])) {
            echo json_encode(['error' => 'list object required']);
            exit();
        }

        $now = time() * 1000;
        $stmt = $db->prepare("
            INSERT INTO lists (id, title, type, emoji, description, owner_id, collaborators_json, event_details_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                type = excluded.type,
                emoji = excluded.emoji,
                description = excluded.description,
                collaborators_json = excluded.collaborators_json,
                event_details_json = excluded.event_details_json,
                updated_at = excluded.updated_at
        ");

        $stmt->execute([
            $list['id'],
            $list['title'] ?? 'Minha Lista',
            $list['type'] ?? 'family',
            $list['emoji'] ?? '🛒',
            $list['description'] ?? '',
            $list['ownerId'] ?? '',
            json_encode($list['collaborators'] ?? []),
            isset($list['eventDetails']) ? json_encode($list['eventDetails']) : null,
            $list['createdAt'] ?? $now,
            $now
        ]);

        echo json_encode(['success' => true, 'updated_at' => $now]);
        exit();
    }

    // 3. JOIN LIST (When family/friend opens shared link)
    if ($action === 'join_list') {
        $listId = $input['list_id'] ?? '';
        $user = $input['user'] ?? null;

        if (!$listId || !$user) {
            echo json_encode(['error' => 'list_id and user required']);
            exit();
        }

        $stmt = $db->prepare("SELECT * FROM lists WHERE id = ?");
        $stmt->execute([$listId]);
        $listRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listRow) {
            echo json_encode(['exists' => false, 'error' => 'List not found']);
            exit();
        }

        $collaborators = json_decode($listRow['collaborators_json'] ?: '[]', true);
        $userExists = false;
        foreach ($collaborators as $c) {
            if ($c['id'] === $user['id'] || $c['email'] === $user['email']) {
                $userExists = true;
                break;
            }
        }

        if (!$userExists) {
            $collaborators[] = $user;
            $now = time() * 1000;
            $stmtUpdate = $db->prepare("UPDATE lists SET collaborators_json = ?, updated_at = ? WHERE id = ?");
            $stmtUpdate->execute([json_encode($collaborators), $now, $listId]);
        }

        // Return current list and all items
        $stmtItems = $db->prepare("SELECT * FROM items WHERE list_id = ? ORDER BY created_at DESC");
        $stmtItems->execute([$listId]);
        $itemRows = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        $items = [];
        foreach ($itemRows as $row) {
            $items[] = [
                'id' => $row['id'],
                'listId' => $row['list_id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'quantityType' => $row['quantity_type'],
                'quantity' => (float)$row['quantity'],
                'weightPreset' => $row['weight_preset'],
                'unitLabel' => $row['unit_label'],
                'customQuantity' => $row['custom_quantity'],
                'completed' => (bool)$row['completed'],
                'completedAt' => $row['completed_at'] ? (int)$row['completed_at'] : null,
                'completedBy' => json_decode($row['completed_by_json'] ?: 'null', true),
                'assignedTo' => json_decode($row['assigned_to_json'] ?: 'null', true),
                'priceEstimate' => $row['price_estimate'] ? (float)$row['price_estimate'] : null,
                'note' => $row['note'],
                'createdAt' => (int)$row['created_at'],
                'createdBy' => json_decode($row['created_by_json'] ?: 'null', true),
            ];
        }

        $list = [
            'id' => $listRow['id'],
            'title' => $listRow['title'],
            'type' => $listRow['type'],
            'emoji' => $listRow['emoji'],
            'description' => $listRow['description'],
            'ownerId' => $listRow['owner_id'],
            'collaborators' => $collaborators,
            'eventDetails' => json_decode($listRow['event_details_json'] ?: 'null', true),
            'createdAt' => (int)$listRow['created_at'],
            'updatedAt' => (int)$listRow['updated_at'],
        ];

        echo json_encode(['exists' => true, 'list' => $list, 'items' => $items]);
        exit();
    }

    // 4. SAVE OR UPDATE ITEM
    if ($action === 'save_item') {
        $item = $input['item'] ?? null;
        if (!$item || empty($item['id']) || empty($item['listId'])) {
            echo json_encode(['error' => 'valid item required']);
            exit();
        }

        $now = time() * 1000;
        $stmt = $db->prepare("
            INSERT INTO items (
                id, list_id, name, category, quantity_type, quantity, weight_preset, unit_label,
                custom_quantity, completed, completed_at, completed_by_json, assigned_to_json,
                price_estimate, note, created_at, created_by_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                category = excluded.category,
                quantity_type = excluded.quantity_type,
                quantity = excluded.quantity,
                weight_preset = excluded.weight_preset,
                unit_label = excluded.unit_label,
                custom_quantity = excluded.custom_quantity,
                completed = excluded.completed,
                completed_at = excluded.completed_at,
                completed_by_json = excluded.completed_by_json,
                assigned_to_json = excluded.assigned_to_json,
                price_estimate = excluded.price_estimate,
                note = excluded.note,
                updated_at = excluded.updated_at
        ");

        $stmt->execute([
            $item['id'],
            $item['listId'],
            $item['name'],
            $item['category'] ?? 'mercearia',
            $item['quantityType'] ?? 'unit',
            $item['quantity'] ?? 1,
            $item['weightPreset'] ?? null,
            $item['unitLabel'] ?? 'un',
            $item['customQuantity'] ?? null,
            !empty($item['completed']) ? 1 : 0,
            $item['completedAt'] ?? null,
            isset($item['completedBy']) ? json_encode($item['completedBy']) : null,
            isset($item['assignedTo']) ? json_encode($item['assignedTo']) : null,
            $item['priceEstimate'] ?? null,
            $item['note'] ?? null,
            $item['createdAt'] ?? $now,
            isset($item['createdBy']) ? json_encode($item['createdBy']) : null,
            $now
        ]);

        echo json_encode(['success' => true, 'updated_at' => $now]);
        exit();
    }

    // 5. TOGGLE ITEM
    if ($action === 'toggle_item') {
        $itemId = $input['item_id'] ?? '';
        $completed = !empty($input['completed']) ? 1 : 0;
        $completedBy = $input['completed_by'] ?? null;
        $now = time() * 1000;

        $stmt = $db->prepare("
            UPDATE items SET
                completed = ?,
                completed_at = ?,
                completed_by_json = ?,
                updated_at = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $completed,
            $completed ? $now : null,
            $completed ? json_encode($completedBy) : null,
            $now,
            $itemId
        ]);

        echo json_encode(['success' => true, 'updated_at' => $now]);
        exit();
    }

    // 6. DELETE ITEM
    if ($action === 'delete_item') {
        $itemId = $input['item_id'] ?? '';
        $stmt = $db->prepare("DELETE FROM items WHERE id = ?");
        $stmt->execute([$itemId]);
        echo json_encode(['success' => true]);
        exit();
    }

    // 7. CLEAR COMPLETED ITEMS
    if ($action === 'clear_completed') {
        $listId = $input['list_id'] ?? '';
        $stmt = $db->prepare("DELETE FROM items WHERE list_id = ? AND completed = 1");
        $stmt->execute([$listId]);
        echo json_encode(['success' => true]);
        exit();
    }

    // 8. REALTIME POLL
    if ($action === 'poll') {
        $listId = $_GET['list_id'] ?? '';
        $since = (int)($_GET['since'] ?? 0);

        if (!$listId) {
            echo json_encode(['error' => 'list_id required']);
            exit();
        }

        // Check if list was updated
        $stmtList = $db->prepare("SELECT * FROM lists WHERE id = ? AND updated_at > ?");
        $stmtList->execute([$listId, $since]);
        $listRow = $stmtList->fetch(PDO::FETCH_ASSOC);

        $list = null;
        if ($listRow) {
            $list = [
                'id' => $listRow['id'],
                'title' => $listRow['title'],
                'type' => $listRow['type'],
                'emoji' => $listRow['emoji'],
                'description' => $listRow['description'],
                'ownerId' => $listRow['owner_id'],
                'collaborators' => json_decode($listRow['collaborators_json'] ?: '[]', true),
                'eventDetails' => json_decode($listRow['event_details_json'] ?: 'null', true),
                'createdAt' => (int)$listRow['created_at'],
                'updatedAt' => (int)$listRow['updated_at'],
            ];
        }

        // Return all current items for accurate sync
        $stmtItems = $db->prepare("SELECT * FROM items WHERE list_id = ? ORDER BY created_at DESC");
        $stmtItems->execute([$listId]);
        $itemRows = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        $items = [];
        foreach ($itemRows as $row) {
            $items[] = [
                'id' => $row['id'],
                'listId' => $row['list_id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'quantityType' => $row['quantity_type'],
                'quantity' => (float)$row['quantity'],
                'weightPreset' => $row['weight_preset'],
                'unitLabel' => $row['unit_label'],
                'customQuantity' => $row['custom_quantity'],
                'completed' => (bool)$row['completed'],
                'completedAt' => $row['completed_at'] ? (int)$row['completed_at'] : null,
                'completedBy' => json_decode($row['completed_by_json'] ?: 'null', true),
                'assignedTo' => json_decode($row['assigned_to_json'] ?: 'null', true),
                'priceEstimate' => $row['price_estimate'] ? (float)$row['price_estimate'] : null,
                'note' => $row['note'],
                'createdAt' => (int)$row['created_at'],
                'createdBy' => json_decode($row['created_by_json'] ?: 'null', true),
            ];
        }

        echo json_encode([
            'success' => true,
            'has_list_update' => $list !== null,
            'list' => $list,
            'items' => $items,
            'server_time' => time() * 1000
        ]);
        exit();
    }

    echo json_encode(['error' => 'Unknown action: ' . $action]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
