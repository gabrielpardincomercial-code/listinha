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
    file_put_contents($dataDir . '/.htaccess', "Order Deny,Allow\nDeny from all\n");
}

$dbFile = $dataDir . '/listinha.sqlite';

function getDb() {
    global $dbFile;
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("
        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT
        );

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

function formatListRow($listRow) {
    return [
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

function formatItemRow($row) {
    return [
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

function getItemsForListIds($db, $listIds) {
    if (empty($listIds)) return [];
    $placeholders = implode(',', array_fill(0, count($listIds), '?'));
    $stmt = $db->prepare("SELECT * FROM items WHERE list_id IN ($placeholders) ORDER BY created_at DESC");
    $stmt->execute(array_values($listIds));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $items[] = formatItemRow($r);
    }
    return $items;
}

function getListsForUser($db, $userId, $userEmail) {
    $stmt = $db->query("SELECT * FROM lists ORDER BY created_at ASC");
    $allLists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $matchedLists = [];
    $cleanEmail = strtolower(trim($userEmail));

    foreach ($allLists as $row) {
        $isMatch = false;
        if ($userId && $row['owner_id'] === $userId) {
            $isMatch = true;
        }
        $collabs = json_decode($row['collaborators_json'] ?: '[]', true);
        if (is_array($collabs)) {
            foreach ($collabs as $c) {
                $cEmail = strtolower(trim($c['email'] ?? ''));
                $cId = $c['id'] ?? '';
                if (($userId && $cId === $userId) || ($cleanEmail && $cEmail === $cleanEmail)) {
                    $isMatch = true;
                    break;
                }
            }
        }
        if ($isMatch) {
            $matchedLists[] = formatListRow($row);
        }
    }
    return $matchedLists;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    $db = getDb();

    // 0. CONFIG (Google Client ID)
    if ($action === 'get_config') {
        $stmt = $db->prepare("SELECT value FROM config WHERE key = 'google_client_id'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'google_client_id' => $row ? $row['value'] : ''
        ]);
        exit();
    }

    if ($action === 'save_config') {
        $clientId = trim($input['google_client_id'] ?? '');
        $stmt = $db->prepare("INSERT INTO config (key, value) VALUES ('google_client_id', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
        $stmt->execute([$clientId]);
        echo json_encode(['success' => true, 'google_client_id' => $clientId]);
        exit();
    }

    // 1. USER LOGIN & FETCH ALL SHARED LISTS FOR THIS EMAIL/USER
    if ($action === 'user_login') {
        $user = $input['user'] ?? null;
        $inviteListId = $input['invite_list_id'] ?? null;

        if (!$user || empty($user['email'])) {
            echo json_encode(['error' => 'valid user with email required']);
            exit();
        }

        $cleanEmail = strtolower(trim($user['email']));
        $now = time() * 1000;

        // If user came via invite_list_id, add them to that list first
        if ($inviteListId) {
            $stmtInvite = $db->prepare("SELECT * FROM lists WHERE id = ?");
            $stmtInvite->execute([$inviteListId]);
            $invRow = $stmtInvite->fetch(PDO::FETCH_ASSOC);
            if ($invRow) {
                $collabs = json_decode($invRow['collaborators_json'] ?: '[]', true);
                $found = false;
                foreach ($collabs as &$c) {
                    if ($c['id'] === $user['id'] || strtolower(trim($c['email'] ?? '')) === $cleanEmail) {
                        $c = $user;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $collabs[] = $user;
                }
                $stmtUpd = $db->prepare("UPDATE lists SET collaborators_json = ?, updated_at = ? WHERE id = ?");
                $stmtUpd->execute([json_encode($collabs), $now, $inviteListId]);
            }
        }

        // Also update user profile in any list where their email was pre-added by a family member
        $stmtAll = $db->query("SELECT * FROM lists");
        $allRows = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
        foreach ($allRows as $r) {
            $collabs = json_decode($r['collaborators_json'] ?: '[]', true);
            $changed = false;
            if (is_array($collabs)) {
                foreach ($collabs as &$c) {
                    if (strtolower(trim($c['email'] ?? '')) === $cleanEmail) {
                        if ($c['id'] !== $user['id'] || ($user['avatar'] && $c['avatar'] !== $user['avatar'])) {
                            $c['id'] = $user['id'];
                            $c['name'] = $user['name'];
                            $c['avatar'] = $user['avatar'];
                            $changed = true;
                        }
                    }
                }
            }
            if ($changed) {
                $stmtUpd = $db->prepare("UPDATE lists SET collaborators_json = ?, updated_at = ? WHERE id = ?");
                $stmtUpd->execute([json_encode($collabs), $now, $r['id']]);
            }
        }

        // Now get all lists for this user
        $userLists = getListsForUser($db, $user['id'], $cleanEmail);

        // If user has no lists at all, create their default "Lista da Família"
        if (empty($userLists)) {
            $newListId = 'list_familia_' . preg_replace('/[^a-zA-Z0-9]/', '_', $cleanEmail);
            $defaultList = [
                'id' => $newListId,
                'title' => 'Lista da Família',
                'type' => 'family',
                'emoji' => '🏠',
                'description' => 'Compras compartilhadas da família',
                'ownerId' => $user['id'],
                'collaborators' => [$user],
                'eventDetails' => null,
                'createdAt' => $now,
                'updatedAt' => $now,
            ];

            $stmtIns = $db->prepare("
                INSERT INTO lists (id, title, type, emoji, description, owner_id, collaborators_json, event_details_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING
            ");
            $stmtIns->execute([
                $defaultList['id'],
                $defaultList['title'],
                $defaultList['type'],
                $defaultList['emoji'],
                $defaultList['description'],
                $defaultList['ownerId'],
                json_encode($defaultList['collaborators']),
                null,
                $now,
                $now
            ]);

            $userLists = [$defaultList];
        }

        $listIds = array_map(function($l) { return $l['id']; }, $userLists);
        $items = getItemsForListIds($db, $listIds);

        echo json_encode([
            'success' => true,
            'lists' => $userLists,
            'items' => $items,
            'server_time' => $now
        ]);
        exit();
    }

    // 2. GET SINGLE LIST & ITEMS
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

        $list = formatListRow($listRow);
        $items = getItemsForListIds($db, [$listId]);

        echo json_encode(['exists' => true, 'list' => $list, 'items' => $items, 'server_time' => time() * 1000]);
        exit();
    }

    // 3. SAVE OR UPDATE LIST (AND OPTIONALLY BULK ITEMS)
    if ($action === 'save_list') {
        $list = $input['list'] ?? null;
        $items = $input['items'] ?? null;
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

        // If items array was provided, ensure all are saved in SQLite
        if (is_array($items)) {
            $stmtItem = $db->prepare("
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
                    updated_at = excluded.updated_at
            ");
            foreach ($items as $item) {
                if (!empty($item['id']) && !empty($item['listId'])) {
                    $stmtItem->execute([
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
                }
            }
        }

        echo json_encode(['success' => true, 'updated_at' => $now]);
        exit();
    }

    // 4. JOIN LIST (When family/friend opens shared link)
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
        $cleanEmail = strtolower(trim($user['email'] ?? ''));
        $userExists = false;

        foreach ($collaborators as &$c) {
            if ($c['id'] === $user['id'] || ($cleanEmail && strtolower(trim($c['email'] ?? '')) === $cleanEmail)) {
                $c = $user;
                $userExists = true;
                break;
            }
        }

        $now = time() * 1000;
        if (!$userExists) {
            $collaborators[] = $user;
        }

        // Also add to eventDetails.participants if temporary list
        $eventDetails = json_decode($listRow['event_details_json'] ?: 'null', true);
        if (is_array($eventDetails) && isset($eventDetails['participants']) && is_array($eventDetails['participants'])) {
            $pExists = false;
            foreach ($eventDetails['participants'] as &$p) {
                if ($p['id'] === $user['id'] || ($cleanEmail && strtolower(trim($p['email'] ?? '')) === $cleanEmail)) {
                    $p = $user;
                    $pExists = true;
                    break;
                }
            }
            if (!$pExists) {
                $eventDetails['participants'][] = $user;
            }
        }

        $stmtUpdate = $db->prepare("UPDATE lists SET collaborators_json = ?, event_details_json = ?, updated_at = ? WHERE id = ?");
        $stmtUpdate->execute([
            json_encode($collaborators),
            $eventDetails ? json_encode($eventDetails) : null,
            $now,
            $listId
        ]);

        // Return all lists for this user + items
        $userLists = getListsForUser($db, $user['id'], $cleanEmail);
        $listIds = array_map(function($l) { return $l['id']; }, $userLists);
        if (!in_array($listId, $listIds)) {
            $listIds[] = $listId;
        }
        $items = getItemsForListIds($db, $listIds);

        $joinedList = formatListRow($listRow);
        $joinedList['collaborators'] = $collaborators;
        $joinedList['eventDetails'] = $eventDetails;

        echo json_encode([
            'exists' => true,
            'list' => $joinedList,
            'lists' => $userLists,
            'items' => $items
        ]);
        exit();
    }

    // 5. SAVE OR UPDATE ITEM
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

    // 6. TOGGLE ITEM
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

    // 7. DELETE ITEM
    if ($action === 'delete_item') {
        $itemId = $input['item_id'] ?? '';
        $stmt = $db->prepare("DELETE FROM items WHERE id = ?");
        $stmt->execute([$itemId]);
        echo json_encode(['success' => true]);
        exit();
    }

    // 8. CLEAR COMPLETED ITEMS
    if ($action === 'clear_completed') {
        $listId = $input['list_id'] ?? '';
        $stmt = $db->prepare("DELETE FROM items WHERE list_id = ? AND completed = 1");
        $stmt->execute([$listId]);
        echo json_encode(['success' => true]);
        exit();
    }

    // 9. REALTIME POLL (Returns all lists & items for user + current listId)
    if ($action === 'poll') {
        $listId = $_GET['list_id'] ?? '';
        $userId = $_GET['user_id'] ?? '';
        $userEmail = $_GET['user_email'] ?? '';

        $userLists = [];
        if ($userId || $userEmail) {
            $userLists = getListsForUser($db, $userId, $userEmail);
        }

        // Also ensure $listId is included if specified
        if ($listId) {
            $foundActive = false;
            foreach ($userLists as $ul) {
                if ($ul['id'] === $listId) {
                    $foundActive = true;
                    break;
                }
            }
            if (!$foundActive) {
                $stmt = $db->prepare("SELECT * FROM lists WHERE id = ?");
                $stmt->execute([$listId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $userLists[] = formatListRow($row);
                }
            }
        }

        $listIds = array_map(function($l) { return $l['id']; }, $userLists);
        $items = getItemsForListIds($db, $listIds);

        $activeList = null;
        foreach ($userLists as $ul) {
            if ($ul['id'] === $listId) {
                $activeList = $ul;
                break;
            }
        }

        echo json_encode([
            'success' => true,
            'list' => $activeList,
            'lists' => $userLists,
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
