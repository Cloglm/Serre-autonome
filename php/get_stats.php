<?php
// get_stats.php — nouvelle version ▼
header('Content-Type: application/json; charset=utf-8');

$pdo = new PDO(
    sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4',
            getenv('DB_HOST') ?: '185.216.26.53',
            getenv('DB_NAME') ?: 'app_g1'),
    getenv('DB_USER') ?: 'g1b',
    getenv('DB_PASS') ?: 'azertyg1b',
    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC ]
);

$sensors = ['temperature','humidity','light'];
$stats   = [];

foreach ($sensors as $tbl) {
    $q = $pdo->query("
        SELECT MIN(val)           AS min,
               MAX(val)           AS max,
               ROUND(AVG(val),2)  AS avg
        FROM   `$tbl`
    ");
    $stats[$tbl] = $q->fetch();
}

echo json_encode($stats);
