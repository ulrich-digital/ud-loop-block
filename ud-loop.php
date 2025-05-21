<?php
/**
 * Plugin Name:       Loop Block
 * Description:       Dynamischer Loop-Block mit erweiterten Sortier- und Filterfunktionen.
 * Version:           1.0.0
 * Author:            ulrich.digital
 * Author URI:        https://ulrich.digital/
 * License:           GPL-2.0-or-later
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