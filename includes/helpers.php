<?php

/**
 * helpers.php – Hilfsfunktionen für dynamisches Rendering und Kontextvererbung
 *
 * - Übergibt Kontext (z. B. postId) an verschachtelte Blöcke
 * - Rendert einzelne Blöcke mit erweitertem Kontext
 * - Extrahiert Start-/Enddatum aus ud/datetime-block (rekursiv)
 * - Prüft rekursiv, ob bestimmte Blöcke enthalten sind
 * - Findet spezifische Block-Gruppen mit Teaser-Styling oder datetime-block
 */

defined('ABSPATH') || exit;

/* =============================================================== *\ 
   Kontext & Rendering
\* =============================================================== */

// Übergibt Kontext an alle verschachtelten Blöcke rekursiv.
function ud_set_block_context_recursive(array $block, array $context): array {
    $block['context'] = array_merge($block['context'] ?? [], $context);

    foreach ($block['innerBlocks'] ?? [] as $i => $inner) {
        $block['innerBlocks'][$i] = ud_set_block_context_recursive($inner, $context);
    }

    return $block;
}

/* =============================================================== *\ 
   Rendert einen Block (und optional "Weiterlesen") im Kontext eines Beitrags.
\* =============================================================== */
function ud_render_block_with_post_id(array $block, int $post_id, string $post_url = '', ?string $start = null, ?string $end = null): string {
    $context = ['postId' => $post_id];
    $block = ud_set_block_context_recursive($block, $context);

    $block_html = (new WP_Block($block, $context))->render();

//    return '<div class="ud-loop-inner">' . $block_html . '</div>';
    return $block_html;
}


/* =============================================================== *\ 
   Extraktion von Daten
\* =============================================================== */

// Sucht rekursiv nach dem ersten ud/datetime-block und gibt Datum-Range zurück.
function ud_extract_datetime_range(array $blocks): ?array {
    foreach ($blocks as $block) {
        if ($block['blockName'] === 'ud/datetime-block') {
            $start = $block['attrs']['startDate'] ?? null;
            $end   = $block['attrs']['endDate'] ?? null;

            // Wenn kein Enddatum gesetzt, Startdatum als Enddatum übernehmen
            if ($start && empty($end)) {
                $end = $start;
            }

            return [
                'start' => $start,
                'end'   => $end,
            ];
        }

        if (!empty($block['innerBlocks'])) {
            $result = ud_extract_datetime_range($block['innerBlocks']);
            if ($result) return $result;
        }
    }
    return null;
}



function ud_extract_all_datetime_ranges(array $blocks): array {
    $ranges = [];
    foreach ($blocks as $block) {
        if (($block['blockName'] ?? '') === 'ud/datetime-block') {
            $start = $block['attrs']['startDate'] ?? null;
            $end   = $block['attrs']['endDate'] ?? null;
            if ($start && empty($end)) {
                $end = $start;
            }
            $ranges[] = [
                'start' => $start,
                'end'   => $end,
            ];
        }

        if (!empty($block['innerBlocks'])) {
            $ranges = array_merge($ranges, ud_extract_all_datetime_ranges($block['innerBlocks']));
        }
    }
    return $ranges;
}


/* =============================================================== *\ 
   Prüft, ob ein Datumsbereich in der Zukunft liegt.
   Ganztägige Einträge zählen bis 23:59:59.
\* =============================================================== */
function ud_is_datetime_range_future(?array $range): bool {
    if (!$range) return false;

    $now = time();
    $start = $range['start'] ?? null;
    $end   = $range['end'] ?? null;

    if (!$start && !$end) return false;

    $startInFuture = false;
    $endInFuture = false;

    if ($start) {
        $isAllDayStart = strlen($start) === 10 || !str_contains($start, 'T');
        $startTimestamp = $isAllDayStart ? strtotime($start . ' 23:59:59') : strtotime($start);
        $startInFuture = $startTimestamp >= $now;
    }

    if ($end) {
        $isAllDayEnd = strlen($end) === 10 || !str_contains($end, 'T');
        $endTimestamp = $isAllDayEnd ? strtotime($end . ' 23:59:59') : strtotime($end);
        $endInFuture = $endTimestamp >= $now;
    }

    return $startInFuture || $endInFuture;
}


/* =============================================================== *\ 
   Suche in Blockstruktur
\* =============================================================== */

// Prüft rekursiv, ob ein bestimmter Blockname im Blockbaum enthalten ist. 
function ud_block_contains(array $blocks, string $target): bool {
    foreach ($blocks as $block) {
        if ($block['blockName'] === $target) return true;
        if (!empty($block['innerBlocks']) && ud_block_contains($block['innerBlocks'], $target)) return true;
    }
    return false;
}


/* =============================================================== *\ 
   Findet den ersten ud/childpage-loop-content-Block im Baum.
\* =============================================================== */
function ud_find_teaser_group_block(array $blocks): ?array {
    foreach ($blocks as $block) {
        if ($block['blockName'] === 'ud/childpage-loop-content') {
            return $block;
        }
        if (!empty($block['innerBlocks'])) {
            $result = ud_find_teaser_group_block($block['innerBlocks']);
            if ($result) return $result;
        }
    }
    return null;
}

/* =============================================================== *\ 
   findet im Bild im ud/childpage-loop-content-Block
\* =============================================================== */
function ud_extract_image_from_teaser_block(array $block): ?string {
    if (($block['blockName'] ?? '') === 'core/image') {
        $id = $block['attrs']['id'] ?? null;

        if ($id) {
            // Alt-Text ermitteln
            $alt = get_post_meta((int) $id, '_wp_attachment_image_alt', true) ?? '';

            // Bild mit srcset, sizes, alt und loading holen
            return wp_get_attachment_image(
                (int) $id,
                'large', // oder 'full', 'medium', je nach Bedarf
                false,
                [
                    'alt' => esc_attr($alt),
                    'loading' => 'eager', // oder 'lazy'
                    'class' => 'teaser-image', // optional
                ]
            );
        }

        // Fallback: direkte URL ohne ID
        if (!empty($block['attrs']['url'])) {
            return '<img src="' . esc_url($block['attrs']['url']) . '" loading="eager">';
        }
    }

    // Rekursiv nach Bild suchen
    foreach ($block['innerBlocks'] ?? [] as $inner) {
        $result = ud_extract_image_from_teaser_block($inner);
        if ($result) {
            return $result;
        }
    }

    return null;
}



/* =============================================================== *\ 
   Findet alle ud/datetime-loop-container-Blöcke (rekursiv).
\* =============================================================== */
function ud_find_datetime_loop_container_blocks(array $blocks): array {
	$matches = [];

	foreach ($blocks as $block) {
		if (
			$block['blockName'] === 'ud/content-for-loop-block' &&
			($block['attrs']['contentType'] ?? '') === 'datetime'
		) {
			$matches[] = $block;
		}
		if (!empty($block['innerBlocks'])) {
			$matches = array_merge($matches, ud_find_datetime_loop_container_blocks($block['innerBlocks']));
		}
	}

	return $matches;
}



/* =============================================================== *\ 
   Gibt alle sichtbaren Post-Types laut Menü zurück.
   (Hilfreich für das Backend-Filtering.)
\* =============================================================== */
function ud_get_visible_post_types_from_menu() {
    global $menu;
    $visible_post_types = [];

    foreach ($menu as $item) {
        if (!isset($item[2])) continue;

        $url = $item[2];
        if (strpos($url, 'edit.php') === 0) {
            parse_str(parse_url($url, PHP_URL_QUERY), $params);
            $post_type = $params['post_type'] ?? 'post';

            if (!in_array($post_type, $visible_post_types)) {
                $visible_post_types[] = $post_type;
            }
        }
    }

    return $visible_post_types;
}



function insert_childpage_buttons($html, $url, $title) {
    libxml_use_internal_errors(true); // Unterdrückt HTML-Parsing-Fehler

    $dom = new DOMDocument();
$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);

    $xpath = new DOMXPath($dom);

    // Suche nach dem <div> mit class="wp-block-group content ..."
    $targetDivs = $xpath->query('//div[contains(@class, "wp-block-group") and contains(@class, "content")]');

    if ($targetDivs->length > 0) {
        $target = $targetDivs->item(0);

        $buttonHtml = '
            <div class="childpage-loop-title">
                <h2 class="wp-block-heading"><a href="' . esc_url($url) . '">' . esc_html($title) . '</a></h2>
            </div>
            <div class="childpage-loop-buttons wp-block-buttons is-content-justification-right is-layout-flex wp-block-buttons-is-layout-flex">
                <div class="wp-block-button is-style-readmore_single">
                    <a class="wp-block-button__link wp-element-button" href="' . esc_url($url) . '">' . esc_html__('Mehr erfahren', 'ud-loop') . '</a>
                </div>
            </div>
        ';

        // Neues Fragment einfügen
        $fragment = $dom->createDocumentFragment();
        $fragment->appendXML($buttonHtml);
        $target->appendChild($fragment);

        // Entferne automatisch hinzugefügte <html>, <body> etc.
        $body = $dom->getElementsByTagName('body')->item(0);
        $finalHtml = '';
        foreach ($body->childNodes as $child) {
            $finalHtml .= $dom->saveHTML($child);
        }

        return $finalHtml;
    }

    return $html; // Wenn nichts gefunden, Original zurückgeben
}

/* =============================================================== *\
   Title
\* =============================================================== */

function ud_process_grundausbildung_html($html, $url) {
	libxml_use_internal_errors(true);
	$dom = new DOMDocument();
$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);

	$xpath = new DOMXPath($dom);

	// 1. Berufsbezeichnung verlinken
	foreach ($xpath->query("//*[contains(@class, 'berufsbezeichnung')]") as $heading) {
		$a = $dom->createElement('a', $heading->textContent);
		$a->setAttribute('href', esc_url($url));
		$a->setAttribute('class', 'berufsbezeichnung-link');

		while ($heading->firstChild) {
			$heading->removeChild($heading->firstChild);
		}
		$heading->appendChild($a);
	}

	// 2. childpage-loop-title entfernen
	foreach ($xpath->query('//div[contains(@class,"childpage-loop-title")]') as $titleBox) {
		$titleBox->parentNode->removeChild($titleBox);
	}

	// 3. body extrahieren
	$body = $dom->getElementsByTagName('body')->item(0);
	$final = '';
	foreach ($body->childNodes as $child) {
		$final .= $dom->saveHTML($child);
	}

	return $final;
}
