<?php

/**
 * block.php – Registrierung des Loop-Blocks und zusätzlicher Block-Style
 *
 * - Registriert den Block über block.json (mit dynamischem Render-Callback)
 * - Meldet einen optionalen zusätzlichen Style "Masonry" für den Block an
 */

defined('ABSPATH') || exit;

add_action('init', function () {
    // Isotope registrieren
    if (!wp_script_is('isotope-js', 'registered')) {
        wp_register_script(
            'isotope-js',
            plugins_url('../src/js/libs/isotope.pkgd.min.js', __FILE__),
            [],
            null,
            true
        );
    }

    // Frontend-Script (aus block.json) registrieren mit Abhängigkeit
    wp_register_script(
        'frontend-script',
        plugins_url('../build/frontend-script.js', __FILE__),
        ['isotope-js'], // 💡 HIER die Verbindung
        filemtime(plugin_dir_path(__FILE__) . '../build/frontend-script.js'),
        true
    );

    register_block_type_from_metadata(__DIR__ . '/../', [
        'render_callback' => 'ud_loop_block_render',
        'script' => 'frontend-script', // 👈 WICHTIG: override "script" aus block.json
    ]);
});

