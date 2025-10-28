// src/edit.js
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  ToggleControl,
  Spinner,
  TextControl,
  Button,
} from "@wordpress/components";
import { useEffect, useState, useMemo, useRef } from "@wordpress/element";
import { useSelect } from "@wordpress/data";

import ServerSideRender from "@wordpress/server-side-render";

// Attribut-Merker: Werte pro postType merken/wiederherstellen
function usePostTypeAttributeMemory(
  postType,
  attributeName,
  value,
  setAttributes,
  shouldReset = () => false,
  resetTo = false,
) {
  // Internes Speicherobjekt, das je postType den zuletzt gesetzten Wert hält
  const memoryRef = useRef({});

  useEffect(() => {
    if (!postType) return;

    // Wenn dieser postType zurückgesetzt werden soll, dann setze den Attributwert auf resetTo
    if (shouldReset(postType)) {
      if (value !== resetTo) {
        setAttributes({ [attributeName]: resetTo });
      }
      return;
    }

    // Falls es einen gespeicherten Wert für diesen postType gibt, wende ihn an
    if (postType in memoryRef.current) {
      if (
        typeof setAttributes === "function" &&
        postType in memoryRef.current
      ) {
        setAttributes({ [attributeName]: memoryRef.current[postType] });
      }
    }
  }, [postType]);

  useEffect(() => {
    // Speichere den aktuellen Wert nur, wenn kein Reset für diesen postType gelten soll
    if (!shouldReset(postType)) {
      memoryRef.current[postType] = value;
    }
  }, [postType, value]);
}

export default function Edit({ attributes, setAttributes }) {
  const {
    postType,
    sortMode,
    sortOrder,
    postCount,
    breakpoints,
    selectedPageId,
    selectedPageParent,
    filterFutureDates,
    selectedTaxonomyTerm,
    layoutStyle,
  } = attributes;

  // Lokale UI-Zustände
  const [loading, setLoading] = useState(true);
  const [localPostCount, setLocalPostCount] = useState(postCount ?? "");
  const [localBreakpoints, setLocalBreakpoints] = useState(breakpoints ?? []);

  // Inhaltstypen-Auswahl
  const [postTypeOptions, setPostTypeOptions] = useState([]);

  // Seitenstruktur (page)
  const [parentPages, setParentPages] = useState([]);
  const [hasPageChildren, setHasPageChildren] = useState(false);

  // Datumsseiten (datetime-page)
  const [datetimePages, setDatetimePages] = useState([]);
  const [loadingDatetimePages, setLoadingDatetimePages] = useState(false);
  const [hasDatetimeBlock, setHasDatetimeBlock] = useState(false);

  // Taxonomien (bildungsangebote)
  const [taxonomyTerms, setTaxonomyTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  // Kombinierte Attributs-Signatur für SSR-Rendering
  function buildSafeAttributesAndKey(attributes) {
    const {
      postType,
      sortMode,
      sortOrder,
      postCount,
      breakpoints,
      selectedPageId,
      selectedPageParent,
      filterFutureDates,
      selectedTaxonomyTerm,
      layoutStyle,
    } = attributes;

    const safeAttrs = {
      postType,
      sortMode,
      sortOrder,
      postCount:
        typeof postCount === "string"
          ? parseInt(postCount, 10) || null
          : postCount,
      breakpoints: Array.isArray(breakpoints) ? breakpoints : [],
      selectedPageId: Number.isFinite(selectedPageId) ? selectedPageId : 0,
      selectedPageParent: Number.isFinite(selectedPageParent)
        ? selectedPageParent
        : null,
      filterFutureDates: !!filterFutureDates,
      selectedTaxonomyTerm: selectedTaxonomyTerm ?? "",
      layoutStyle: layoutStyle || "standard", // 👈 hier ergänzt
    };

    const key = Object.values(safeAttrs)
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join("|");

    return { safeAttrs, key: `ud-loop-${key}` };
  }

  const { safeAttrs, key } = buildSafeAttributesAndKey(attributes);

  // Lokale Kopien synchronisieren
  useEffect(() => {
    setLocalPostCount(postCount ?? "");
  }, [postCount]);

  useEffect(() => {
    setLocalBreakpoints(breakpoints ?? []);
  }, [breakpoints]);

  /* =============================================================== *\
	   Speichere oder stelle Attributwerte abhängig vom postType wieder her
	\* =============================================================== */
  // Merke: DATUM-FILTER: Nur aktiv bei bestimmten CPTs
  usePostTypeAttributeMemory(
    postType,
    "filterFutureDates",
    filterFutureDates,
    setAttributes,
    (pt) => pt === "page" || pt === "ud_news",
  );

  // Merke: Sortieroptionen  (datetime-block, published, menu-order)
  usePostTypeAttributeMemory(postType, "sortMode", sortMode, setAttributes);
  usePostTypeAttributeMemory(postType, "sortOrder", sortOrder, setAttributes);

  // Merke: Beitragsanzahl (lokal & im Attribut)
  usePostTypeAttributeMemory(postType, "postCount", postCount, setAttributes);

  // Merke: Responsive Breakpoints
  usePostTypeAttributeMemory(
    postType,
    "breakpoints",
    breakpoints,
    setAttributes,
  );

  // Merke: Taxonomie-Terms: Nur für ud_bildungsangebote
  usePostTypeAttributeMemory(
    postType,
    "selectedTaxonomyTerm",
    selectedTaxonomyTerm,
    setAttributes,
  );

  /* =============================================================== *\
	   Initiale Daten laden: Sichtbare postTypes, Elternseiten
	\* =============================================================== */
  useEffect(() => {
    const excluded = [
      // WordPress Core Post-Types, die irrelevant sind
      "attachment",
      "nav_menu_item",
      "revision",
      "wp_block",
      "wp_template",
      "wp_template_part",
      "wp_navigation",
      "wp_global_styles",
      "wp_font_family",
      "wp_font_face",
    ];

    Promise.all([
      fetch("/wp-json/ud/v1/visible-post-types").then((res) => res.json()),
      fetch("/wp-json/ud/v1/pages-with-children").then((res) => res.json()),
    ])
      .then(([types, pagesWithChildren]) => {
        // Falls es "page"-Einträge mit Kindern gibt, füge sie hinzu
        if (
          pagesWithChildren.length > 0 &&
          !types.find((t) => t.value === "page")
        ) {
          types.push({
            label: __("Unterseiten", "ud-loop"),
            value: "page",
          });
        }

        // Füge "datetime-page" als statische Option hinzu
        types.push({
          label: __("Einzelseite mit Datum-Blocks", "ud-loop"),
          value: "datetime-page",
        });

        setPostTypeOptions(types);

        // Wenn kein postType gesetzt ist, verwende ersten verfügbaren
        if (!attributes.postType && types.length > 0) {
          setAttributes({ postType: types[0].value });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* =============================================================== *\
	   Datumshandling:
	   - datetime-page: verfügbare Seiten mit Datum-Block
	   - andere CPTs: prüfen, ob Datumsblock vorhanden
	\* =============================================================== */

  useEffect(() => {
    if (postType !== "datetime-page") {
      setHasDatetimeBlock(false);
      setDatetimePages([]);
      return;
    }

    setHasDatetimeBlock(true);
    setAttributes({ sortMode: "datetime-block" });

    setLoadingDatetimePages(true);

    fetch("/wp-json/ud-loop-block/v1/datetime-pages")
      .then((res) => res.json())
      .then((pages) => {
        setDatetimePages(pages);

        // Wenn nur eine Seite gefunden und keine gewählt → automatisch setzen
        if (
          pages.length === 1 &&
          (!Number.isFinite(selectedPageId) ||
            parseInt(selectedPageId, 10) <= 0)
        ) {
          const id = parseInt(pages[0].id, 10);
          setAttributes({ selectedPageId: isNaN(id) ? 0 : id });
        }
      })
      .catch(() => setDatetimePages([]))
      .finally(() => setLoadingDatetimePages(false));
  }, [postType]);

  useEffect(() => {
    if (!postType || postType === "datetime-page") return;

    fetch(`/wp-json/ud/v1/has-datetime-block/${postType}`)
      .then((res) => res.json())
      .then((result) => {
        setHasDatetimeBlock(result.found);

        if (!result.found && sortMode === "datetime-block") {
          setAttributes({ sortMode: "published" });
        }
      })
      .catch((err) => {
        console.warn("Fehler beim Laden von has-datetime-block:", err);
      });
  }, [postType]);

  /* =============================================================== *\
	   Seitenstruktur für postType "page":
	   - Elternseiten laden
	   - Auswahl zurücksetzen bei CPT-Wechsel
	\* =============================================================== */

  useEffect(() => {
    if (postType !== "page") {
      setAttributes({
        selectedPageParent: null,
      });
    }
  }, [postType]);

  useEffect(() => {
    if (postType !== "page") return;

    fetch("/wp-json/ud/v1/pages-with-children")
      .then((res) => res.json())
      .then((data) => {
        setParentPages(data);
        setHasPageChildren(data.length > 0);
      });
  }, [postType]);

  /* =============================================================== *\
	   Bildungsangebote:
	   - Taxonomie "bildungsbereich" laden
	   - Standardwert setzen
	\* =============================================================== */

  useEffect(() => {
    if (postType !== "ud_bildungsangebote") return;

    setLoadingTerms(true);
    fetch("/wp-json/ud/v1/bildungsbereiche")
      .then((res) => res.json())
      .then((terms) => {
        setTaxonomyTerms(terms);
      })
      .catch(() => {
        setTaxonomyTerms([]);
      })
      .finally(() => {
        setLoadingTerms(false);
      });
  }, [postType]);

  useEffect(() => {
    if (
      postType === "ud_bildungsangebote" &&
      taxonomyTerms.length > 0 &&
      !attributes.selectedTaxonomyTerm
    ) {
      setAttributes({
        selectedTaxonomyTerm: taxonomyTerms[0].slug,
      });
    }
  }, [postType, taxonomyTerms]);

  /* =============================================================== *\
	   Kindseiten-Analyse:
	   - Unterseiten einer Elternseite laden
	   - prüfen, ob ein datetime-block enthalten ist
	\* =============================================================== */
  const pages = useSelect(
    (select) =>
      select("core").getEntityRecords("postType", "page", {
        per_page: -1,
      }),
    [],
  );

  const childPages = useSelect(
    (select) => {
      if (!selectedPageParent) return [];
      return select("core").getEntityRecords("postType", "page", {
        per_page: -1,
        parent: selectedPageParent,
      });
    },
    [selectedPageParent],
  );

  // Prüfen, ob eine dieser Unterseiten den Datumsblock enthält
  const hasDatetimeBlockInChildPages = useMemo(() => {
    if (!childPages || childPages.length === 0) return false;
    return childPages.some((page) =>
      page?.content?.rendered?.includes("ud/datetime-block"),
    );
  }, [childPages]);

  /* =============================================================== *\
	   Unterstützt Sortierung nach Datum?
	   ergibt sich aus postType, Kindseiten oder Blockprüfung
	\* =============================================================== */
  let supportsDatetimeSort = false;

  if (postType === "datetime-page") {
    supportsDatetimeSort = true;
  } else if (postType === "page" && hasDatetimeBlockInChildPages) {
    supportsDatetimeSort = true;
  } else if (hasDatetimeBlock) {
    supportsDatetimeSort = true;
  }

  /* =============================================================== *\
  	   Hilfsfunktionen für Breakpoint-Verwaltung im Panel
	\* =============================================================== */
  // Lokalen Breakpoint-Eintrag aktualisieren (z. B. maxWidth oder items)
  const updateLocalBreakpoint = (index, field, value) => {
    const updated = [...localBreakpoints];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value, 10) || 0,
    };
    setLocalBreakpoints(updated);
  };

  // Breakpoint hinzufügen
  const addLocalBreakpoint = () => {
    setLocalBreakpoints([...localBreakpoints, { maxWidth: 0, items: 0 }]);
  };

  // Breakpoint entfernen
  const removeLocalBreakpoint = (index) => {
    const updated = [...localBreakpoints];
    updated.splice(index, 1);
    setLocalBreakpoints(updated);
    setAttributes({ breakpoints: updated });
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Inhaltsquelle", "ud-loop")} initialOpen={false}>
          {loading ? (
            <Spinner />
          ) : (
            <SelectControl
              label={__("Inhaltstyp wählen", "ud-loop")}
              value={postType}
              options={postTypeOptions}
              onChange={(value) => setAttributes({ postType: value })}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />
          )}

          {postType === "ud_bildungsangebote" && (
            <SelectControl
              label={__("Bildungsbereich", "ud-loop")}
              value={attributes.selectedTaxonomyTerm ?? ""}
              options={[
                {
                  label: __("Bitte wählen", "ud-loop"),
                  value: "",
                },
                ...taxonomyTerms.map((term) => ({
                  label: term.name,
                  value: term.slug,
                })),
              ]}
              onChange={(value) => {
                setAttributes({ selectedTaxonomyTerm: value });
              }}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />
          )}

          {postType === "page" && hasPageChildren && (
            <SelectControl
              label={__("Elternseite wählen", "ud-loop")}
              help={__(
                "Es wird der Titel und das Beitragsbild angezeigt",
                "ud-loop",
              )}
              value={attributes.selectedPageParent ?? ""}
              options={[
                {
                  label: __("Bitte wählen", "ud-loop"),
                  value: "",
                },
                ...parentPages.map((page) => ({
                  label: page.title,
                  value: page.id,
                })),
              ]}
              onChange={(value) => {
                const parsed = parseInt(value, 10);
                setAttributes({
                  selectedPageParent: isNaN(parsed) ? null : parsed,
                });
              }}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />
          )}

          {postType === "datetime-page" && (
            <SelectControl
              label={__("Seite wählen", "ud-loop")}
              value={attributes.selectedPageId}
              options={
                loadingDatetimePages
                  ? [
                      {
                        label: __("Lade Seiten...", "ud-loop"),
                        value: 0,
                      },
                    ]
                  : datetimePages.length > 0
                  ? datetimePages.map((page) => ({
                      label: page.title,
                      value: page.id,
                    }))
                  : [
                      {
                        label: __(
                          "Keine Seite mit Datum-Zeit-Blocks gefunden",
                          "ud-loop",
                        ),
                        value: 0,
                      },
                    ]
              }
              onChange={(value) => {
                const parsed = parseInt(value, 10);

                setAttributes({
                  selectedPageId: isNaN(parsed) ? 0 : parsed,
                });
              }}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />
          )}
        </PanelBody>
        <PanelBody title={__("Sortierung ", "ud-loop")} initialOpen={false}>
          <SelectControl
            label={__("Sortierung nach", "ud-loop")}
            value={sortMode}
            options={
              postType === "datetime-page"
                ? [
                    {
                      label: __("Datum-Zeit-Block", "ud-loop"),
                      value: "datetime-block",
                    },
                  ]
                : [
                    {
                      label: __("Veröffentlichung", "ud-loop"),
                      value: "published",
                    },
                    hasDatetimeBlock && {
                      label: __("Datum-Zeit-Block", "ud-loop"),
                      value: "datetime-block",
                    },
                    {
                      label: __("Menü-Order (manuell)", "ud-loop"),
                      value: "menu-order",
                    },
                  ].filter(Boolean) // ← entfernt ggf. das leere Element, wenn hasDatetimeBlock false ist
            }
            onChange={(value) => setAttributes({ sortMode: value })}
            __next40pxDefaultSize={true}
            __nextHasNoMarginBottom={true}
          />

          {sortMode !== "menu-order" && (
            <SelectControl
              label={__("Sortierreihenfolge", "ud-loop")}
              value={attributes.sortOrder}
              options={[
                {
                  label: __("Aufsteigend", "ud-loop"),
                  value: "ASC",
                },
                {
                  label: __("Absteigend", "ud-loop"),
                  value: "DESC",
                },
              ]}
              onChange={(value) => setAttributes({ sortOrder: value })}
              __next40pxDefaultSize={true}
              __nextHasNoMarginBottom={true}
            />
          )}
        </PanelBody>
        <PanelBody
          title={__("Anzeigeoptionen ", "ud-loop")}
          initialOpen={false}
        >
{postType === "datetime-page" && (
<>
          <SelectControl
            label={__("Layout-Variante", "ud-loop")}
            value={attributes.layoutStyle}
            options={[
              { label: __("Standard", "ud-loop"), value: "standard" },
              {
                label: __("Kompakte Kartenansicht", "ud-loop"),
                value: "compact",
              },
            ]}
            onChange={(value) => setAttributes({ layoutStyle: value })}
            __next40pxDefaultSize={true}
            __nextHasNoMarginBottom={true}
          />
</>
)}
<TextControl
  label={__("Maximale Beitragsanzahl", "ud-loop")}
  type="number"
  min="1"
  value={String(localPostCount ?? "")} // immer String
  onChange={(val) => {
    // val kommt aus dem Input-Feld: meist String oder undefined
    setLocalPostCount(val?.toString().trim() ?? "");
  }}
  onBlur={() => {
    const trimmed = String(localPostCount ?? "").trim();

    if (trimmed === "") {
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


          {postType !== "page" && postType !== "ud_news" && (
            <>
              <ToggleControl
                label={__("Nur zukünftige Einträge anzeigen", "ud-loop")}
                checked={!!filterFutureDates}
                onChange={(value) => {
                  setAttributes({ filterFutureDates: value });
                }}
                __nextHasNoMarginBottom={true}
              />
            </>
          )}
        </PanelBody>
        <PanelBody title={__("Breakpoints ", "ud-loop")} initialOpen={false}>
          {localBreakpoints.map((bp, i) => (
            <fieldset
              key={i}
              style={{
                border: "1px solid rgb(153 192 148)",
                padding: "1em",
                marginBottom: "1em",
                borderRadius: "4px",
                background: "#e5f3e2",
              }}
            >
              <legend
                style={{
                  background: "#fff",
                  borderRadius: "4px",
                  padding: "0 5px",
                  border: "1px solid #ccc",
                }}
              >
                {__("Breakpoint", "ud-loop")} {i + 1}
              </legend>
              <TextControl
                label={__("Bis Fensterbreite (px)", "ud-loop")}
                type="number"
                min="300"
                value={bp.maxWidth}
                onChange={(val) => updateLocalBreakpoint(i, "maxWidth", val)}
                onBlur={() =>
                  setAttributes({
                    breakpoints: localBreakpoints,
                  })
                }
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
              />
              <TextControl
                label={__("Beiträge anzeigen (maximal)", "ud-loop")}
                type="number"
                min="1"
                value={bp.items}
                onChange={(val) => updateLocalBreakpoint(i, "items", val)}
                onBlur={() =>
                  setAttributes({
                    breakpoints: localBreakpoints,
                  })
                }
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
              />
              <Button
                isDestructive
                variant="link"
                onClick={() => removeLocalBreakpoint(i)}
                style={{ marginTop: "4px" }}
              >
                {__("Entfernen", "ud-loop")}
              </Button>
            </fieldset>
          ))}

          <Button variant="secondary" onClick={addLocalBreakpoint}>
            {__("Breakpoint hinzufügen", "ud-loop")}
          </Button>
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        {postType === "datetime-page" ? (
          !Array.isArray(pages) || pages.length === 0 || !selectedPageId ? (
            <p style={{ padding: "1rem", color: "#666" }}>
              Lade gültige Seiten oder Auswahl …
            </p>
          ) : pages.some((page) => page.id === selectedPageId) ? (
            <ServerSideRender
              block="ud/loop-block"
              attributes={safeAttrs}
              key={key}
            />
          ) : (
            <p style={{ padding: "1rem", color: "darkred" }}>
              Die gewählte Seite ist nicht gültig.
            </p>
          )
        ) : (
          <ServerSideRender
            block="ud/loop-block"
            attributes={safeAttrs}
            key={key}
          />
        )}
      </div>
    </>
  );
}
