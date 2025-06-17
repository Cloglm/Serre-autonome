
<?php
session_start();

// Connexion à la base de données
$host = 'aws-0-eu-west-2.pooler.supabase.com';
$port = 5432;
$dbname = 'postgres';
$user = 'postgres.lhhdtpwficaykinzrlaq';
$password = 'afehz:resliuhbhbmqauh:ghb?';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Traitement du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $motdepasse = $_POST['motdepasse'] ?? '';
    $prenom = $_POST['prenom'] ?? '';
    $email = $_POST['email'] ?? '';
    $role = $_POST['role'] ?? '';

    // Vérification des champs
    if (empty($id) || empty($motdepasse) || empty($prenom) || empty($email) || empty($role)) {
        echo "<p style='color:red;'>Tous les champs sont requis.</p>";
    } else {
        try {
            // Vérifier si l'utilisateur existe déjà
            $check = $pdo->prepare("SELECT * FROM utilisateur WHERE email = ?");
            $check->execute([$email]);
            if ($check->rowCount() > 0) {
                echo "<p style='color:red;'>Un utilisateur avec cet e-mail existe déjà.</p>";
            } else {
                // Insérer l'utilisateur (⚠️ à adapter selon la structure exacte de ta table)
                $stmt = $pdo->prepare("INSERT INTO utilisateur (id, mot_de_passe, prenom, email, role) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id, $motdepasse, $prenom, $email, $role]);

                echo "<p style='color:green;'>Inscription réussie !</p>";
                header("Refresh: 2; URL=connexion.php"); // Redirection après 2 secondes
                exit;
            }
        } catch (PDOException $e) {
            echo "<p style='color:red;'>Erreur : " . $e->getMessage() . "</p>";
        }
    }
}
?>




<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulaire d'inscription</title>
    
  <link rel="stylesheet" href="Pageinscription.css">


</head>
<body>

    <form action="/inscription" method="post">
        <h2>Inscription</h2>

        <label for="id">Identifiant :</label>
        <input type="text" id="id" name="id" required>

        <label for="motdepasse">Mot de passe :</label>
        <input type="password" id="motdepasse" name="motdepasse" required>

        <label for="prenom">Prénom :</label>
        <input type="text" id="prenom" name="prenom" required>

        <label for="email">Adresse e-mail :</label>
        <input type="email" id="email" name="email" required>

        <label for="role">Rôle :</label>
        <select id="role" name="role" required>
            <option value="">--Sélectionnez un rôle--</option>
            <option value="utilisateur">Utilisateur</option>
            <option value="admin">Administrateur</option>
            <option value="moderateur">Modérateur</option>
        </select>

        <button type="submit">S'inscrire</button>
    </form>

</body>
</html>