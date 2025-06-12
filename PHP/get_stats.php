<?php
// get_stats.php
header('Content-Type: application/json; charset=utf-8');

// 1) Connexion PDO
$host = 'herogu.garageisep.com';
$db   = '8tQjb0ov2H_serre_auto';
$user = 'CpZoJWSnPV_serre_auto';
$pass = 'XqUTQ7FjLH2yql3X';
$dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

// 2) Calculer min, max, avg pour chaque capteur
$sensors = [
    'temperature' => 'Temperature',
    'humidity'    => 'Humidity',
    'brightness'  => 'Brightness'
];
$stats = [];

foreach ($sensors as $key => $table) {
    $stmt = $pdo->query("
        SELECT
          MIN(valeur) AS min,
          MAX(valeur) AS max,
          ROUND(AVG(valeur), 2) AS avg
        FROM `$table`
    ");
    $stats[$key] = $stmt->fetch();
}

// 3) Envoyer le JSON
echo json_encode($stats);
