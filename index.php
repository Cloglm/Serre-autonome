<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accueil</title>
</head>
<body>
    
    <p>Accès Partie résultats<a href="dashboard.html">Résultats</a>

    <a href="php/Pageinscription.php">inscription</a>

    <a href="php/PageConnection.php">connection</a>



</p>



<?php
print_r(PDO::getAvailableDrivers());
?>

</body>
</html>