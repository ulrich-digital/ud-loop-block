<?php

/**
 * block.php – Registrierung des Loop-Blocks und zusätzlicher Block-Style
 *
 * - Registriert den Block über block.json (mit dynamischem Render-Callback)
 * - Meldet einen optionalen zusätzlichen Style "Masonry" für den Block an
 */

defined('ABSPATH') || exit;

add_action('init', 'ud_loop_block_register');

function ud_loop_block_register() {
    register_block_type_from_metadata(__DIR__ . '/../', [
        'render_callback' => 'ud_loop_block_render',
    ]);
}

if (function_exists('register_block_style')) {
    register_block_style('ud/loop-block', [
        'name'  => 'masonry-loop',
        'label' => 'Masonry',
    ]);
}
