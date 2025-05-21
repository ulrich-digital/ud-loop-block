/**
 * frontend.js – Verhalten des Loop-Blocks im Frontend
 *
 * - Initialisiert dynamische Frontend-Funktionalität (z. B. Isotope)
 * - Bezieht frontend-spezifische Styles (frontend.scss)
 * - Wird nur im echten Frontend geladen (nicht im Editor)
 *
 * Voraussetzung:
 * - Das HTML-Markup für Beiträge wird serverseitig durch den Block generiert.
 * - Isotope.js muss im globalen Kontext verfügbar sein (über PHP enqueued).
 */

/* =============================================================== *\
   Isotope-Handling:
   - Sucht alle UL-Listen innerhalb von .is-style-masonry-loop
   - Fügt allen direkten <li>-Kindern die Klasse .masonry-item hinzu
   - Initialisiert Isotope mit:
       • layoutMode: "masonry"
       • itemSelector: ".masonry-item"
       • percentPosition für gleichmäßige Spaltenverteilung
       • Übergangsanimation (transitionDuration: 0.3s)
   - Speichert Instanzen zur späteren Verwendung (z. B. bei UI-Toggles)
   - Führt iso.layout() nach kurzer Verzögerung mehrfach aus, um
     Layout-Probleme bei dynamischen Inhalten zu vermeiden
   - Reagiert auf Klicks auf .details-toggle (z. B. Akkordeon),
     um Layout nach Sichtbarkeitswechsel zu aktualisieren
\* =============================================================== */

import '../css/frontend.scss';

const containers = document.querySelectorAll('.is-style-masonry-loop ul.ud-loop-list');
const grids = [];

containers.forEach((container) => {
	// Nur direkte li-Kinder zu Items machen
	Array.from(container.children).forEach((child) => {
		if (child.tagName === 'LI') {
			child.classList.add('masonry-item');
		}
	});

	const iso = new Isotope(container, {
		itemSelector: '.masonry-item',
		layoutMode: 'masonry',
		transitionDuration: '0.3s',
		percentPosition: true,
	});

  	// Speichern, falls später gebraucht
  	grids.push({ container, iso });
	grids.forEach(({ iso }) => {
    	iso.layout(); // immer layouten – optional optimierbar
        setTimeout(() => iso.layout(), 100);
    });
});

// Layout neu berechnen bei Toggle-Klicks
document.querySelectorAll('.details-toggle').forEach((toggle) => {
	toggle.addEventListener('click', () => {
		// Finde das nächste UL innerhalb des gleichen Abschnitts
		grids.forEach(({ iso }) => {
			iso.layout(); // immer layouten – optional optimierbar
			setTimeout(() => iso.layout(), 100);
			setTimeout(() => iso.layout(), 200);
			setTimeout(() => iso.layout(), 300);
		});
	});
});



/* =============================================================== *\ 
   Breakpoint-Handling:
	- Sucht alle .wp-block-ud-loop-block-Container
	- Liest das data-breakpoints-Attribut aus
		– das enthält ein JSON-Array mit Breakpoints (z. B. [{ maxWidth: 1000, items: 3 }]).
	- Parst und sortiert die Breakpoints nach maxWidth aufsteigend
	- Ermittelt die aktuelle Fensterbreite und prüft, welcher Breakpoint zutrifft (z. B. window.innerWidth <= 800).
	- Blendet Listeneinträge (<li>) entsprechend aus oder ein
	- Aktualisiert sich automatisch beim Fenster-Resize mit Debounce (200 ms Verzögerung), um Performance zu schonen.
\* =============================================================== */

function applyUdLoopBreakpoints() {
	const wrappers = document.querySelectorAll('.wp-block-ud-loop-block');
	wrappers.forEach((wrapper) => {
		const breakpointData = wrapper.getAttribute('data-breakpoints');
		if (!breakpointData) return;

		let breakpoints;
		try {
			breakpoints = JSON.parse(breakpointData);
		} catch (e) {
			console.error('Fehler beim Parsen der Breakpoints:', e);
			return;
		}
		
		breakpoints.sort((a, b) => a.maxWidth - b.maxWidth);

		const list = wrapper.querySelector('.ud-loop-list');
		if (!list) return;

		const items = list.querySelectorAll('li');
		if (!items.length) return;

		const width = window.innerWidth;
		let maxItems = null;

		for (const bp of breakpoints) {
			if (width <= bp.maxWidth) {
				maxItems = bp.items;
			}
		}

		// Wenn kein Breakpoint passt: alle anzeigen
		if (!maxItems) {
			items.forEach((item) => (item.style.display = ''));
			return;
		}

		items.forEach((item, index) => {
			item.style.display = index < maxItems ? '' : 'none';
		});
	});
}

// Bei Seitenaufruf
document.addEventListener('DOMContentLoaded', applyUdLoopBreakpoints);

// Bei Resize
window.addEventListener('resize', () => {
	clearTimeout(window.__udLoopResizeTimeout);
	window.__udLoopResizeTimeout = setTimeout(applyUdLoopBreakpoints, 200);
});