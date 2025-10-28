<?php

/**
 * api.php – REST-Endpunkte für dynamische Editor-Daten
 *
 * 1. /wp-json/ud/v1/has-datetime-block/<post_type>
 *    → Prüft, ob Beiträge des Typs den Block "ud/datetime-block" enthalten
 *    → Dient der Steuerung der Sortieroptionen im Editor
 *
 * 2. /wp-json/ud/v1/pages-with-children
 *    → Gibt veröffentlichte Seiten zurück, die Kindseiten besitzen
 *    → Ermöglicht die Auswahl von Elternseiten im Loop-Block
 */

defined('ABSPATH') || exit;

// Automatische Sichtbarkeitsmarkierung für relevante Post-Types im Loop-Block
add_action('init', function () {
    global $wp_post_types;

    foreach ($wp_post_types as $type_name => $type_obj) {
        if (
            $type_obj->public &&
            $type_obj->show_in_rest &&
            !in_array($type_name, [
                'attachment',
                'revision',
                'nav_menu_item',
                'wp_block',
                'wp_template',
                'wp_template_part',
                'wp_navigation',
                'wp_global_styles',
                'wp_font_family',
                'wp_font_face',
            ])
        ) {
            $type_obj->ud_visible_in_loop_block = true;
        }
    }
}, 20);

// REST-Endpunkt: Prüft ob datetime-block in Posts vorhanden
add_action('rest_api_init', function () {
    register_rest_route('ud/v1', '/has-datetime-block/(?P<type>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'ud_check_datetime_block_in_posts',
        'permission_callback' => '__return_true',
    ]);
});

function ud_check_datetime_block_in_posts($request) {
    $post_type = sanitize_text_field($request['type']);
    if (!post_type_exists($post_type)) {
        return new WP_Error('invalid_post_type', 'Ungültiger Inhaltstyp', ['status' => 400]);
    }
    if ($post_type === 'datetime-page') {
        return ['found' => true];
    }

    $posts = get_posts([
        'post_type' => $post_type,
        'post_status' => 'publish',
        'posts_per_page' => 20,
        'fields' => 'ids',
    ]);

    foreach ($posts as $post_id) {
        $content = get_post_field('post_content', $post_id);
        $blocks = parse_blocks($content);

        if (ud_block_contains($blocks, 'ud/datetime-block')) {
            return ['found' => true];
        }
    }

    return ['found' => false];
}

// REST-Endpunkt: Seiten mit Kindseiten
add_action('rest_api_init', function () {
    register_rest_route('ud/v1', '/pages-with-children', [
        'methods' => 'GET',
        'callback' => 'ud_get_pages_with_children',
        'permission_callback' => '__return_true',
    ]);
});

function ud_get_pages_with_children() {
    global $wpdb;

    $parent_ids = $wpdb->get_col("
		SELECT post_parent
		FROM {$wpdb->posts}
		WHERE post_type = 'page'
		  AND post_status = 'publish'
		  AND post_parent != 0
		GROUP BY post_parent
	");

    if (empty($parent_ids)) return [];

    $pages = get_posts([
        'post_type' => 'page',
        'post__in' => $parent_ids,
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    ]);

    return array_map(function ($page) {
        return [
            'id'    => $page->ID,
            'title' => get_the_title($page),
        ];
    }, $pages);
}

// NEU: REST-Endpunkt – prüft, ob eine Unterseite eines Parents den datetime-block enthält
add_action('rest_api_init', function () {
    register_rest_route('ud/v1', '/child-has-datetime-block/(?P<parent>\d+)', [
        'methods'  => 'GET',
        'callback' => function ($data) {
            $parent_id = intval($data['parent']);
            if (!$parent_id) {
                return new WP_REST_Response(['hasBlock' => false], 200);
            }

            $child_pages = get_pages([
                'parent'       => $parent_id,
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'hierarchical' => false,
                'number'       => 20,
            ]);

            foreach ($child_pages as $page) {
                if (has_block('ud/datetime-block', $page->post_content)) {
                    return new WP_REST_Response(['hasBlock' => true], 200);
                }
            }

            return new WP_REST_Response(['hasBlock' => false], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

/* =============================================================== *\ 
   Erweiterung Einzelseite mit DateTime-Block
\* =============================================================== */
add_action('rest_api_init', function () {
    register_rest_route('ud-loop-block/v1', '/datetime-pages', [
        'methods'  => 'GET',
        'callback' => 'ud_loop_block_get_datetime_pages',
        'permission_callback' => '__return_true',
    ]);
});

function ud_loop_block_get_datetime_pages() {
    $pages = get_posts([
        'post_type'   => 'page',
        'post_status' => 'publish',
        'numberposts' => -1,
    ]);

    $results = [];

    foreach ($pages as $page) {
        if (has_block('ud/datetime-block', $page->post_content)) {
            $results[] = [
                'id'    => $page->ID,
                'title' => get_the_title($page->ID),
            ];
        }
    }

    return $results;
}

/* =============================================================== *\ 
   REST-Endpunkt: Sichtbare Post-Types für den Editor
\* =============================================================== */
add_action('rest_api_init', function () {
    register_rest_route('ud/v1', '/visible-post-types', [
        'methods' => 'GET',
        'callback' => 'ud_get_visible_post_types',
        'permission_callback' => '__return_true',
    ]);
});

function ud_get_visible_post_types() {
    $types = get_post_types([], 'objects');
    $result = [];

    foreach ($types as $type) {
        if (
            $type->show_in_rest &&
            !empty($type->ud_visible_in_loop_block)
        ) {
            $result[] = [
                'label' => $type->labels->singular_name,
                'value' => $type->name,
            ];
        }
    }

    return $result;
}


/* =============================================================== *\
   REST-Endpoint
\* =============================================================== */
add_action('rest_api_init', function () {
    register_rest_route('ud/v1', '/bildungsbereiche', [
        'methods'  => 'GET',
        'callback' => function () {
            if (!taxonomy_exists('bildungsbereich')) {
                return new WP_REST_Response([], 200); // oder: 404, wenn du es explizit anzeigen willst
            }

            $terms = get_terms([
                'taxonomy'   => 'bildungsbereich',
                'hide_empty' => false,
            ]);

            if (is_wp_error($terms)) {
                return new WP_REST_Response([], 200);
            }

            return new WP_REST_Response(array_map(function ($term) {
                return [
                    'id'    => $term->term_id,
                    'name'  => $term->name,
                    'slug'  => $term->slug,
                ];
            }, $terms), 200);
        },

        'permission_callback' => '__return_true',
    ]);
});
