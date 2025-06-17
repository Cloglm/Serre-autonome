<?php
// get_data.php — nouvelle version ▼
header('Content-Type: application/json; charset=utf-8');

/* 1) Connexion PDO
   ───────────────────────────────────────────────────────── */
$host = getenv('DB_HOST') ?: '185.216.26.53';
$db   = getenv('DB_NAME') ?: 'app_g1';      // g1 = numéro de ton groupe
$user = getenv('DB_USER') ?: 'g1b';
$pass = getenv('DB_PASS') ?: 'azertyg1b';

$pdo = new PDO(
    "mysql:host=$host;dbname=$db;charset=utf8mb4",
    $user, $pass,
    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC ]
);

/* 2) Récupération des points sur la dernière heure
   ───────────────────────────────────────────────────────── */
$sensors = ['temperature','humidity','light'];  // mêmes noms que les tables
$out = [];

foreach ($sensors as $tbl) {
    $stmt = $pdo->prepare("
        SELECT UNIX_TIMESTAMP(created_at)*1000 AS x,
               val                           AS y
        FROM   `$tbl`
        WHERE  created_at >= NOW() - INTERVAL 1 WEEK
        ORDER  BY created_at
    ");
    $stmt->execute();
    $out[$tbl] = $stmt->fetchAll();
}

/* 3) JSON pour le front */
echo json_encode($out);
