<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accueil</title>
</head>
<body>
    
    <p>ceci est un test : <a href="test.php">Se connecter</a>



</p>

<a href="occurence.php">Test de connection database</a>

<?php
print_r(PDO::getAvailableDrivers());
?>

</body>
</html>