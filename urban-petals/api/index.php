<?php

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/config.php';

try {
    $pdo = db($config);
    route($pdo, $config);
} catch (Throwable $exception) {
    json_response(['error' => $exception->getMessage()], 500);
}

function db(array $config): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $config['db']['host'],
        $config['db']['port'],
        $config['db']['name'],
        $config['db']['charset']
    );

    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function route(PDO $pdo, array $config): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $path = request_path($config);
    $body = request_body();

    if ($method === 'GET' && $path === '/auth/me') {
        require_login($pdo);
        json_response(['user' => user_resource(find_user($pdo, current_user_id()))]);
    }

    if ($method === 'POST' && $path === '/auth/register') {
        register_customer($pdo, $body);
        return;
    }

    if ($method === 'POST' && $path === '/auth/login') {
        login_user($pdo, $body);
        return;
    }

    if ($method === 'POST' && $path === '/auth/logout') {
        logout_user($pdo);
        return;
    }

    if ($method === 'GET' && $path === '/admin/accounts') {
        require_admin($pdo);
        list_accounts($pdo);
        return;
    }

    if ($method === 'POST' && $path === '/admin/accounts') {
        require_admin($pdo);
        create_account($pdo, $body);
        return;
    }

    if (preg_match('#^/admin/accounts/(\d+)$#', $path, $matches)) {
        require_admin($pdo);
        $accountId = (int) $matches[1];
        if ($method === 'PATCH') {
            update_account($pdo, $accountId, $body);
            return;
        }
        if ($method === 'DELETE') {
            delete_account($pdo, $accountId);
            return;
        }
    }

    if ($method === 'GET' && $path === '/dashboard/stats') {
        require_admin($pdo);
        dashboard_stats($pdo);
        return;
    }

    if ($method === 'GET' && $path === '/products') {
        list_products($pdo);
        return;
    }

    if ($method === 'POST' && $path === '/products') {
        require_admin($pdo);
        create_product($pdo, $body);
        return;
    }

    if (preg_match('#^/products/(\d+)$#', $path, $matches)) {
        require_admin($pdo);
        $productId = (int) $matches[1];
        if ($method === 'PATCH') {
            update_product($pdo, $productId, $body);
            return;
        }
        if ($method === 'DELETE') {
            delete_product($pdo, $productId);
            return;
        }
    }

    if ($method === 'GET' && $path === '/orders') {
        require_admin($pdo);
        list_orders($pdo);
        return;
    }

    if ($method === 'POST' && $path === '/orders') {
        create_order($pdo, $body);
        return;
    }

    json_response(['error' => 'Route not found.'], 404);
}

function request_path(array $config): string
{
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $basePath = rtrim((string) ($config['app']['base_url'] ?? dirname($_SERVER['SCRIPT_NAME'] ?? '/api')), '/');

    if ($basePath && str_starts_with($uriPath, $basePath)) {
        $uriPath = substr($uriPath, strlen($basePath)) ?: '/';
    }

    return '/' . trim($uriPath, '/');
}

function request_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
}

function current_user_id(): ?int
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

function require_login(PDO $pdo): array
{
    $userId = current_user_id();
    if (!$userId) {
        json_response(['error' => 'You need to sign in first.'], 401);
    }

    $user = find_user($pdo, $userId);
    if (!$user) {
        json_response(['error' => 'Account not found.'], 401);
    }

    return $user;
}

function require_admin(PDO $pdo): array
{
    $user = require_login($pdo);
    if ($user['role'] === 'customer') {
        json_response(['error' => 'Admin access required.'], 403);
    }

    return $user;
}

function find_user(PDO $pdo, ?int $userId): ?array
{
    if (!$userId) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function find_user_by_email(PDO $pdo, string $email): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => strtolower($email)]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function user_resource(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => trim($user['first_name'] . ' ' . ($user['last_name'] ?? '')),
        'email' => $user['email'],
        'role' => $user['role'],
        'employeeId' => $user['employee_id'],
        'department' => $user['department'],
        'phone' => $user['phone'],
        'city' => $user['city'],
        'avatar' => $user['avatar'],
        'status' => $user['status'],
        'lastLogin' => $user['last_login_at'],
        'loginIp' => $user['last_login_ip'],
        'sessions' => (int) $user['sessions_count'],
    ];
}

function format_role_label(string $role): string
{
    return match ($role) {
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'staff' => 'Staff',
        default => 'Customer',
    };
}

function employee_id_from_count(int $count): string
{
    return 'EMP-' . str_pad((string) $count, 3, '0', STR_PAD_LEFT);
}

function register_customer(PDO $pdo, array $body): void
{
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $firstName = trim((string) ($body['firstName'] ?? ''));
    $lastName = trim((string) ($body['lastName'] ?? ''));
    $phone = trim((string) ($body['phone'] ?? ''));
    $city = trim((string) ($body['city'] ?? ''));
    $avatar = trim((string) ($body['avatar'] ?? '🌿'));

    if ($firstName === '' || $email === '' || $password === '') {
        json_response(['error' => 'First name, email, and password are required.'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['error' => 'Please enter a valid email address.'], 422);
    }
    if (strlen($password) < 8) {
        json_response(['error' => 'Password must be at least 8 characters.'], 422);
    }
    if (find_user_by_email($pdo, $email)) {
        json_response(['error' => 'That email is already registered.'], 409);
    }

    $stmt = $pdo->prepare('
        INSERT INTO users (first_name, last_name, email, password_hash, role, phone, city, avatar, status)
        VALUES (:first_name, :last_name, :email, :password_hash, :role, :phone, :city, :avatar, :status)
    ');
    $stmt->execute([
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'role' => 'customer',
        'phone' => $phone !== '' ? $phone : null,
        'city' => $city !== '' ? $city : null,
        'avatar' => $avatar !== '' ? $avatar : '🌿',
        'status' => 'offline',
    ]);

    $userId = (int) $pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;

    json_response([
        'user' => user_resource(find_user($pdo, $userId)),
    ], 201);
}

function login_user(PDO $pdo, array $body): void
{
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $type = strtolower(trim((string) ($body['type'] ?? 'customer')));
    $employeeId = trim((string) ($body['employeeId'] ?? ''));

    $user = find_user_by_email($pdo, $email);
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(['error' => 'Incorrect email or password.'], 401);
    }
    if ($user['status'] === 'suspended') {
        json_response(['error' => 'This account has been suspended.'], 403);
    }
    if ($type === 'employee') {
        if ($user['role'] === 'customer') {
            json_response(['error' => 'Employee account required.'], 403);
        }
        if ($employeeId === '' || $employeeId !== (string) $user['employee_id']) {
            json_response(['error' => 'Employee ID does not match this account.'], 401);
        }
    } elseif ($user['role'] !== 'customer') {
        json_response(['error' => 'Please use the employee sign in option.'], 403);
    }

    $stmt = $pdo->prepare('
        UPDATE users
        SET last_login_at = NOW(), last_login_ip = :ip, status = :status, sessions_count = sessions_count + 1
        WHERE id = :id
    ');
    $stmt->execute([
        'ip' => client_ip(),
        'status' => 'online',
        'id' => (int) $user['id'],
    ]);

    $_SESSION['user_id'] = (int) $user['id'];

    json_response([
        'user' => user_resource(find_user($pdo, (int) $user['id'])),
    ]);
}

function logout_user(PDO $pdo): void
{
    $userId = current_user_id();
    if ($userId) {
        $stmt = $pdo->prepare('UPDATE users SET status = :status, sessions_count = GREATEST(sessions_count - 1, 0) WHERE id = :id');
        $stmt->execute([
            'status' => 'offline',
            'id' => $userId,
        ]);
    }

    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();

    json_response(['success' => true, 'redirect' => 'Signin.html']);
}

function list_accounts(PDO $pdo): void
{
    $rows = $pdo->query("
        SELECT *
        FROM users
        WHERE role <> 'customer'
        ORDER BY created_at DESC, id DESC
    ")->fetchAll();

    $accounts = array_map(static function (array $row): array {
        return [
            'id' => (int) $row['id'],
            'name' => trim($row['first_name'] . ' ' . ($row['last_name'] ?? '')),
            'email' => $row['email'],
            'role' => format_role_label($row['role']),
            'lastLogin' => $row['last_login_at'] ?: date('Y-m-d H:i:s'),
            'loginIp' => $row['last_login_ip'] ?: '—',
            'sessions' => (int) $row['sessions_count'],
            'status' => $row['status'],
            'employeeId' => $row['employee_id'],
            'department' => $row['department'],
        ];
    }, $rows);

    json_response($accounts);
}

function create_account(PDO $pdo, array $body): void
{
    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $roleLabel = trim((string) ($body['role'] ?? ''));
    $department = trim((string) ($body['department'] ?? ''));

    if ($name === '' || $email === '' || $roleLabel === '') {
        json_response(['error' => 'Name, email, and role are required.'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['error' => 'Please enter a valid email address.'], 422);
    }
    if (find_user_by_email($pdo, $email)) {
        json_response(['error' => 'That email is already in use.'], 409);
    }

    $nameParts = preg_split('/\s+/', $name) ?: [$name];
    $firstName = array_shift($nameParts) ?: $name;
    $lastName = trim(implode(' ', $nameParts));
    $role = match (strtolower(str_replace(' ', '_', $roleLabel))) {
        'super_admin' => 'super_admin',
        'admin' => 'admin',
        default => 'staff',
    };

    $nextNumber = ((int) $pdo->query("SELECT COUNT(*) FROM users WHERE role <> 'customer'")->fetchColumn()) + 1;
    $employeeId = employee_id_from_count($nextNumber);
    $tempPassword = 'ChangeMe123!';

    $stmt = $pdo->prepare('
        INSERT INTO users (first_name, last_name, email, password_hash, role, employee_id, department, avatar, status)
        VALUES (:first_name, :last_name, :email, :password_hash, :role, :employee_id, :department, :avatar, :status)
    ');
    $stmt->execute([
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'password_hash' => password_hash($tempPassword, PASSWORD_DEFAULT),
        'role' => $role,
        'employee_id' => $employeeId,
        'department' => $department !== '' ? $department : 'General',
        'avatar' => '🌿',
        'status' => 'offline',
    ]);

    $account = find_user($pdo, (int) $pdo->lastInsertId());
    json_response([
        'id' => (int) $account['id'],
        'name' => trim($account['first_name'] . ' ' . ($account['last_name'] ?? '')),
        'email' => $account['email'],
        'role' => format_role_label($account['role']),
        'lastLogin' => date('Y-m-d H:i:s'),
        'loginIp' => '—',
        'sessions' => 0,
        'status' => 'offline',
        'employeeId' => $account['employee_id'],
        'department' => $account['department'],
        'tempPassword' => $tempPassword,
    ], 201);
}

function update_account(PDO $pdo, int $accountId, array $body): void
{
    $account = find_user($pdo, $accountId);
    if (!$account || $account['role'] === 'customer') {
        json_response(['error' => 'Account not found.'], 404);
    }

    $allowedRoles = [
        'Super Admin' => 'super_admin',
        'Admin' => 'admin',
        'Staff' => 'staff',
    ];

    $fields = [];
    $params = ['id' => $accountId];

    if (isset($body['status'])) {
        $status = (string) $body['status'];
        if (!in_array($status, ['online', 'offline', 'suspended'], true)) {
            json_response(['error' => 'Invalid status.'], 422);
        }
        $fields[] = 'status = :status';
        $params['status'] = $status;
    }

    if (isset($body['sessions'])) {
        $fields[] = 'sessions_count = :sessions_count';
        $params['sessions_count'] = max(0, (int) $body['sessions']);
    }

    if (isset($body['role']) && isset($allowedRoles[$body['role']])) {
        $fields[] = 'role = :role';
        $params['role'] = $allowedRoles[$body['role']];
    }

    if (!$fields) {
        json_response(['error' => 'No supported fields were provided.'], 422);
    }

    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $updated = find_user($pdo, $accountId);
    json_response([
        'id' => (int) $updated['id'],
        'name' => trim($updated['first_name'] . ' ' . ($updated['last_name'] ?? '')),
        'email' => $updated['email'],
        'role' => format_role_label($updated['role']),
        'lastLogin' => $updated['last_login_at'] ?: date('Y-m-d H:i:s'),
        'loginIp' => $updated['last_login_ip'] ?: '—',
        'sessions' => (int) $updated['sessions_count'],
        'status' => $updated['status'],
    ]);
}

function delete_account(PDO $pdo, int $accountId): void
{
    if ($accountId === current_user_id()) {
        json_response(['error' => 'You cannot delete the account you are using.'], 422);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id AND role <> 'customer'");
    $stmt->execute(['id' => $accountId]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Account not found.'], 404);
    }

    json_response(['success' => true]);
}

function dashboard_stats(PDO $pdo): void
{
    $stats = $pdo->query("
        SELECT
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
            SUM(CASE WHEN status = 'in-transit' THEN 1 ELSE 0 END) AS transit_count,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS new_count,
            SUM(CASE WHEN status IN ('cancelled', 'rejected') THEN 1 ELSE 0 END) AS cancelled_count
        FROM orders
    ")->fetch() ?: [];

    json_response([
        'delivered' => (int) ($stats['delivered_count'] ?? 0),
        'transit' => (int) ($stats['transit_count'] ?? 0),
        'new' => (int) ($stats['new_count'] ?? 0),
        'cancelled' => (int) ($stats['cancelled_count'] ?? 0),
    ]);
}

function list_products(PDO $pdo): void
{
    $rows = $pdo->query('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC, id DESC')->fetchAll();
    $products = array_map(static function (array $row): array {
        return [
            'id' => (int) $row['id'],
            'no' => (int) $row['id'],
            'date' => date('m/d/y', strtotime((string) $row['created_at'])),
            'code' => '#' . $row['item_code'],
            'name' => $row['name'],
            'category' => $row['category'],
            'qty' => (int) $row['quantity'],
            'price' => (float) $row['price'],
        ];
    }, $rows);

    json_response($products);
}

function create_product(PDO $pdo, array $body): void
{
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    $code = ltrim($code, '#');
    $name = trim((string) ($body['name'] ?? ''));
    $category = trim((string) ($body['category'] ?? ''));
    $quantity = (int) ($body['qty'] ?? 0);
    $price = (float) ($body['price'] ?? 0);

    if ($name === '' || $category === '') {
        json_response(['error' => 'Name and category are required.'], 422);
    }
    if ($code === '') {
        $nextNumber = ((int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn()) + 1;
        $code = 'A' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    $stmt = $pdo->prepare('
        INSERT INTO products (item_code, name, category, quantity, price)
        VALUES (:item_code, :name, :category, :quantity, :price)
    ');
    $stmt->execute([
        'item_code' => $code,
        'name' => $name,
        'category' => $category,
        'quantity' => $quantity,
        'price' => $price,
    ]);

    $product = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $product->execute(['id' => (int) $pdo->lastInsertId()]);
    $row = $product->fetch();

    json_response([
        'id' => (int) $row['id'],
        'no' => (int) $row['id'],
        'date' => date('m/d/y', strtotime((string) $row['created_at'])),
        'code' => '#' . $row['item_code'],
        'name' => $row['name'],
        'category' => $row['category'],
        'qty' => (int) $row['quantity'],
        'price' => (float) $row['price'],
    ], 201);
}

function update_product(PDO $pdo, int $productId, array $body): void
{
    $fields = [];
    $params = ['id' => $productId];

    if (isset($body['name'])) {
        $fields[] = 'name = :name';
        $params['name'] = trim((string) $body['name']);
    }
    if (isset($body['category'])) {
        $fields[] = 'category = :category';
        $params['category'] = trim((string) $body['category']);
    }
    if (isset($body['qty'])) {
        $fields[] = 'quantity = :quantity';
        $params['quantity'] = (int) $body['qty'];
    }
    if (isset($body['price'])) {
        $fields[] = 'price = :price';
        $params['price'] = (float) $body['price'];
    }
    if (!$fields) {
        json_response(['error' => 'No supported product fields were provided.'], 422);
    }

    $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $product = $pdo->prepare('SELECT * FROM products WHERE id = :id');
    $product->execute(['id' => $productId]);
    $row = $product->fetch();
    if (!$row) {
        json_response(['error' => 'Product not found.'], 404);
    }

    json_response([
        'id' => (int) $row['id'],
        'no' => (int) $row['id'],
        'date' => date('m/d/y', strtotime((string) $row['created_at'])),
        'code' => '#' . $row['item_code'],
        'name' => $row['name'],
        'category' => $row['category'],
        'qty' => (int) $row['quantity'],
        'price' => (float) $row['price'],
    ]);
}

function delete_product(PDO $pdo, int $productId): void
{
    $stmt = $pdo->prepare('UPDATE products SET is_active = 0 WHERE id = :id');
    $stmt->execute(['id' => $productId]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Product not found.'], 404);
    }

    json_response(['success' => true]);
}

function list_orders(PDO $pdo): void
{
    $rows = $pdo->query('
        SELECT order_code, customer_name, total_amount, address, created_at, status
        FROM orders
        ORDER BY created_at DESC, id DESC
    ')->fetchAll();

    $orders = array_map(static function (array $row): array {
        $nameParts = preg_split('/\s+/', trim((string) $row['customer_name'])) ?: ['U', 'P'];
        $initials = strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[1] ?? $nameParts[0], 0, 1));
        $classMap = ['nc', 'km', 'dc', 'od', 'al'];
        $className = $classMap[crc32((string) $row['order_code']) % count($classMap)];

        return [
            'id' => '#' . $row['order_code'],
            'initials' => $initials,
            'cls' => $className,
            'user' => $row['customer_name'],
            'total' => (float) $row['total_amount'],
            'address' => $row['address'],
            'date' => date('F j, Y', strtotime((string) $row['created_at'])),
            'status' => $row['status'],
        ];
    }, $rows);

    json_response($orders);
}

function create_order(PDO $pdo, array $body): void
{
    $customer = $body['customer'] ?? [];
    $items = $body['items'] ?? [];
    $payment = trim((string) ($body['payment'] ?? 'Cash on Delivery'));

    $name = trim((string) ($customer['name'] ?? ''));
    $email = trim((string) ($customer['email'] ?? ''));
    $address = trim((string) ($customer['address'] ?? ''));
    $contact = trim((string) ($customer['contact'] ?? ''));

    if ($name === '' || $address === '' || $contact === '') {
        json_response(['error' => 'Name, address, and contact number are required.'], 422);
    }
    if (!is_array($items) || $items === []) {
        json_response(['error' => 'At least one cart item is required.'], 422);
    }

    $cleanItems = [];
    $total = 0.0;
    foreach ($items as $item) {
        $itemName = trim((string) ($item['name'] ?? ''));
        $qty = max(1, (int) ($item['qty'] ?? 1));
        $price = (float) ($item['price'] ?? 0);
        if ($itemName === '') {
            continue;
        }
        $subtotal = $qty * $price;
        $total += $subtotal;
        $cleanItems[] = [
            'product_id' => isset($item['id']) ? (int) $item['id'] : null,
            'product_name' => $itemName,
            'quantity' => $qty,
            'unit_price' => $price,
            'subtotal' => $subtotal,
        ];
    }

    if ($cleanItems === []) {
        json_response(['error' => 'No valid cart items were sent.'], 422);
    }

    $pdo->beginTransaction();
    try {
        $nextNumber = ((int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn()) + 1;
        $orderCode = 'UP-B' . str_pad((string) $nextNumber, 2, '0', STR_PAD_LEFT);

        $stmt = $pdo->prepare('
            INSERT INTO orders (order_code, user_id, customer_name, customer_email, address, contact_number, payment_method, status, total_amount)
            VALUES (:order_code, :user_id, :customer_name, :customer_email, :address, :contact_number, :payment_method, :status, :total_amount)
        ');
        $stmt->execute([
            'order_code' => $orderCode,
            'user_id' => current_user_id(),
            'customer_name' => $name,
            'customer_email' => $email !== '' ? $email : null,
            'address' => $address,
            'contact_number' => $contact,
            'payment_method' => $payment !== '' ? $payment : 'Cash on Delivery',
            'status' => 'pending',
            'total_amount' => $total,
        ]);

        $orderId = (int) $pdo->lastInsertId();
        $itemStmt = $pdo->prepare('
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
            VALUES (:order_id, :product_id, :product_name, :unit_price, :quantity, :subtotal)
        ');

        foreach ($cleanItems as $item) {
            $itemStmt->execute([
                'order_id' => $orderId,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['subtotal'],
            ]);
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    json_response([
        'id' => '#' . $orderCode,
        'customer' => [
            'name' => $name,
            'address' => $address,
            'contact' => $contact,
            'email' => $email,
        ],
        'items' => array_map(static function (array $item): array {
            return [
                'name' => $item['product_name'],
                'qty' => $item['quantity'],
                'price' => $item['unit_price'],
            ];
        }, $cleanItems),
        'payment' => $payment,
        'status' => 'pending',
        'total' => $total,
        'createdAt' => date('c'),
    ], 201);
}
