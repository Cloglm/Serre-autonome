<?php
// Ensure session is started on any page that includes this header
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// --- AJOUT: Définir un chemin de base pour les liens dans le header ---
$base_path_for_header = '../'; // Remonte d'un niveau (de HTML/ vers Meetspot/)

// $page_title is set by the individual page before including this header.php
$current_page_basename_header = basename($_SERVER['PHP_SELF']); // Pour la classe 'active'

// --- AJOUT : Logique pour compter les messages non lus ---
$unread_conversations_count = 0;
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true && isset($_SESSION["id"])) {
    $current_user_id_header = $_SESSION["id"];

    // Définir les constantes DB si elles ne le sont pas (au cas où check_maintenance n'est pas inclus avant)
    if (!defined('DB_SERVER')) define('DB_SERVER', 'localhost');
    if (!defined('DB_USERNAME')) define('DB_USERNAME', 'root');
    if (!defined('DB_PASSWORD')) define('DB_PASSWORD', '');
    if (!defined('DB_NAME')) define('DB_NAME', 'users');

    // Connexion rapide pour le compte de messages
    $conn_header_msg = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn_header_msg) {
        mysqli_set_charset($conn_header_msg, "utf8mb4");
        $sql_unread_count = "SELECT COUNT(DISTINCT cp.conversation_id) as unread_count
                             FROM conversation_participants cp
                             JOIN conversations c ON cp.conversation_id = c.id
                             JOIN messages m ON cp.conversation_id = m.conversation_id
                             WHERE cp.user_id = ? AND m.sender_id != ? AND m.sent_at > IFNULL(cp.last_read_at, '1970-01-01 00:00:00')";
        if ($stmt_unread = mysqli_prepare($conn_header_msg, $sql_unread_count)) {
            mysqli_stmt_bind_param($stmt_unread, "ii", $current_user_id_header, $current_user_id_header);
            mysqli_stmt_execute($stmt_unread);
            $result_unread = mysqli_stmt_get_result($stmt_unread);
            if ($row_unread = mysqli_fetch_assoc($result_unread)) {
                $unread_conversations_count = (int)$row_unread['unread_count'];
            }
            mysqli_stmt_close($stmt_unread);
        } else {
            error_log("Header error preparing unread count: " . mysqli_error($conn_header_msg));
        }
        mysqli_close($conn_header_msg);
    } else {
        error_log("Header error connecting to DB for unread count: " . mysqli_connect_error());
    }
}
// --- FIN AJOUT ---

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? htmlspecialchars($page_title) : 'MeetSpot'; ?></title>
    <!-- Utilisation de $base_path_for_header pour les CSS -->
    <link rel="stylesheet" href="<?php echo $base_path_for_header; ?>CSS/main_style.css">
    <link rel="stylesheet" href="<?php echo $base_path_for_header; ?>CSS/header_footer_style.css">
    <link rel="stylesheet" href="<?php echo $base_path_for_header; ?>CSS/forms.css">
    <link rel="stylesheet" href="<?php echo $base_path_for_header; ?>CSS/lobby.css">
    <style>
        /* Style pour le badge de notification dans le header */
        .notification-badge-header {
            background-color: red;
            color: white;
            padding: 2px 6px;
            border-radius: 50%;
            font-size: 0.75em; /* Plus petit que le texte du lien */
            margin-left: 5px;
            vertical-align: super; /* Aligne un peu plus haut */
            line-height: 1;
            display: inline-block; /* Pour que padding et margin fonctionnent bien */
        }
    </style>
    <script>
        function toggleProfileMenu() {
            document.getElementById("profile-menu").classList.toggle("show");
        }
        window.onclick = function(event) {
            if (!event.target.closest('.profile-icon-container')) {
                var dropdowns = document.getElementsByClassName("dropdown-menu");
                for (var i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
        function logout() { if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) { window.location.href = '<?php echo $base_path_for_header; ?>HTML/logout.php'; } }
        function supcompte() { if (confirm("ATTENTION : La suppression de votre compte est irréversible et entraînera la perte de toutes vos données. Voulez-vous vraiment supprimer votre compte ?")) { alert("Fonctionnalité de suppression du compte à implémenter de manière sécurisée."); } }
    </script>
</head>
<body>
<header>
    <nav>
        <div class="logo-container">
            <a href="<?php echo $base_path_for_header; ?>HTML/lobby.php" class="logo-link">
                <img src="<?php echo $base_path_for_header; ?>Images/calendar_icon.jpeg" alt="MeetSpot Logo Icon" class="logo-icon-img">
                <span class="logo-text">MEETSPOT</span>
            </a>
        </div>
        <ul class="nav-links">
            <li><a href="<?php echo $base_path_for_header; ?>HTML/lobby.php" class="<?php echo ($current_page_basename_header == 'lobby.php' ? 'active' : ''); ?>">Réserver</a></li>
            <li>
                <a href="<?php echo $base_path_for_header; ?>HTML/create_event.php" class="nav-button-cta <?php echo ($current_page_basename_header == 'create_event.php' ? 'active-cta' : ''); ?>">Créer un événement</a>
            </li>
            <li><a href="<?php echo $base_path_for_header; ?>HTML/about.php" class="<?php echo ($current_page_basename_header == 'about.php' ? 'active' : ''); ?>">À Propos</a></li>
            <li><a href="<?php echo $base_path_for_header; ?>HTML/faq.php" class="<?php echo ($current_page_basename_header == 'faq.php' ? 'active' : ''); ?>">FAQ</a></li>
        </ul>
        <div class="user-actions">
            <?php if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true): ?>
                <div class="profile-dropdown">
                    <div class="profile-icon-container" onclick="toggleProfileMenu()">
                        <img src="<?php echo isset($_SESSION['profile_pic_path']) ? $base_path_for_header . htmlspecialchars($_SESSION['profile_pic_path']) : $base_path_for_header . 'Images/Icone_profil_2.png'; ?>" alt="Profil" class="profile-icon-img">
                        <?php
                        if (isset($_SESSION["username"]) && isset($_SESSION["role"])) {
                            $username = htmlspecialchars($_SESSION["username"]);
                            $role_display = ($_SESSION["role"] === 'admin') ? 'Admin.' : 'Util.';
                            echo "<span style='margin-left: 8px; font-size: 0.85em; color: #333; white-space: nowrap;'>$username <span style='font-style:italic; color:#555;'>($role_display)</span></span>";
                        }
                        ?>
                    </div>
                    <div id="profile-menu" class="dropdown-menu">
                        <div class="dropdown-header">Bienvenue, <?php echo htmlspecialchars($_SESSION['username'] ?? 'Utilisateur'); ?> !</div>
                        <!-- LIEN MESSAGERIE AVEC BADGE -->
                        <a href="<?php echo $base_path_for_header; ?>HTML/messages.php">
                            💬 Messagerie
                            <?php if ($unread_conversations_count > 0): ?>
                                <span class="notification-badge-header"><?php echo $unread_conversations_count; ?></span>
                            <?php endif; ?>
                        </a>
                        <a href="<?php echo $base_path_for_header; ?>HTML/settings.php">⚙️ Paramètres</a>
                        <a href="<?php echo $base_path_for_header; ?>HTML/my_reservations.php">📅 Réservations</a>
                        <a href="<?php echo $base_path_for_header; ?>HTML/favorite_activities.php">⭐ Activités Favorites</a>
                        <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                            <hr style="margin: 5px 10px; border-top: 1px solid #e0e0e0; border-bottom:0;">
                            <a href="<?php echo $base_path_for_header; ?>admin/index.php" style="font-weight: bold; background-color: #fff3e0; color: #e65100;">🛠️ Administration</a>
                            <a href="<?php echo $base_path_for_header; ?>admin/toggle_maintenance.php" style="background-color: #ffebee; color: #c62828;">🔧 Mode maintenance (Site)</a>
                        <?php endif; ?>
                        <a href="<?php echo $base_path_for_header; ?>HTML/edit_profile.php">✏️ Modifier Profil</a>
                        <hr style="margin: 5px 10px; border-top: 1px solid #e0e0e0; border-bottom:0;">
                        <a href="#" onclick="logout()">🚪 Déconnexion</a>
                        <a href="#" onclick="supcompte()" class="delete-account-link">🗑️ Supprimer le compte</a>
                    </div>
                </div>
            <?php else: ?>
                <a href="<?php echo $base_path_for_header; ?>HTML/connexion.php" class="btn btn-login">Se Connecter / S'inscrire</a>
            <?php endif; ?>
        </div>
    </nav>
</header>
<main>