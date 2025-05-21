<?php
/**
 * render.php – Dynamische Render-Funktion für den Loop-Block
 *
 * - Baut die Ausgabe im Frontend basierend auf den Block-Attributen
 * - Unterstützt:
 *     • postType-Auswahl (inkl. Seiten mit Elternfilter)
 *     • Sortierung nach Veröffentlichungsdatum, Menü-Order oder Datum-Zeit-Block
 *     • Limitierung der Anzahl (postCount)
 *     • Dynamisches Breakpoint-Attribut zur responsiven Steuerung
 * - Nutzt Hilfsfunktionen für Kontextvererbung, Blocksuche und Teaser-Extraktion
 * - Gibt serverseitig HTML aus (via output buffering)
 */

defined('ABSPATH') || exit;


function ud_loop_block_render($attributes) {
    // Attribute auslesen
    $post_type     = isset($attributes['postType']) ? sanitize_text_field($attributes['postType']) : 'post';
    $sort_mode     = isset($attributes['sortMode']) ? sanitize_text_field($attributes['sortMode']) : 'published';
    $sort_order    = isset($attributes['sortOrder']) && in_array($attributes['sortOrder'], ['ASC', 'DESC']) ? $attributes['sortOrder'] : 'DESC';
    $post_count    = isset($attributes['postCount']) && is_numeric($attributes['postCount']) ? (int) $attributes['postCount'] : -1;
    $display_mode  = isset($attributes['displayMode']) && in_array($attributes['displayMode'], ['teaser', 'fallback']) ? $attributes['displayMode'] : 'teaser';

    // Validierung für Seiten mit Elternauswahl
    if ($post_type === 'page' && (!isset($attributes['selectedPageParent']) || !is_numeric($attributes['selectedPageParent']))) {
        return '<p>' . esc_html__('Bitte wählen Sie eine Elternseite aus.', 'ud-loop') . '</p>';
    }

    // Query-Grundlage
    $args = [
        'post_type'      => $post_type,
        'post_status'    => 'publish',
        'posts_per_page' => 100,
    ];

    // Elternseite für Seiten
    if ($post_type === 'page' && isset($attributes['selectedPageParent'])) {
        $args['post_parent'] = (int) $attributes['selectedPageParent'];
    }

    // Sortierung
    if ($sort_mode === 'published') {
        $args['orderby'] = 'date';
        $args['order']   = $sort_order;
    } elseif ($sort_mode === 'menu-order') {
        //$args['orderby'] = ['menu_order' => 'ASC', 'title' => 'ASC'];
        $args['orderby'] = 'menu_order title';
        $args['order'] = 'ASC';
    }

    // Breakpoints
    $breakpoints = (isset($attributes['breakpoints']) && is_array($attributes['breakpoints'])) ? $attributes['breakpoints'] : [];
    $breakpoints_json = htmlspecialchars(json_encode($breakpoints), ENT_QUOTES, 'UTF-8');


    $query = new WP_Query($args);
    $posts = [];

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();

            $post_id = get_the_ID();
            $blocks  = parse_blocks(get_the_content());

            $start = null;
            $now   = time();

            if ($sort_mode === 'datetime-block') {
                $datetime   = ud_extract_datetime_range($blocks);
                $start      = $datetime['start'] ?? null;
                $end        = $datetime['end'] ?? null;
                $start_time = $start ? strtotime($start) : null;
                $end_time   = $end ? strtotime($end) : null;

                // Filterlogik
                if (
                    (is_null($start_time) && is_null($end_time)) ||
                    (!is_null($start_time) && is_null($end_time) && $start_time < $now) ||
                    (is_null($start_time) && !is_null($end_time) && $end_time < $now) ||
                    (!is_null($start_time) && !is_null($end_time) && $start_time < $now && $end_time < $now)
                ) {
                    continue;
                }
            } else {
                $start = get_the_date('c');
            }

            $posts[] = [
                'id'    => $post_id,
                'title' => get_the_title(),
                'url'   => get_permalink(),
                'start' => $start,
            ];
        }
        wp_reset_postdata();
    }

    // Manuelle Sortierung nach datetime-block
    if ($sort_mode === 'datetime-block') {
        usort($posts, function ($a, $b) use ($sort_order) {
            $aVal = $a['start'] ?? '';
            $bVal = $b['start'] ?? '';
            return $sort_order === 'ASC' ? strcmp($aVal, $bVal) : strcmp($bVal, $aVal);
        });
    }

    // Auf gewünschte Anzahl kürzen
    if ($post_count > 0) {
        $posts = array_slice($posts, 0, $post_count);
    }

    // HTML-Ausgabe
    ob_start();

    if (!empty($posts)) {
        $wrapper_attributes = get_block_wrapper_attributes([
            'data-breakpoints' => $breakpoints_json,
        ]);

        echo "<div $wrapper_attributes>";
        echo '<ul class="ud-loop-list post-type-' . esc_attr($post_type) . '">';

        foreach ($posts as $post) {
            $blocks = parse_blocks(get_post_field('post_content', $post['id']));
            $rendered = '';
            $display_mode = isset($attributes['displayMode']) ? $attributes['displayMode'] : 'teaser';

            if ($post_type === 'page') {
                $teaser_block = ud_find_teaser_group_block($blocks);

                if ($display_mode === 'teaser' && $teaser_block) {
                    $rendered = ud_render_block_with_post_id($teaser_block, $post['id']);
                } elseif ($display_mode === 'fallback') {
                    $thumbnail = get_the_post_thumbnail($post['id'], 'medium', ['loading' => 'lazy']);
                    $title     = get_the_title($post['id']);
                    $url       = get_permalink($post['id']);

                    $rendered  = '<div class="ud-loop-default">';

                    if ($thumbnail) {
                        $rendered .= '<div class="ud-loop-default-image">';
                        $rendered .= '<a href="' . esc_url($url) . '">' . $thumbnail . '</a>';
                        $rendered .= '</div>';
                    }

                    $rendered .= '<div class="ud-loop-default-title">';
                    $rendered .= '<a href="' . esc_url($url) . '"><h3>' . esc_html($title) . '</h3></a>';
                    $rendered .= '</div>';

                    // Button
                    $rendered .= '<div class="wp-block-buttons" style="justify-content: right;">';
                    $rendered .= '<div class="wp-block-button">';
                    $rendered .= '<a class="wp-element-button" href="' . esc_url($url) . '">Mehr erfahren</a>';
                    $rendered .= '</div>';
                    $rendered .= '</div>';

                    $rendered .= '</div>'; // .ud-loop-default
                }
            } else {
                // Bei anderen Inhaltstypen: Alle Blöcke wie bisher rendern
                foreach ($blocks as $block) {
                    $rendered .= ud_render_block_with_post_id($block, $post['id']);
                }
            }

            echo '<li class="post-' . $post['id'] . '">';
            echo '<div class="ud-loop-content">' . $rendered . '</div>';
            echo '</li>';
        }
        echo '</ul>';
        echo '</div>';
    } else {
        echo '<p>' . esc_html__('Keine Beiträge gefunden.', 'ud-loop') . '</p>';
    }

    return ob_get_clean();
}
