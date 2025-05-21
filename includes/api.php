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

	$posts = get_posts([
		'post_type' => $post_type,
		'post_status' => 'publish',
		'posts_per_page' => 20,
		'fields' => 'ids',
	]);

	foreach ($posts as $post_id) {
		$content = get_post_field('post_content', $post_id);
		$blocks = parse_blocks($content);

		if (ud_contains_block_recursive($blocks, 'ud/datetime-block')) {
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
