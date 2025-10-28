/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./block.json":
/*!********************!*\
  !*** ./block.json ***!
  \********************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"apiVersion":2,"name":"ud/loop-block","title":"Custom Loop Block","category":"widgets","icon":"calendar","description":"Loop-Block mit erweiterten Einstellungen","editorStyle":"file:./build/editor-style.css","style":"file:./build/frontend-style.css","editorScript":"file:./build/editor-script.js","script":"file:./build/frontend-script.js","supports":{"html":false,"className":true},"usesContext":["postId"],"attributes":{"postType":{"type":"string","default":"post"},"selectedPageId":{"type":"number","default":0},"filterFutureDates":{"type":"boolean","default":false},"selectedPageParent":{"type":["number","null","string"],"default":null},"sortMode":{"type":"string","default":"published"},"sortOrder":{"type":"string","default":"DESC"},"breakpoints":{"type":"array","default":[]},"postCount":{"type":["number","null","string"],"default":null},"showReadMore":{"type":"boolean","default":false},"selectedTaxonomyTerm":{"type":"string","default":""},"layoutStyle":{"type":"string","default":"standard"}}}');

/***/ }),

/***/ "./src/js/edit.js":
/*!************************!*\
  !*** ./src/js/edit.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/server-side-render */ "@wordpress/server-side-render");
/* harmony import */ var _wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
// src/edit.js







// Attribut-Merker: Werte pro postType merken/wiederherstellen

function usePostTypeAttributeMemory(postType, attributeName, value, setAttributes, shouldReset = () => false, resetTo = false) {
  // Internes Speicherobjekt, das je postType den zuletzt gesetzten Wert hält
  const memoryRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)({});
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!postType) return;

    // Wenn dieser postType zurückgesetzt werden soll, dann setze den Attributwert auf resetTo
    if (shouldReset(postType)) {
      if (value !== resetTo) {
        setAttributes({
          [attributeName]: resetTo
        });
      }
      return;
    }

    // Falls es einen gespeicherten Wert für diesen postType gibt, wende ihn an
    if (postType in memoryRef.current) {
      if (typeof setAttributes === "function" && postType in memoryRef.current) {
        setAttributes({
          [attributeName]: memoryRef.current[postType]
        });
      }
    }
  }, [postType]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    // Speichere den aktuellen Wert nur, wenn kein Reset für diesen postType gelten soll
    if (!shouldReset(postType)) {
      memoryRef.current[postType] = value;
    }
  }, [postType, value]);
}
function Edit({
  attributes,
  setAttributes
}) {
  var _attributes$selectedT, _attributes$selectedP;
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
    layoutStyle
  } = attributes;

  // Lokale UI-Zustände
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(true);
  const [localPostCount, setLocalPostCount] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(postCount !== null && postCount !== void 0 ? postCount : "");
  const [localBreakpoints, setLocalBreakpoints] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(breakpoints !== null && breakpoints !== void 0 ? breakpoints : []);

  // Inhaltstypen-Auswahl
  const [postTypeOptions, setPostTypeOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);

  // Seitenstruktur (page)
  const [parentPages, setParentPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [hasPageChildren, setHasPageChildren] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);

  // Datumsseiten (datetime-page)
  const [datetimePages, setDatetimePages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [loadingDatetimePages, setLoadingDatetimePages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [hasDatetimeBlock, setHasDatetimeBlock] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);

  // Taxonomien (bildungsangebote)
  const [taxonomyTerms, setTaxonomyTerms] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [loadingTerms, setLoadingTerms] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);

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
      layoutStyle
    } = attributes;
    const safeAttrs = {
      postType,
      sortMode,
      sortOrder,
      postCount: typeof postCount === "string" ? parseInt(postCount, 10) || null : postCount,
      breakpoints: Array.isArray(breakpoints) ? breakpoints : [],
      selectedPageId: Number.isFinite(selectedPageId) ? selectedPageId : 0,
      selectedPageParent: Number.isFinite(selectedPageParent) ? selectedPageParent : null,
      filterFutureDates: !!filterFutureDates,
      selectedTaxonomyTerm: selectedTaxonomyTerm !== null && selectedTaxonomyTerm !== void 0 ? selectedTaxonomyTerm : "",
      layoutStyle: layoutStyle || "standard" // 👈 hier ergänzt
    };
    const key = Object.values(safeAttrs).map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join("|");
    return {
      safeAttrs,
      key: `ud-loop-${key}`
    };
  }
  const {
    safeAttrs,
    key
  } = buildSafeAttributesAndKey(attributes);

  // Lokale Kopien synchronisieren
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    setLocalPostCount(postCount !== null && postCount !== void 0 ? postCount : "");
  }, [postCount]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    setLocalBreakpoints(breakpoints !== null && breakpoints !== void 0 ? breakpoints : []);
  }, [breakpoints]);

  /* =============================================================== *\
    Speichere oder stelle Attributwerte abhängig vom postType wieder her
  \* =============================================================== */
  // Merke: DATUM-FILTER: Nur aktiv bei bestimmten CPTs
  usePostTypeAttributeMemory(postType, "filterFutureDates", filterFutureDates, setAttributes, pt => pt === "page" || pt === "ud_news");

  // Merke: Sortieroptionen  (datetime-block, published, menu-order)
  usePostTypeAttributeMemory(postType, "sortMode", sortMode, setAttributes);
  usePostTypeAttributeMemory(postType, "sortOrder", sortOrder, setAttributes);

  // Merke: Beitragsanzahl (lokal & im Attribut)
  usePostTypeAttributeMemory(postType, "postCount", postCount, setAttributes);

  // Merke: Responsive Breakpoints
  usePostTypeAttributeMemory(postType, "breakpoints", breakpoints, setAttributes);

  // Merke: Taxonomie-Terms: Nur für ud_bildungsangebote
  usePostTypeAttributeMemory(postType, "selectedTaxonomyTerm", selectedTaxonomyTerm, setAttributes);

  /* =============================================================== *\
    Initiale Daten laden: Sichtbare postTypes, Elternseiten
  \* =============================================================== */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    const excluded = [
    // WordPress Core Post-Types, die irrelevant sind
    "attachment", "nav_menu_item", "revision", "wp_block", "wp_template", "wp_template_part", "wp_navigation", "wp_global_styles", "wp_font_family", "wp_font_face"];
    Promise.all([fetch("/wp-json/ud/v1/visible-post-types").then(res => res.json()), fetch("/wp-json/ud/v1/pages-with-children").then(res => res.json())]).then(([types, pagesWithChildren]) => {
      // Falls es "page"-Einträge mit Kindern gibt, füge sie hinzu
      if (pagesWithChildren.length > 0 && !types.find(t => t.value === "page")) {
        types.push({
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Unterseiten", "ud-loop"),
          value: "page"
        });
      }

      // Füge "datetime-page" als statische Option hinzu
      types.push({
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Einzelseite mit Datum-Blocks", "ud-loop"),
        value: "datetime-page"
      });
      setPostTypeOptions(types);

      // Wenn kein postType gesetzt ist, verwende ersten verfügbaren
      if (!attributes.postType && types.length > 0) {
        setAttributes({
          postType: types[0].value
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  /* =============================================================== *\
    Datumshandling:
    - datetime-page: verfügbare Seiten mit Datum-Block
    - andere CPTs: prüfen, ob Datumsblock vorhanden
  \* =============================================================== */

  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (postType !== "datetime-page") {
      setHasDatetimeBlock(false);
      setDatetimePages([]);
      return;
    }
    setHasDatetimeBlock(true);
    setAttributes({
      sortMode: "datetime-block"
    });
    setLoadingDatetimePages(true);
    fetch("/wp-json/ud-loop-block/v1/datetime-pages").then(res => res.json()).then(pages => {
      setDatetimePages(pages);

      // Wenn nur eine Seite gefunden und keine gewählt → automatisch setzen
      if (pages.length === 1 && (!Number.isFinite(selectedPageId) || parseInt(selectedPageId, 10) <= 0)) {
        const id = parseInt(pages[0].id, 10);
        setAttributes({
          selectedPageId: isNaN(id) ? 0 : id
        });
      }
    }).catch(() => setDatetimePages([])).finally(() => setLoadingDatetimePages(false));
  }, [postType]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!postType || postType === "datetime-page") return;
    fetch(`/wp-json/ud/v1/has-datetime-block/${postType}`).then(res => res.json()).then(result => {
      setHasDatetimeBlock(result.found);
      if (!result.found && sortMode === "datetime-block") {
        setAttributes({
          sortMode: "published"
        });
      }
    }).catch(err => {
      console.warn("Fehler beim Laden von has-datetime-block:", err);
    });
  }, [postType]);

  /* =============================================================== *\
    Seitenstruktur für postType "page":
    - Elternseiten laden
    - Auswahl zurücksetzen bei CPT-Wechsel
  \* =============================================================== */

  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (postType !== "page") {
      setAttributes({
        selectedPageParent: null
      });
    }
  }, [postType]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (postType !== "page") return;
    fetch("/wp-json/ud/v1/pages-with-children").then(res => res.json()).then(data => {
      setParentPages(data);
      setHasPageChildren(data.length > 0);
    });
  }, [postType]);

  /* =============================================================== *\
    Bildungsangebote:
    - Taxonomie "bildungsbereich" laden
    - Standardwert setzen
  \* =============================================================== */

  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (postType !== "ud_bildungsangebote") return;
    setLoadingTerms(true);
    fetch("/wp-json/ud/v1/bildungsbereiche").then(res => res.json()).then(terms => {
      setTaxonomyTerms(terms);
    }).catch(() => {
      setTaxonomyTerms([]);
    }).finally(() => {
      setLoadingTerms(false);
    });
  }, [postType]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (postType === "ud_bildungsangebote" && taxonomyTerms.length > 0 && !attributes.selectedTaxonomyTerm) {
      setAttributes({
        selectedTaxonomyTerm: taxonomyTerms[0].slug
      });
    }
  }, [postType, taxonomyTerms]);

  /* =============================================================== *\
    Kindseiten-Analyse:
    - Unterseiten einer Elternseite laden
    - prüfen, ob ein datetime-block enthalten ist
  \* =============================================================== */
  const pages = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select("core").getEntityRecords("postType", "page", {
    per_page: -1
  }), []);
  const childPages = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    if (!selectedPageParent) return [];
    return select("core").getEntityRecords("postType", "page", {
      per_page: -1,
      parent: selectedPageParent
    });
  }, [selectedPageParent]);

  // Prüfen, ob eine dieser Unterseiten den Datumsblock enthält
  const hasDatetimeBlockInChildPages = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => {
    if (!childPages || childPages.length === 0) return false;
    return childPages.some(page => page?.content?.rendered?.includes("ud/datetime-block"));
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
      [field]: parseInt(value, 10) || 0
    };
    setLocalBreakpoints(updated);
  };

  // Breakpoint hinzufügen
  const addLocalBreakpoint = () => {
    setLocalBreakpoints([...localBreakpoints, {
      maxWidth: 0,
      items: 0
    }]);
  };

  // Breakpoint entfernen
  const removeLocalBreakpoint = index => {
    const updated = [...localBreakpoints];
    updated.splice(index, 1);
    setLocalBreakpoints(updated);
    setAttributes({
      breakpoints: updated
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Inhaltsquelle", "ud-loop"),
        initialOpen: false,
        children: [loading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Inhaltstyp wählen", "ud-loop"),
          value: postType,
          options: postTypeOptions,
          onChange: value => setAttributes({
            postType: value
          }),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), postType === "ud_bildungsangebote" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Bildungsbereich", "ud-loop"),
          value: (_attributes$selectedT = attributes.selectedTaxonomyTerm) !== null && _attributes$selectedT !== void 0 ? _attributes$selectedT : "",
          options: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Bitte wählen", "ud-loop"),
            value: ""
          }, ...taxonomyTerms.map(term => ({
            label: term.name,
            value: term.slug
          }))],
          onChange: value => {
            setAttributes({
              selectedTaxonomyTerm: value
            });
          },
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), postType === "page" && hasPageChildren && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Elternseite wählen", "ud-loop"),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Es wird der Titel und das Beitragsbild angezeigt", "ud-loop"),
          value: (_attributes$selectedP = attributes.selectedPageParent) !== null && _attributes$selectedP !== void 0 ? _attributes$selectedP : "",
          options: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Bitte wählen", "ud-loop"),
            value: ""
          }, ...parentPages.map(page => ({
            label: page.title,
            value: page.id
          }))],
          onChange: value => {
            const parsed = parseInt(value, 10);
            setAttributes({
              selectedPageParent: isNaN(parsed) ? null : parsed
            });
          },
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), postType === "datetime-page" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Seite wählen", "ud-loop"),
          value: attributes.selectedPageId,
          options: loadingDatetimePages ? [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Lade Seiten...", "ud-loop"),
            value: 0
          }] : datetimePages.length > 0 ? datetimePages.map(page => ({
            label: page.title,
            value: page.id
          })) : [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Keine Seite mit Datum-Zeit-Blocks gefunden", "ud-loop"),
            value: 0
          }],
          onChange: value => {
            const parsed = parseInt(value, 10);
            setAttributes({
              selectedPageId: isNaN(parsed) ? 0 : parsed
            });
          },
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Sortierung ", "ud-loop"),
        initialOpen: false,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Sortierung nach", "ud-loop"),
          value: sortMode,
          options: postType === "datetime-page" ? [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Datum-Zeit-Block", "ud-loop"),
            value: "datetime-block"
          }] : [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Veröffentlichung", "ud-loop"),
            value: "published"
          }, hasDatetimeBlock && {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Datum-Zeit-Block", "ud-loop"),
            value: "datetime-block"
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Menü-Order (manuell)", "ud-loop"),
            value: "menu-order"
          }].filter(Boolean) // ← entfernt ggf. das leere Element, wenn hasDatetimeBlock false ist
          ,
          onChange: value => setAttributes({
            sortMode: value
          }),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), sortMode !== "menu-order" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Sortierreihenfolge", "ud-loop"),
          value: attributes.sortOrder,
          options: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Aufsteigend", "ud-loop"),
            value: "ASC"
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Absteigend", "ud-loop"),
            value: "DESC"
          }],
          onChange: value => setAttributes({
            sortOrder: value
          }),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Anzeigeoptionen ", "ud-loop"),
        initialOpen: false,
        children: [postType === "datetime-page" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Layout-Variante", "ud-loop"),
            value: attributes.layoutStyle,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Standard", "ud-loop"),
              value: "standard"
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Kompakte Kartenansicht", "ud-loop"),
              value: "compact"
            }],
            onChange: value => setAttributes({
              layoutStyle: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Maximale Beitragsanzahl", "ud-loop"),
          type: "number",
          min: "1",
          value: String(localPostCount !== null && localPostCount !== void 0 ? localPostCount : "") // immer String
          ,
          onChange: val => {
            var _val$toString$trim;
            // val kommt aus dem Input-Feld: meist String oder undefined
            setLocalPostCount((_val$toString$trim = val?.toString().trim()) !== null && _val$toString$trim !== void 0 ? _val$toString$trim : "");
          },
          onBlur: () => {
            const trimmed = String(localPostCount !== null && localPostCount !== void 0 ? localPostCount : "").trim();
            if (trimmed === "") {
              setAttributes({
                postCount: null
              });
              return;
            }
            const parsed = parseInt(trimmed, 10);
            if (!isNaN(parsed) && parsed >= 1) {
              setAttributes({
                postCount: parsed
              });
            }
          },
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), postType !== "page" && postType !== "ud_news" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Nur zukünftige Einträge anzeigen", "ud-loop"),
            checked: !!filterFutureDates,
            onChange: value => {
              setAttributes({
                filterFutureDates: value
              });
            },
            __nextHasNoMarginBottom: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Breakpoints ", "ud-loop"),
        initialOpen: false,
        children: [localBreakpoints.map((bp, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("fieldset", {
          style: {
            border: "1px solid rgb(153 192 148)",
            padding: "1em",
            marginBottom: "1em",
            borderRadius: "4px",
            background: "#e5f3e2"
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("legend", {
            style: {
              background: "#fff",
              borderRadius: "4px",
              padding: "0 5px",
              border: "1px solid #ccc"
            },
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Breakpoint", "ud-loop"), " ", i + 1]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Bis Fensterbreite (px)", "ud-loop"),
            type: "number",
            min: "300",
            value: bp.maxWidth,
            onChange: val => updateLocalBreakpoint(i, "maxWidth", val),
            onBlur: () => setAttributes({
              breakpoints: localBreakpoints
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Beiträge anzeigen (maximal)", "ud-loop"),
            type: "number",
            min: "1",
            value: bp.items,
            onChange: val => updateLocalBreakpoint(i, "items", val),
            onBlur: () => setAttributes({
              breakpoints: localBreakpoints
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            isDestructive: true,
            variant: "link",
            onClick: () => removeLocalBreakpoint(i),
            style: {
              marginTop: "4px"
            },
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Entfernen", "ud-loop")
          })]
        }, i)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          variant: "secondary",
          onClick: addLocalBreakpoint,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Breakpoint hinzufügen", "ud-loop")
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)(),
      children: postType === "datetime-page" ? !Array.isArray(pages) || pages.length === 0 || !selectedPageId ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        style: {
          padding: "1rem",
          color: "#666"
        },
        children: "Lade g\xFCltige Seiten oder Auswahl \u2026"
      }) : pages.some(page => page.id === selectedPageId) ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)((_wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5___default()), {
        block: "ud/loop-block",
        attributes: safeAttrs
      }, key) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
        style: {
          padding: "1rem",
          color: "darkred"
        },
        children: "Die gew\xE4hlte Seite ist nicht g\xFCltig."
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)((_wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5___default()), {
        block: "ud/loop-block",
        attributes: safeAttrs
      }, key)
    })]
  });
}

/***/ }),

/***/ "./src/js/save.js":
/*!************************!*\
  !*** ./src/js/save.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Save)
/* harmony export */ });
// src/save.js
function Save() {
  return null;
}

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/server-side-render":
/*!******************************************!*\
  !*** external ["wp","serverSideRender"] ***!
  \******************************************/
/***/ ((module) => {

module.exports = window["wp"]["serverSideRender"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/js/editor.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./edit */ "./src/js/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./save */ "./src/js/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../block.json */ "./block.json");
/**
 * editor.js
 *
 * JavaScript für den Block-Editor (Gutenberg).
 * Wird ausschließlich im Backend geladen.
 *
 * Hinweis:
 * Diese Datei enthält editor-spezifische Interaktionen oder React-Komponenten.
 * Wird über webpack zu editor.js gebündelt und in block.json oder enqueue.php eingebunden.
 */




wp.blocks.registerBlockType(_block_json__WEBPACK_IMPORTED_MODULE_2__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_2__,
  edit: _edit__WEBPACK_IMPORTED_MODULE_0__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_1__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=editor-script.js.map