<?php
/**
 * helpers.php – Hilfsfunktionen für dynamisches Rendering und Kontextvererbung
 *
 * - Übergibt Kontext (z. B. postId) an verschachtelte Blöcke
 * - Rendert einzelne Blöcke mit erweitertem Kontext
 * - Extrahiert Start-/Enddatum aus ud/datetime-block (rekursiv)
 * - Prüft rekursiv, ob bestimmte Blöcke enthalten sind
 * - Findet spezifische Block-Gruppen mit Teaser-Styling
 *
 * Wird vom Loop-Block bei der dynamischen Ausgabe verwendet.
 */

defined('ABSPATH') || exit;

// Kontext an verschachtelte Blöcke übergeben
function ud_set_block_context_recursive($block, $context) {
	if (!isset($block['context'])) {
		$block['context'] = [];
	}
	$block['context'] = array_merge($block['context'], $context);

	if (!empty($block['innerBlocks'])) {
		foreach ($block['innerBlocks'] as $index => $inner) {
			$block['innerBlocks'][$index] = ud_set_block_context_recursive($inner, $context);
		}
	}

	return $block;
}

// Einzelnen Block mit postId-Kontext rendern
function ud_render_block_with_post_id($block, $post_id) {
	$context = [ 'postId' => $post_id ];

	if (!isset($block['context'])) {
		$block['context'] = [];
	}
	$block['context'] = array_merge($block['context'], $context);

	if (!empty($block['innerBlocks'])) {
		foreach ($block['innerBlocks'] as $index => $inner) {
			$block['innerBlocks'][$index] = ud_set_block_context_recursive($inner, $context);
		}
	}

	return (new WP_Block($block, $context))->render();
}

// datetime-block Start-/Endzeit auslesen
function ud_extract_datetime_range($blocks) {
	foreach ($blocks as $block) {
		if ($block['blockName'] === 'ud/datetime-block') {
			return [
				'start' => $block['attrs']['start'] ?? null,
				'end'   => $block['attrs']['end'] ?? null,
			];
		}
		if (!empty($block['innerBlocks'])) {
			$found = ud_extract_datetime_range($block['innerBlocks']);
			if ($found) return $found;
		}
	}
	return null;
}

// Block rekursiv finden
function ud_contains_block_recursive($blocks, $target_block) {
	foreach ($blocks as $block) {
		if (isset($block['blockName']) && $block['blockName'] === $target_block) {
			return true;
		}
		if (!empty($block['innerBlocks']) && ud_contains_block_recursive($block['innerBlocks'], $target_block)) {
			return true;
		}
	}
	return false;
}

// Teaser-Gruppe finden
function ud_find_teaser_group_block($blocks) {
	foreach ($blocks as $block) {
		if (
			isset($block['blockName']) &&
			$block['blockName'] === 'core/group' &&
			isset($block['attrs']['className']) &&
			str_contains($block['attrs']['className'], 'is-style-teaser-block')
		) {
			return $block;
		}
		if (!empty($block['innerBlocks'])) {
			$found = ud_find_teaser_group_block($block['innerBlocks']);
			if ($found) return $found;
		}
	}
	return null;
}
