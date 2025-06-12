<?php
// get_data.php
header('Content-Type: application/json; charset=utf-8');

// 1) Connexion PDO
$host = 'herogu.garageisep.com';
$db   = '8tQjb0ov2H_serre_auto';
$user = 'CpZoJWSnPV_serre_auto';
$pass = 'XqUTQ7FjLH2yql3X';
$dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];
$pdo = new PDO($dsn, $user, $pass, $options);

// 2) Récupérer la dernière heure pour chaque capteur
$sensors = [
    'temperature' => 'Temperature',
    'humidity'    => 'Humidity',
    'brightness'  => 'Brightness'
];
$output = [];

foreach ($sensors as $key => $table) {
    $stmt = $pdo->prepare("
        SELECT
          UNIX_TIMESTAMP(date_mesure) * 1000 AS x,
          valeur AS y
        FROM `$table`
        WHERE date_mesure > NOW() - INTERVAL 1 HOUR
        ORDER BY date_mesure ASC
    ");
    $stmt->execute();
    $output[$key] = $stmt->fetchAll();
}

// 3) Envoyer le JSON
echo json_encode($output);
