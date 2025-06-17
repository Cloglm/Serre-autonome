<?php
// send_alert.php

// === CONFIG ===
$dbHost   = '127.0.0.1';
$dbName   = 'serre_test';
$dbUser   = 'root';
$dbPass   = '';
$toEmail  = 'allandu97435@gmail.com';    
$fromName = 'Serre Autonome';
$fromMail = 'allandu97435@gmail.com';

// Seuils (min et max) pour chaque capteur
$thresholds = [
    'temperature' => ['min'=>18, 'max'=>28],   // °C
    'humidity'    => ['min'=>40, 'max'=>80],   // %
    'brightness'  => ['min'=>300,'max'=>900],  // lux
];

// === FONCTION POUR ENVOYER UN E-MAIL ===
function sendMail($to, $subject, $body, $fromName, $fromMail) {
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=UTF-8\r\n";
    $headers .= "From: {$fromName} <{$fromMail}>\r\n";
    return mail($to, $subject, $body, $headers);
}

try {
    // Connexion PDO
    $pdo = new PDO(
      "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
      $dbUser, $dbPass,
      [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]
    );

    // Pour chaque capteur : chercher la dernière valeur
    foreach ($thresholds as $sensor => $limits) {
        $stmt = $pdo->prepare("
            SELECT valeur, date_mesure 
            FROM Measurements 
            WHERE sensor_type = :sensor 
            ORDER BY date_mesure DESC 
            LIMIT 1
        ");
        $stmt->execute([':sensor'=>$sensor]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) continue; // pas de données yet

        $value = (float)$row['valeur'];
        $time  = $row['date_mesure'];

        // Vérifier dehors des bornes
        if ($value < $limits['min'] || $value > $limits['max']) {
            $subject = ucfirst($sensor) . " hors seuil sur Serre Autonome";
            $body    = "Alerte : la valeur de {$sensor} observée le {$time} est de {$value}.\n"
                     . "Seuils autorisés : min={$limits['min']} / max={$limits['max']}.\n\n"
                     . "Veuillez vérifier votre installation.";

            if (sendMail($toEmail, $subject, $body, $fromName, $fromMail)) {
                echo "Alerte envoyée pour {$sensor}\n";
            } else {
                echo "Erreur d'envoi mail pour {$sensor}\n";
            }
        } else {
            echo "{$sensor} OK ({$value})\n";
        }
    }

} catch (Exception $e) {
    error_log("send_alert.php ERREUR: ".$e->getMessage());
    echo "Erreur: ".$e->getMessage();
}
