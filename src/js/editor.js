/**
 * editor.js – Registrierung und Konfiguration des Blocks im Gutenberg-Editor
 *
 * - Enthält die vollständige Blockdefinition (edit/save)
 * - Nutzt ServerSideRender für dynamische Vorschau
 * - Bezieht editor-spezifische Styles (editor.scss)
 *
 * Funktion:
 * - Rendert Beiträge eines gewählten Inhaltstyps (Post, Page, CPT)
 * - Sortierung nach Veröffentlichungsdatum (via WP_Query) oder Datum-Zeit-Block (manuell)
 * - Reihenfolge: aufsteigend oder absteigend
 * - Limit optional einstellbar
 * - Optional: Breakpoints zur Begrenzung der Beitragsanzahl bei verschiedenen Fenstergrößen
 *
 * Die Ausgabe erfolgt serverseitig, basierend auf Attributen und dynamischer Kontextverarbeitung.
 */


import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {useBlockProps,InspectorControls} from '@wordpress/block-editor';
import {PanelBody,SelectControl,Spinner,TextControl,Button,} from '@wordpress/components';
import { useEffect, useState, useMemo,} from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';

import '../css/editor.scss';


/* =============================================================== *\
   Registrierung des Blocks und seiner Attribute
\* =============================================================== */
registerBlockType('ud/loop-block', {
	apiVersion: 2,
	title: __('Custom Loop Block', 'ud-loop'),
	icon: { 
		src: (<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18.1823 11.6392C18.1823 13.0804 17.0139 14.2487 15.5727 14.2487C14.3579 14.2487 13.335 13.4179 13.0453 12.2922L13.0377 12.2625L13.0278 12.2335L12.3985 10.377L12.3942 10.3785C11.8571 8.64997 10.246 7.39405 8.33961 7.39405C5.99509 7.39405 4.09448 9.29465 4.09448 11.6392C4.09448 13.9837 5.99509 15.8843 8.33961 15.8843C8.88499 15.8843 9.40822 15.781 9.88943 15.5923L9.29212 14.0697C8.99812 14.185 8.67729 14.2487 8.33961 14.2487C6.89838 14.2487 5.73003 13.0804 5.73003 11.6392C5.73003 10.1979 6.89838 9.02959 8.33961 9.02959C9.55444 9.02959 10.5773 9.86046 10.867 10.9862L10.8772 10.9836L11.4695 12.7311C11.9515 14.546 13.6048 15.8843 15.5727 15.8843C17.9172 15.8843 19.8178 13.9837 19.8178 11.6392C19.8178 9.29465 17.9172 7.39404 15.5727 7.39404C15.0287 7.39404 14.5066 7.4968 14.0264 7.6847L14.6223 9.20781C14.9158 9.093 15.2358 9.02959 15.5727 9.02959C17.0139 9.02959 18.1823 10.1979 18.1823 11.6392Z"></path></svg>)
	},
	category: 'widgets',

	attributes: {
		postType: {
			type: 'string',
			default: 'post',
		},
		selectedPageParent: {
			type: 'number',
			default: null,
		},
		displayMode: {
			type: 'string',
			default: 'teaser', 
		},
		sortMode: {
			type: 'string',
			default: 'published',
		},
		sortOrder: {
			type: 'string',
			default: 'DESC',
		},
		breakpoints: {
			type: 'array',
			default: [],
		},		
		postCount: {
			type: 'number',
			default: null,
		},
	},

	/* =============================================================== *\
	   Bearbeitung im Editor (Inspector Controls + Vorschau)
	\* =============================================================== */
	edit({ attributes, setAttributes }) {
		const { postType, sortMode, breakpoints, postCount, sortOrder } = attributes;
		const [parentPages, setParentPages] = useState([]);
		const [hasPageChildren, setHasPageChildren] = useState(false);
		// Lokale States für Optionen und UI-Steuerung
		const [postTypeOptions, setPostTypeOptions] = useState([]);
		const [loading, setLoading] = useState(true);
		const [hasDatetimeBlock, setHasDatetimeBlock] = useState(false);
		const [localPostCount, setLocalPostCount] = useState(postCount ?? '');
		const [localBreakpoints, setLocalBreakpoints] = useState(breakpoints ?? []);

		/* =============================================================== *\
		   Attribute → lokale States synchronisieren
		\* =============================================================== */
		useEffect(() => {
			setLocalPostCount(postCount ?? '');
		}, [postCount]);

		useEffect(() => {
			setLocalBreakpoints(breakpoints ?? []);
		}, [breakpoints]);

/* =============================================================== *\
   selectedPageParent & displayMode zurücksetzen, wenn Inhaltstyp ≠ 'page'
   Verhindert ungültige Attribut-Kombinationen bei anderen Inhaltstypen
\* =============================================================== */
useEffect(() => {
	if (postType !== 'page') {
		setAttributes({
			selectedPageParent: null,
			displayMode: 'teaser', // optional: zurück auf Standard
		});
	}
}, [postType]);



		/* =============================================================== *\
		   Elternseiten laden, wenn Inhaltstyp 'page' ist
		   Der Endpunkt liefert nur Seiten, die Unterseiten besitzen
		\* =============================================================== */
		useEffect(() => {
			if (postType !== 'page') return;

			fetch('/wp-json/ud/v1/pages-with-children')
				.then((res) => res.json())
				.then((data) => {
					if (data.length > 0) {
						setParentPages(data);
						setHasPageChildren(true);
					} else {
						setHasPageChildren(false);
					}
				});
		}, [postType]);


		/* =============================================================== *\
		   Inhaltstypen und Elternseiten laden (einmalig beim Initialisieren)
		   - Holt alle registrierten, sichtbaren Inhaltstypen (außer Systemtypen)
		   - Prüft, ob es Seiten mit Unterseiten gibt, um 'page' ggf. zur Auswahl hinzuzufügen
		   - Setzt initialen postType, falls beim ersten Laden noch keiner gesetzt ist
		\* =============================================================== */
		useEffect(() => {
			const excluded = [
				'attachment',
				'nav_menu_item',
				'revision',
				'wp_block',
				'wp_template',
				'wp_template_part',
				'wp_navigation',
				'wp_global_styles',
				'wp_font_family',
				'wp_font_face',
			];

			Promise.all([
				fetch('/wp-json/wp/v2/types').then((res) => res.json()),
				fetch('/wp-json/ud/v1/pages-with-children').then((res) => res.json())
			])
				.then(([typesData, pagesWithChildren]) => {
					const types = Object.entries(typesData)
						.filter(([key, type]) => !excluded.includes(key) && !!type.name)
						.map(([key, type]) => ({ label: type.name, value: key }));

					// Wenn es Elternseiten gibt → 'page' hinzufügen, falls noch nicht enthalten
					if (pagesWithChildren.length > 0 && !types.find((t) => t.value === 'page')) {
						types.push({ label: __('Seite', 'ud-loop'), value: 'page' });
					}

					setPostTypeOptions(types);

					// Wenn noch kein postType gesetzt wurde (z. B. beim ersten Laden), Standardwert setzen
					if (!attributes.postType && types.length > 0) {
						setAttributes({ postType: types[0].value });
					}
				})
				.finally(() => setLoading(false));
		}, []);


		/* =============================================================== *\
		   Prüfen, ob der Inhaltstyp datetime-block unterstützt
		\* =============================================================== */
		useEffect(() => {
			if (!postType) return;
			fetch(`/wp-json/ud/v1/has-datetime-block/${postType}`)
				.then((res) => res.json())
				.then((result) => {
					setHasDatetimeBlock(result.found);

					// Bei fehlendem datetime-block: zurück zu "published"
					if (!result.found && sortMode === 'datetime-block') {
						setAttributes({ sortMode: 'published' });
					}
				});
		}, [postType]);

		/* =============================================================== *\
		   Breakpoint-Werte lokal bearbeiten
		\* =============================================================== */
		const updateLocalBreakpoint = (index, field, value) => {
			const updated = [...localBreakpoints];
			updated[index] = {
				...updated[index],
				[field]: parseInt(value, 10) || 0,
			};
			setLocalBreakpoints(updated);
		};

		const addLocalBreakpoint = () => {
			setLocalBreakpoints([...localBreakpoints, { maxWidth: 0, items: 0 }]);
		};

		const removeLocalBreakpoint = (index) => {
			const updated = [...localBreakpoints];
			updated.splice(index, 1);
			setLocalBreakpoints(updated);
		};


		/* =============================================================== *\
		   Attribut-Objekt für ServerSideRender vorbereiten
		\* =============================================================== */
		const safeAttributes = useMemo(() => ({
			postType,
			sortMode,
			sortOrder,
			breakpoints,
			postCount,
			selectedPageParent: Number.isInteger(attributes.selectedPageParent) ? attributes.selectedPageParent : null,
			displayMode: attributes.displayMode ?? 'teaser',

		}), [postType, sortMode, sortOrder, breakpoints, postCount, attributes.selectedPageParent, attributes.displayMode]);


		/* =============================================================== *\
		   Editor-UI (InspectorControls + ServerPreview)
		\* =============================================================== */
		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Einstellungen', 'ud-loop')} initialOpen={true}>
						{loading ? (
							<Spinner />
						) : (
							<SelectControl
								label={__('Inhaltstyp wählen', 'ud-loop')}
								value={postType}
								options={postTypeOptions}
								onChange={(value) => setAttributes({ postType: value })}
    							__next40pxDefaultSize={true}
    							__nextHasNoMarginBottom={true}

							/>
						)}

						{postType === 'page' && hasPageChildren && (
							<SelectControl
								label={__('Elternseite wählen', 'ud-loop')}
								help="Es wird der Titel und das Beitragsbild angezeigt"
								value={attributes.selectedPageParent ?? ''}
								options={[
									{ label: __('Bitte wählen', 'ud-loop'), value: '' },
									...parentPages.map((page) => ({
										label: page.title,
										value: page.id,
									})),
								]}
								onChange={(value) => {
									const parsed = parseInt(value, 10);
									setAttributes({ selectedPageParent: isNaN(parsed) ? null : parsed });
								}}
    							__next40pxDefaultSize={true}
    							__nextHasNoMarginBottom={true}
							/>
						)}

						{postType === 'page' && hasPageChildren && attributes.selectedPageParent && (
							<SelectControl
								label={__('Darstellung der Unterseiten', 'ud-loop')}
								help={__('Wählen Sie, wie die Unterseiten angezeigt werden sollen.', 'ud-loop')}
								value={attributes.displayMode}
								options={[
									{ label: __('Teaser-Block verwenden', 'ud-loop'), value: 'teaser' },
									{ label: __('Titel + Beitragsbild anzeigen', 'ud-loop'), value: 'fallback' },
								]}
								onChange={(value) => setAttributes({ displayMode: value })}
    							__next40pxDefaultSize={true}
    							__nextHasNoMarginBottom={true}
							/>
						)}

						<SelectControl
							label={__('Sortierreihenfolge', 'ud-loop')}
							value={attributes.sortOrder}
							options={[
								{ label: __('Aufsteigend', 'ud-loop'), value: 'ASC' },
								{ label: __('Absteigend', 'ud-loop'), value: 'DESC' },
							]}
							onChange={(value) => setAttributes({ sortOrder: value })}
    						__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>

						<SelectControl
							label={__('Sortierung nach', 'ud-loop')}
							value={sortMode}
							options={[
								{ label: __('Veröffentlichung', 'ud-loop'), value: 'published' },
								...(hasDatetimeBlock
									? [{ label: __('Datum-Zeit-Block', 'ud-loop'), value: 'datetime-block' }]
									: []),
								{ label: __('Menü-Order (manuell)', 'ud-loop'), value: 'menu-order' },
							]}
							onChange={(value) => setAttributes({ sortMode: value })}
							__next40pxDefaultSize={true}
    						__nextHasNoMarginBottom={true}
						/>

						<TextControl
							label={__('Maximale Beitragsanzahl', 'ud-loop')}
							type="number"
							min="1"
							value={localPostCount}
							onChange={(val) => setLocalPostCount(val.trim())}
							onBlur={() => {
								const trimmed = localPostCount.trim();

								if (trimmed === '') {
									setAttributes({ postCount: null });
									return;
								}

								const parsed = parseInt(trimmed, 10);
								if (!isNaN(parsed) && parsed >= 1) {
									setAttributes({ postCount: parsed });
								}
							}}
    						__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>

						{/* Breakpoint-Konfiguration */}
						<span className="components-base-control__label" style={{ display: 'block', marginTop: '1.5em', marginBottom: '0.5em', fontWeight: '600' }}>
						Anpassung an Bildschirmgrösse
						</span>
						{localBreakpoints.map((bp, i) => (
							<fieldset
								key={i}
								style={{
								border: '1px solid rgb(153 192 148)',
								padding: '1em',
								marginBottom: '1em',
								borderRadius: '4px',
								background: '#e5f3e2',
								}}
							>
								<legend
								style={{
									background: '#fff',
									borderRadius: '4px',
									padding: '0 5px',
									border: '1px solid #ccc',
								}}>
								Breakpoint {i + 1}
								</legend>
								<TextControl
									label={__('Bis Fensterbreite (px)', 'ud-loop')}
									type="number"
									min="300"
									value={bp.maxWidth}
									onChange={(val) => updateLocalBreakpoint(i, 'maxWidth', val)}
									onBlur={() => setAttributes({ breakpoints: localBreakpoints })}
	    							__next40pxDefaultSize={true}
    								__nextHasNoMarginBottom={true}
								/>
								<TextControl
									label={__('Beiträge anzeigen (maximal)', 'ud-loop')}
									type="number"
									min="1"
									value={bp.items}
									onChange={(val) => updateLocalBreakpoint(i, 'items', val)}
									onBlur={() => setAttributes({ breakpoints: localBreakpoints })}
	    							__next40pxDefaultSize={true}
	    							__nextHasNoMarginBottom={true}
							/>
								<Button
									isDestructive
									variant="link"
									onClick={() => removeLocalBreakpoint(i)}
									style={{ marginTop: '4px' }}
								>
									{__('Entfernen', 'ud-loop')}
								</Button>
							</fieldset>
						))}
						<Button variant="secondary" onClick={addLocalBreakpoint}>
							{__('Breakpoint hinzufügen', 'ud-loop')}
						</Button>
					</PanelBody>
				</InspectorControls>

				<div {...useBlockProps()}>
					<ServerSideRender
						block="ud/loop-block"
						attributes={safeAttributes}
						key={JSON.stringify(safeAttributes)}
					/>
				</div>
			</>
		);
	},

	/* =============================================================== *\
	   Der Block speichert keine Inhalte – reine Server-Logik
	\* =============================================================== */
	save() {
		return null;
	},
});