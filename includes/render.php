<?php

/**
render.php – Server-Side Rendering für den Loop-Block

Diese Datei generiert die dynamische Ausgabe des Blocks „ud/loop-block“ anhand der übergebenen Attribute.

Beiträge werden ausgegeben, basierend auf:
    - Typ (News, Veranstaltungen, Bildungsangebote, Unterseiten)
    - Sortierung
    - optionaler Einschränkungen (z. B. zukünftige Termine)
    - Taxonomien (z. B. Bildungsbereich)

Unterstützte Sonderfälle:
    – Seiten mit Unterseitenstruktur (postType: page)
    – Bildungsangebote mit Taxonomie-Filter
    – Einzelne „datetime-page“ mit speziellen Sortierlogiken
 */

defined('ABSPATH') || exit;


/* =============================================================== *\
   Hauptfunktion für das Server-Side-Rendering des Loop-Blocks.
   Führt Validierung, Query-Aufbau, Ausgabe der Beitragsschleife und Rendering aus.
\* =============================================================== */
function ud_loop_block_render($attributes) {
    ob_start();
    $post_type    = sanitize_text_field($attributes['postType'] ?? 'post');
    $sort_mode    = sanitize_text_field($attributes['sortMode'] ?? 'published');
    $sort_order   = in_array($attributes['sortOrder'] ?? '', ['ASC', 'DESC']) ? $attributes['sortOrder'] : 'DESC';
    $post_count   = is_numeric($attributes['postCount'] ?? null) ? (int) $attributes['postCount'] : -1;
    $breakpoints  = is_array($attributes['breakpoints'] ?? null) ? $attributes['breakpoints'] : [];
    $breakpoints_json = htmlspecialchars(json_encode($breakpoints), ENT_QUOTES, 'UTF-8');
    $layout_style = sanitize_text_field($attributes['layoutStyle'] ?? 'standard'); // 👈 hinzugefügt

    $validation_error = ud_validate_attributes($post_type, $attributes);
    if ($validation_error) return $validation_error;

    $args = ud_build_query_args($post_type, $sort_mode, $sort_order, $attributes);
    $query = new WP_Query($args);
    $posts = ud_prepare_posts($query, $sort_mode, $sort_order, $post_type, $attributes);

    if ($post_count > 0) {
        $posts = array_slice($posts, 0, $post_count);
    }

    if (empty($posts)) {
        echo '<p>' . esc_html__('Keine Beiträge gefunden.', 'ud-loop') . '</p>';
        return ob_get_clean();
    }

    echo '<div ' . get_block_wrapper_attributes(['data-breakpoints' => $breakpoints_json]) . '>';
    if ($post_type !== 'datetime-page') echo '<ul class="ud-loop-list post-type-' . esc_attr($post_type) . '">';

    foreach ($posts as $post) {
        $rendered = ud_render_post_by_type($post_type, $post, $attributes);

        $class = 'post-' . esc_attr($post['id']);
        if ($post_type === 'ud_news' && trim($rendered) === '') $class .= ' is-hidden';

        if ($post_type === 'datetime-page') {
            echo $rendered;
        } else {
            echo '<li class="' . $class . '">' . $rendered . '</li>';
        }
    }

    if ($post_type !== 'datetime-page') echo '</ul>';
    echo '</div>';

    return ob_get_clean();
}


/* =============================================================== *\
   Validiert erforderliche Attribute je nach Post-Typ.
   Gibt eine HTML-Warnung zurück oder null bei Erfolg.
\* =============================================================== */
function ud_validate_attributes($post_type, $attributes) {
    if ($post_type === 'datetime-page') {
        $selected_id = (int) round($attributes['selectedPageId'] ?? 0);
        if ($selected_id <= 0) {
            return '<p>' . esc_html__('Bitte wählen Sie eine gültige Seite aus.', 'ud-loop') . '</p>';
        }
    }
    if ($post_type === 'page' && (!isset($attributes['selectedPageParent']) || !is_numeric($attributes['selectedPageParent']))) {
        return '<p>' . esc_html__('Bitte wählen Sie eine Elternseite aus.', 'ud-loop') . '</p>';
    }
    return null;
}


/* =============================================================== *\
   Erstellt die WP_Query-Argumente basierend auf
    - Post-Typ
    - Sortierung
    - Filtern
\* =============================================================== */
function ud_build_query_args($post_type, $sort_mode, $sort_order, $attributes) {

    $args = [
        'post_type'      => ($post_type === 'datetime-page') ? 'page' : $post_type,
        'post_status'    => 'publish',
        'posts_per_page' => 100,
    ];

    // Spezialfall: datetime-page → einzelne Seite per ID
    if ($post_type === 'datetime-page') {
        $args['post__in'] = [(int) round($attributes['selectedPageId'] ?? 0)];
        $args['posts_per_page'] = 1;
        return $args;
    }

    // Spezialfall: Seiten unter bestimmter Elternseite
    if ($post_type === 'page' && isset($attributes['selectedPageParent'])) {
        $args['post_parent'] = (int) $attributes['selectedPageParent'];
    }

    // Spezialfall: Bildungsangebote nach Taxonomie
    if (
        $post_type === 'ud_bildungsangebote' &&
        !empty($attributes['selectedTaxonomyTerm']) &&
        is_string($attributes['selectedTaxonomyTerm'])
    ) {
        $taxonomy_term = sanitize_text_field($attributes['selectedTaxonomyTerm']);

        if ($taxonomy_term !== '') {

            $args['tax_query'] = [
                [
                    'taxonomy' => 'bildungsbereich',
                    'field'    => 'slug',
                    'terms'    => sanitize_text_field($attributes['selectedTaxonomyTerm']),
                ],
            ];
        }
    }

    // Sortierung
    switch ($sort_mode) {
        case 'published':
            $args['orderby'] = 'date';
            $args['order']   = $sort_order;
            break;

        case 'menu-order':
            $args['orderby'] = 'menu_order title';
            $args['order']   = 'ASC';
            break;

        case 'datetime-block':
            // Keine Änderung am Query, Sortierung erfolgt später in PHP
            break;
    }

    return $args;
}


/* =============================================================== *\
   Führt die eigentliche Schleife aus, bereitet die Beiträge auf,
   filtert nach Datum (optional) und sortiert bei Bedarf.
\* =============================================================== */
function ud_prepare_posts($query, $sort_mode, $sort_order, $post_type, $attributes = []) {
    $posts = [];

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            $blocks = parse_blocks(get_the_content());


            $range = $sort_mode === 'datetime-block'
                ? (ud_extract_all_datetime_ranges($blocks)[0] ?? null)
                : null;
            $start = $range['start'] ?? get_the_date('c');

            if (!empty($attributes['filterFutureDates'])) {
                $ranges = ud_extract_all_datetime_ranges($blocks);
                $has_future = false;
                foreach ($ranges as $r) {
                    if (ud_is_datetime_range_future($r)) {
                        $has_future = true;
                        break;
                    }
                }
                if (!$has_future) {
                    continue; // Beitrag hat nur vergangene Termine → raus
                }
            }

            $posts[] = [
                'id'        => $post_id,
                'title'     => get_the_title(),
                'url'       => get_permalink(),
                'blocks'    => $blocks,
                'context'   => ['postId' => $post_id],
                'raw_start' => $start,
            ];
        }
        wp_reset_postdata();
    }

    if ($sort_mode === 'datetime-block') {
        usort($posts, fn($a, $b) => $sort_order === 'ASC'
            ? strcmp((string) ($a['raw_start'] ?? ''), (string) ($b['raw_start'] ?? ''))
            : strcmp((string) ($b['raw_start'] ?? ''), (string) ($a['raw_start'] ?? '')));
    }

    if (!empty($attributes['postCount']) && is_numeric($attributes['postCount']) && (int)$attributes['postCount'] > 0) {
        $posts = array_slice($posts, 0, (int)$attributes['postCount']);
    }

    return $posts;
}


/* =============================================================== *\
   Wählt je nach Post-Typ die passende Rendering-Methode
\* =============================================================== */
function ud_render_post_by_type($type, $post, $attributes) {
    if ($type === 'datetime-page') {
        return ud_render_datetime_page($post, $attributes);
    }
    return ud_render_content_for_loop_block($post, $attributes);
}




/* =============================================================== *\
   Spezialfall:
   Rendert eine einzelne Seite („datetime-page“) mit mehreren
   Datumsblöcken, sortiert nach Startzeitpunkt.
\* =============================================================== */

function ud_render_datetime_page($post, $attributes) {
    $groups = array_filter(
        $post['blocks'],
        function ($block) use ($attributes) {
            if (
                ($block['blockName'] ?? '') !== 'ud/content-for-loop-block' ||
                (($block['attrs']['contentType'] ?? '') !== 'datetime')
            ) {
                return false;
            }

            if (!empty($attributes['filterFutureDates'])) {
                $ranges = ud_extract_all_datetime_ranges([$block]);
                foreach ($ranges as $range) {
                    if ($range && ud_is_datetime_range_future($range)) {
                        return true; // mindestens ein Datum in der Zukunft
                    }
                }
                return false; // alle Daten vorbei
            }

            return true;
        }
    );

    // Sortierung nach dem frühesten gültigen Startdatum (innerhalb jedes Blocks)
    $sort_order = $attributes['sortOrder'] ?? 'DESC';
    usort($groups, function ($a, $b) use ($sort_order) {
        $a_ranges = ud_extract_all_datetime_ranges([$a]);
        $b_ranges = ud_extract_all_datetime_ranges([$b]);

        // frühestes Datum pro Block nehmen
        $a_time = 0;
        foreach ($a_ranges as $r) {
            if (!empty($r['start'])) {
                $a_time = strtotime($r['start']);
                break;
            }
        }

        $b_time = 0;
        foreach ($b_ranges as $r) {
            if (!empty($r['start'])) {
                $b_time = strtotime($r['start']);
                break;
            }
        }

        return $sort_order === 'ASC' ? $a_time <=> $b_time : $b_time <=> $a_time;
    });
   // 🔢 Begrenzung auf maximale Anzahl (z. B. "3 Termine")
    if (!empty($attributes['postCount']) && is_numeric($attributes['postCount'])) {
        $max = (int) $attributes['postCount'];
        if ($max > 0) {
            $groups = array_slice($groups, 0, $max);
        }
    }
/*
    // Ausgabe
    $rendered = array_map(function ($block) {
        $ranges = ud_extract_all_datetime_ranges([$block]);
        $first  = $ranges[0] ?? null;

        $data_attrs = '';
        if ($first && !empty($first['start'])) {
            $data_attrs .= ' data-start="' . esc_attr($first['start']) . '"';
        }
        if ($first && !empty($first['end'])) {
            $data_attrs .= ' data-end="' . esc_attr($first['end']) . '"';
        }

        return '<li' . $data_attrs . '>' .
            '<div class="wp-block-ud-loop-content is-content-type-datetime-page">' .
            render_block($block) .
            '</div>' .
            '</li>';
    }, $groups);

    return '<ul class="ud-loop-list post-type-datetime-page">' . implode('', $rendered) . '</ul>';
*/

    // Ausgabe
    // Ausgabe
    $layout = $attributes['layoutStyle'] ?? 'standard';

    // Variante: kompakte Kartenansicht – gleiche Struktur wie Standard, aber andere Klasse
if ($layout === 'compact') {
    $rendered = array_map(function ($block) {
        $ranges = ud_extract_all_datetime_ranges([$block]);
        $first  = $ranges[0] ?? null;

        $data_attrs = '';
        if ($first && !empty($first['start'])) {
            $data_attrs .= ' data-start="' . esc_attr($first['start']) . '"';
        }
        if ($first && !empty($first['end'])) {
            $data_attrs .= ' data-end="' . esc_attr($first['end']) . '"';
        }

        // HTML des Blocks holen
        $html = render_block($block);

        // Innerhalb des HTML den Text in <div class="datetime"> nachbearbeiten
        $html = preg_replace_callback(
            '/<div class="datetime"[^>]*>(.*?)<\/div>/s',
            function ($m) {
                $text = wp_strip_all_tags($m[1]);
                // Split bei "•"
                if (strpos($text, '•') !== false) {
                    [$datePart, $timePart] = array_map('trim', explode('•', $text, 2));
                    return sprintf(
                        '<div class="datetime"><span class="date">%s</span><span class="time">%s</span></div>',
                        esc_html($datePart),
                        esc_html($timePart)
                    );
                }
                return $m[0];
            },
            $html
        );

        return '<li' . $data_attrs . ' class="is-compact">' .
            '<div class="wp-block-ud-loop-content is-content-type-datetime-page is-compact-layout">' .
            $html .
            '</div>' .
            '</li>';
    }, $groups);

    return '<ul class="ud-loop-list post-type-datetime-page">' . implode('', $rendered) . '</ul>';
}


    // Standard-Ausgabe (Fallback)
    $rendered = array_map(function ($block) {
        $ranges = ud_extract_all_datetime_ranges([$block]);
        $first  = $ranges[0] ?? null;

        $data_attrs = '';
        if ($first && !empty($first['start'])) {
            $data_attrs .= ' data-start="' . esc_attr($first['start']) . '"';
        }
        if ($first && !empty($first['end'])) {
            $data_attrs .= ' data-end="' . esc_attr($first['end']) . '"';
        }

        return '<li' . $data_attrs . '>' .
            '<div class="wp-block-ud-loop-content is-content-type-datetime-page">' .
            render_block($block) .
            '</div>' .
            '</li>';
    }, $groups);

    return '<ul class="ud-loop-list post-type-datetime-page">' . implode('', $rendered) . '</ul>';






}








/* =============================================================== *\
   Rendert verschachtelte „ud/content-for-loop-block“-Instanzen,
   abhängig vom Inhaltstyp und optionalen Filtern.
\* =============================================================== */
function ud_render_content_for_loop_block($post, $attributes) {
    $output = '';

    foreach ($post['blocks'] as $block) {
        if ($block['blockName'] !== 'ud/content-for-loop-block') {
            continue;
        }

        $block_type  = $block['attrs']['contentType'] ?? '';
        $wanted_type = $attributes['postType'] ?? '';

        if ($wanted_type === 'page') {
            $wanted_type = 'childpage';
        } elseif ($wanted_type === 'veranstaltungen') {
            $wanted_type = 'ud_veranstaltungen';
        }

        // Matching logik
        $matches = (
            $block_type === $wanted_type ||
            ($wanted_type === 'childpage' && $block_type === 'page')
        );

        // Zusätzlicher Filter für Taxonomie
        if (
            $matches &&
            $wanted_type === 'ud_bildungsangebote' &&
            !empty($attributes['selectedTaxonomyTerm'])
        ) {
            $term_slugs = wp_get_post_terms($post['id'], 'bildungsbereich', ['fields' => 'slugs']);
            if (is_wp_error($term_slugs) || !in_array($attributes['selectedTaxonomyTerm'], $term_slugs, true)) {
                $matches = false;
            }
        }

        if (!$matches) {
            continue;
        }

        // Nur filtern, wenn gewünscht
        if (
            $attributes['sortMode'] === 'datetime-block' &&
            !empty($attributes['filterFutureDates']) &&
            !ud_is_datetime_range_future(ud_extract_datetime_range([$block]))
        ) {
            continue;
        }

        $content_html = ud_render_block_with_post_id($block, $post['id'], $post['url']);
        $url = esc_url(get_permalink($post['id']));
        $title = esc_html(get_the_title($post['id']));
        if ($wanted_type === 'childpage') {
            $output .= insert_childpage_buttons($content_html, $url, $title);
        } elseif ($wanted_type === 'ud_bildungsangebote') {
            $modified_html = ud_process_grundausbildung_html($content_html, $url);
            $output .= insert_childpage_buttons($modified_html, $url, '');
        } else {
            $output .= $content_html;
        }
    }

    return $output;
}


/* =============================================================== *\
   Fallback:
   Rendert alle Blöcke eines Beitrags linear, optional mit Datumsfilter.
\* =============================================================== */
function ud_render_generic_blocks($post, $attributes) {
    $output = '';
    foreach ($post['blocks'] as $block) {
        if (!empty($attributes['filterFutureDates']) && !ud_is_datetime_range_future(ud_extract_datetime_range([$block]))) {
            continue;
        }
        $output .= ud_render_block_with_post_id($block, $post['id'], $post['url']);
    }
    return $output;
}
