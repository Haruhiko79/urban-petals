<?php

declare(strict_types=1);

session_start();

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (($config['app']['install_token'] ?? '') === 'CHANGE_ME_INSTALL_TOKEN') {
    http_response_code(500);
    echo json_encode(['error' => 'Please change the install token in api/config.php first.']);
    exit;
}

$providedToken = $_GET['token'] ?? '';
if (!$providedToken || !hash_equals((string) ($config['app']['install_token'] ?? ''), (string) $providedToken)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid install token.']);
    exit;
}

$dsn = sprintf(
    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
    $config['db']['host'],
    $config['db']['port'],
    $config['db']['name'],
    $config['db']['charset']
);

try {
    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('Could not read schema.sql');
    }
    $pdo->exec($schema);

    $referenceColumnExists = $pdo->prepare("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'orders'
          AND COLUMN_NAME = 'payment_reference'
    ");
    $referenceColumnExists->execute();
    if (!(bool) $referenceColumnExists->fetchColumn()) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(120) DEFAULT NULL AFTER payment_method");
    }

    $userCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $productCount = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    $orderCount = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();

    if ($userCount === 0) {
        $seedUsers = [
            ['Maria', 'Santos', 'maria.admin@urbanpetals.ph', 'super_admin', 'EMP-001', 'Management', '09171234567', 'Quezon City', 'ChangeMe123!'],
            ['Jose', 'Reyes', 'jose.admin@urbanpetals.ph', 'admin', 'EMP-002', 'Operations', '09181234567', 'Tarlac City', 'ChangeMe123!'],
            ['Ana', 'Dela Cruz', 'ana.staff@urbanpetals.ph', 'staff', 'EMP-003', 'Support', '09191234567', 'Antipolo City', 'ChangeMe123!'],
        ];

        $stmt = $pdo->prepare('
            INSERT INTO users (
                first_name, last_name, email, password_hash, role, employee_id, department, phone, city, avatar, status, last_login_at, last_login_ip, sessions_count
            ) VALUES (
                :first_name, :last_name, :email, :password_hash, :role, :employee_id, :department, :phone, :city, :avatar, :status, :last_login_at, :last_login_ip, :sessions_count
            )
        ');

        foreach ($seedUsers as [$firstName, $lastName, $email, $role, $employeeId, $department, $phone, $city, $password]) {
            $stmt->execute([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                'role' => $role,
                'employee_id' => $employeeId,
                'department' => $department,
                'phone' => $phone,
                'city' => $city,
                'avatar' => '🌿',
                'status' => 'offline',
                'last_login_at' => null,
                'last_login_ip' => null,
                'sessions_count' => 0,
            ]);
        }
    }

    if ($productCount === 0) {
        $seedProducts = [
            ['A001', 'Ceramic Pots', 'Pots', 23, 150.00],
            ['A002', 'Shovel', 'Gardening Tools', 12, 500.00],
            ['A003', 'Shear', 'Gardening Tools', 10, 800.00],
            ['A004', 'Plastic Pots', 'Pots', 87, 100.00],
            ['A005', 'Daisy', 'Flowers', 86, 250.00],
            ['A006', 'Succulents', 'Plants', 33, 180.00],
            ['A007', 'Tulips', 'Flowers', 126, 70.00],
        ];

        $stmt = $pdo->prepare('
            INSERT INTO products (item_code, name, category, quantity, price)
            VALUES (:item_code, :name, :category, :quantity, :price)
        ');

        foreach ($seedProducts as [$code, $name, $category, $quantity, $price]) {
            $stmt->execute([
                'item_code' => $code,
                'name' => $name,
                'category' => $category,
                'quantity' => $quantity,
                'price' => $price,
            ]);
        }
    }

    if ($orderCount === 0) {
        $pdo->exec("
            INSERT INTO orders (order_code, customer_name, customer_email, address, contact_number, payment_method, payment_reference, status, total_amount, created_at)
            VALUES
            ('UP-B21', 'Natali Craig', 'natali@example.com', 'Quezon City', '09170001111', 'Cash on Delivery', NULL, 'in-transit', 3050.00, NOW() - INTERVAL 2 DAY),
            ('UP-B22', 'Kate Morrison', 'kate@example.com', 'Tarlac City', '09170002222', 'GCash', 'GC-849201', 'delivered', 2780.00, NOW() - INTERVAL 5 DAY),
            ('UP-B35', 'Drew Cairo', 'drew@example.com', 'Antipolo City', '09170003333', 'Cash on Delivery', NULL, 'pending', 175.00, NOW() - INTERVAL 1 HOUR),
            ('UP-B04', 'Orlando Digg', 'orlando@example.com', 'Baguio City', '09170004444', 'Bank Transfer', 'BT-442091', 'approved', 2750.00, NOW() - INTERVAL 4 HOUR),
            ('UP-B05', 'Andi Lane', 'andi@example.com', 'Marikina City', '09170005555', 'GCash', 'GC-992401', 'cancelled', 50000.00, NOW() - INTERVAL 15 DAY)
        ");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Urban Petals backend installed.',
        'demo_accounts' => [
            ['email' => 'maria.admin@urbanpetals.ph', 'password' => 'ChangeMe123!', 'employee_id' => 'EMP-001'],
            ['email' => 'jose.admin@urbanpetals.ph', 'password' => 'ChangeMe123!', 'employee_id' => 'EMP-002'],
            ['email' => 'ana.staff@urbanpetals.ph', 'password' => 'ChangeMe123!', 'employee_id' => 'EMP-003'],
        ],
    ], JSON_PRETTY_PRINT);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'error' => $exception->getMessage(),
    ]);
}
