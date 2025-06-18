<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accueil</title>
</head>
<body>
    <?php include 'php/header.php'; ?>
    <main>
        <section class="hero">
            <h1>Bienvenue sur les Serres Autonomes</h1>
            <p>Un système éco-responsable de contrôle moteur pour serres, développé par des étudiants de l’ISEP.</p>
            <a href="#projet" class="btn">En savoir plus</a>
        </section>
        <section class="features">
            <div class="feature">Contrôle de l’aération</div>
            <div class="feature">Réponse à la température</div>
            <div class="feature">Simulation via microcontrôleur</div>
        </section>
    </main>
    <section class="more-info" id="projet">
        <h2>À propos du projet</h2>
        <p>
            Notre serre automatique aide à contrôler l’aération et la température à l’intérieur d’une serre. Grâce à des capteurs et des petits moteurs, elle fonctionne toute seule pour créer un bon environnement pour les plantes.
        </p>
    </section>


    <?php include 'php/footer.php'; ?>
</body>
</html>
