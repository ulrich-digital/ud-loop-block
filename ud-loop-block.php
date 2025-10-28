<?php
/**
 * Plugin Name:     UD Block: Erweiterter Loop
 * Description:     Dynamischer Block zur Ausgabe von Beiträgen, Veranstaltungen oder Unterseiten mit erweiterten Sortier- und Filterfunktionen.
 * Version:         1.0.0
 * Author:          ulrich.digital gmbh
 * Author URI:      https://ulrich.digital/
 * License:         GPL v2 or later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     loop-block-ud
 */

/**
 * ud-loop.php – zentrale Einstiegspunkt des Plugins
 *
 * - Enthält nur die Plugin-Metadaten
 * - Lädt automatisch alle PHP-Dateien im Verzeichnis /includes/
 * - Die eigentliche Block-Logik ist modular organisiert (Render, REST, Enqueue etc.)
 */


defined('ABSPATH') || exit;

// Alle PHP-Dateien im includes/-Ordner laden
foreach ([
    'helpers.php',
    'api.php',
    'render.php',
    'block-register.php',
    'enqueue.php'
] as $file) {
    require_once __DIR__ . '/includes/' . $file;
}

// Direktlink zur Einstellungsseite im Plugin-Menü
/*
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $url = admin_url('options-general.php?page=cpm_settings');
    $settings_link = '<a href="' . esc_url($url) . '">Einstellungen</a>';
    array_unshift($links, $settings_link); // ganz vorne einfügen
    return $links;
});
*/