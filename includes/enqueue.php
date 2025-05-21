<?php

/**
 * enqueue.php – Lädt JavaScript für das Frontend des Loop-Blocks
 *
 * Zweck:
 * - Lädt Isotope.js (direkt aus src/js/libs) nur im Frontend
 * - Lädt das gebündelte JavaScript aus build/frontend.js
 *
 * Hinweise:
 * - Wird über enqueue_block_assets eingebunden (nur außerhalb des Editors)
 * - Styles (CSS) werden ausschließlich über block.json geladen, nicht hier
 */

defined('ABSPATH') || exit;


add_action('enqueue_block_assets', function () {
    if (!is_admin()) {
        // Isotope direkt aus dem Quellverzeichnis laden
        wp_enqueue_script(
            'isotope-js',
            plugins_url('../src/js/libs/isotope.pkgd.min.js', __FILE__),
            [],
            null,
            true
        );

        // Kompilierte Frontend-Datei aus dem Build-Ordner
        wp_enqueue_script(
            'ud-loop-frontend',
            plugins_url('../build/frontend.js', __FILE__),
            ['isotope-js'],
            filemtime(plugin_dir_path(__FILE__) . '../build/frontend.js'),
            true
        );
    }
});
