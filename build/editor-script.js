/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/css/editor.scss":
/*!*****************************!*\
  !*** ./src/css/editor.scss ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

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
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/server-side-render */ "@wordpress/server-side-render");
/* harmony import */ var _wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _css_editor_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../css/editor.scss */ "./src/css/editor.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
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









/* =============================================================== *\
   Registrierung des Blocks und seiner Attribute
\* =============================================================== */

(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)('ud/loop-block', {
  apiVersion: 2,
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom Loop Block', 'ud-loop'),
  icon: {
    src: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("svg", {
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      "aria-hidden": "true",
      focusable: "false",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("path", {
        d: "M18.1823 11.6392C18.1823 13.0804 17.0139 14.2487 15.5727 14.2487C14.3579 14.2487 13.335 13.4179 13.0453 12.2922L13.0377 12.2625L13.0278 12.2335L12.3985 10.377L12.3942 10.3785C11.8571 8.64997 10.246 7.39405 8.33961 7.39405C5.99509 7.39405 4.09448 9.29465 4.09448 11.6392C4.09448 13.9837 5.99509 15.8843 8.33961 15.8843C8.88499 15.8843 9.40822 15.781 9.88943 15.5923L9.29212 14.0697C8.99812 14.185 8.67729 14.2487 8.33961 14.2487C6.89838 14.2487 5.73003 13.0804 5.73003 11.6392C5.73003 10.1979 6.89838 9.02959 8.33961 9.02959C9.55444 9.02959 10.5773 9.86046 10.867 10.9862L10.8772 10.9836L11.4695 12.7311C11.9515 14.546 13.6048 15.8843 15.5727 15.8843C17.9172 15.8843 19.8178 13.9837 19.8178 11.6392C19.8178 9.29465 17.9172 7.39404 15.5727 7.39404C15.0287 7.39404 14.5066 7.4968 14.0264 7.6847L14.6223 9.20781C14.9158 9.093 15.2358 9.02959 15.5727 9.02959C17.0139 9.02959 18.1823 10.1979 18.1823 11.6392Z"
      })
    })
  },
  category: 'widgets',
  attributes: {
    postType: {
      type: 'string',
      default: 'post'
    },
    selectedPageParent: {
      type: 'number',
      default: null
    },
    displayMode: {
      type: 'string',
      default: 'teaser'
    },
    sortMode: {
      type: 'string',
      default: 'published'
    },
    sortOrder: {
      type: 'string',
      default: 'DESC'
    },
    breakpoints: {
      type: 'array',
      default: []
    },
    postCount: {
      type: 'number',
      default: null
    }
  },
  /* =============================================================== *\
     Bearbeitung im Editor (Inspector Controls + Vorschau)
  \* =============================================================== */
  edit({
    attributes,
    setAttributes
  }) {
    var _attributes$selectedP;
    const {
      postType,
      sortMode,
      breakpoints,
      postCount,
      sortOrder
    } = attributes;
    const [parentPages, setParentPages] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)([]);
    const [hasPageChildren, setHasPageChildren] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
    // Lokale States für Optionen und UI-Steuerung
    const [postTypeOptions, setPostTypeOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)([]);
    const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(true);
    const [hasDatetimeBlock, setHasDatetimeBlock] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(false);
    const [localPostCount, setLocalPostCount] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(postCount !== null && postCount !== void 0 ? postCount : '');
    const [localBreakpoints, setLocalBreakpoints] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(breakpoints !== null && breakpoints !== void 0 ? breakpoints : []);

    /* =============================================================== *\
       Attribute → lokale States synchronisieren
    \* =============================================================== */
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      setLocalPostCount(postCount !== null && postCount !== void 0 ? postCount : '');
    }, [postCount]);
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      setLocalBreakpoints(breakpoints !== null && breakpoints !== void 0 ? breakpoints : []);
    }, [breakpoints]);

    /* =============================================================== *\
       selectedPageParent & displayMode zurücksetzen, wenn Inhaltstyp ≠ 'page'
       Verhindert ungültige Attribut-Kombinationen bei anderen Inhaltstypen
    \* =============================================================== */
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      if (postType !== 'page') {
        setAttributes({
          selectedPageParent: null,
          displayMode: 'teaser' // optional: zurück auf Standard
        });
      }
    }, [postType]);

    /* =============================================================== *\
       Elternseiten laden, wenn Inhaltstyp 'page' ist
       Der Endpunkt liefert nur Seiten, die Unterseiten besitzen
    \* =============================================================== */
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      if (postType !== 'page') return;
      fetch('/wp-json/ud/v1/pages-with-children').then(res => res.json()).then(data => {
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
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      const excluded = ['attachment', 'nav_menu_item', 'revision', 'wp_block', 'wp_template', 'wp_template_part', 'wp_navigation', 'wp_global_styles', 'wp_font_family', 'wp_font_face'];
      Promise.all([fetch('/wp-json/wp/v2/types').then(res => res.json()), fetch('/wp-json/ud/v1/pages-with-children').then(res => res.json())]).then(([typesData, pagesWithChildren]) => {
        const types = Object.entries(typesData).filter(([key, type]) => !excluded.includes(key) && !!type.name).map(([key, type]) => ({
          label: type.name,
          value: key
        }));

        // Wenn es Elternseiten gibt → 'page' hinzufügen, falls noch nicht enthalten
        if (pagesWithChildren.length > 0 && !types.find(t => t.value === 'page')) {
          types.push({
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Seite', 'ud-loop'),
            value: 'page'
          });
        }
        setPostTypeOptions(types);

        // Wenn noch kein postType gesetzt wurde (z. B. beim ersten Laden), Standardwert setzen
        if (!attributes.postType && types.length > 0) {
          setAttributes({
            postType: types[0].value
          });
        }
      }).finally(() => setLoading(false));
    }, []);

    /* =============================================================== *\
       Prüfen, ob der Inhaltstyp datetime-block unterstützt
    \* =============================================================== */
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
      if (!postType) return;
      fetch(`/wp-json/ud/v1/has-datetime-block/${postType}`).then(res => res.json()).then(result => {
        setHasDatetimeBlock(result.found);

        // Bei fehlendem datetime-block: zurück zu "published"
        if (!result.found && sortMode === 'datetime-block') {
          setAttributes({
            sortMode: 'published'
          });
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
        [field]: parseInt(value, 10) || 0
      };
      setLocalBreakpoints(updated);
    };
    const addLocalBreakpoint = () => {
      setLocalBreakpoints([...localBreakpoints, {
        maxWidth: 0,
        items: 0
      }]);
    };
    const removeLocalBreakpoint = index => {
      const updated = [...localBreakpoints];
      updated.splice(index, 1);
      setLocalBreakpoints(updated);
    };

    /* =============================================================== *\
       Attribut-Objekt für ServerSideRender vorbereiten
    \* =============================================================== */
    const safeAttributes = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => {
      var _attributes$displayMo;
      return {
        postType,
        sortMode,
        sortOrder,
        breakpoints,
        postCount,
        selectedPageParent: Number.isInteger(attributes.selectedPageParent) ? attributes.selectedPageParent : null,
        displayMode: (_attributes$displayMo = attributes.displayMode) !== null && _attributes$displayMo !== void 0 ? _attributes$displayMo : 'teaser'
      };
    }, [postType, sortMode, sortOrder, breakpoints, postCount, attributes.selectedPageParent, attributes.displayMode]);

    /* =============================================================== *\
       Editor-UI (InspectorControls + ServerPreview)
    \* =============================================================== */
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Einstellungen', 'ud-loop'),
          initialOpen: true,
          children: [loading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Inhaltstyp wählen', 'ud-loop'),
            value: postType,
            options: postTypeOptions,
            onChange: value => setAttributes({
              postType: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), postType === 'page' && hasPageChildren && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Elternseite wählen', 'ud-loop'),
            help: "Es wird der Titel und das Beitragsbild angezeigt",
            value: (_attributes$selectedP = attributes.selectedPageParent) !== null && _attributes$selectedP !== void 0 ? _attributes$selectedP : '',
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Bitte wählen', 'ud-loop'),
              value: ''
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
          }), postType === 'page' && hasPageChildren && attributes.selectedPageParent && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Darstellung der Unterseiten', 'ud-loop'),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Wählen Sie, wie die Unterseiten angezeigt werden sollen.', 'ud-loop'),
            value: attributes.displayMode,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Teaser-Block verwenden', 'ud-loop'),
              value: 'teaser'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Titel + Beitragsbild anzeigen', 'ud-loop'),
              value: 'fallback'
            }],
            onChange: value => setAttributes({
              displayMode: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sortierreihenfolge', 'ud-loop'),
            value: attributes.sortOrder,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Aufsteigend', 'ud-loop'),
              value: 'ASC'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Absteigend', 'ud-loop'),
              value: 'DESC'
            }],
            onChange: value => setAttributes({
              sortOrder: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sortierung nach', 'ud-loop'),
            value: sortMode,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Veröffentlichung', 'ud-loop'),
              value: 'published'
            }, ...(hasDatetimeBlock ? [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Datum-Zeit-Block', 'ud-loop'),
              value: 'datetime-block'
            }] : []), {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Menü-Order (manuell)', 'ud-loop'),
              value: 'menu-order'
            }],
            onChange: value => setAttributes({
              sortMode: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Maximale Beitragsanzahl', 'ud-loop'),
            type: "number",
            min: "1",
            value: localPostCount,
            onChange: val => setLocalPostCount(val.trim()),
            onBlur: () => {
              const trimmed = localPostCount.trim();
              if (trimmed === '') {
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
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
            className: "components-base-control__label",
            style: {
              display: 'block',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              fontWeight: '600'
            },
            children: "Anpassung an Bildschirmgr\xF6sse"
          }), localBreakpoints.map((bp, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("fieldset", {
            style: {
              border: '1px solid rgb(153 192 148)',
              padding: '1em',
              marginBottom: '1em',
              borderRadius: '4px',
              background: '#e5f3e2'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("legend", {
              style: {
                background: '#fff',
                borderRadius: '4px',
                padding: '0 5px',
                border: '1px solid #ccc'
              },
              children: ["Breakpoint ", i + 1]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Bis Fensterbreite (px)', 'ud-loop'),
              type: "number",
              min: "300",
              value: bp.maxWidth,
              onChange: val => updateLocalBreakpoint(i, 'maxWidth', val),
              onBlur: () => setAttributes({
                breakpoints: localBreakpoints
              }),
              __next40pxDefaultSize: true,
              __nextHasNoMarginBottom: true
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Beiträge anzeigen (maximal)', 'ud-loop'),
              type: "number",
              min: "1",
              value: bp.items,
              onChange: val => updateLocalBreakpoint(i, 'items', val),
              onBlur: () => setAttributes({
                breakpoints: localBreakpoints
              }),
              __next40pxDefaultSize: true,
              __nextHasNoMarginBottom: true
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
              isDestructive: true,
              variant: "link",
              onClick: () => removeLocalBreakpoint(i),
              style: {
                marginTop: '4px'
              },
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Entfernen', 'ud-loop')
            })]
          }, i)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            variant: "secondary",
            onClick: addLocalBreakpoint,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Breakpoint hinzufügen', 'ud-loop')
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)(),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)((_wordpress_server_side_render__WEBPACK_IMPORTED_MODULE_5___default()), {
          block: "ud/loop-block",
          attributes: safeAttributes
        }, JSON.stringify(safeAttributes))
      })]
    });
  },
  /* =============================================================== *\
     Der Block speichert keine Inhalte – reine Server-Logik
  \* =============================================================== */
  save() {
    return null;
  }
});
})();

/******/ })()
;
//# sourceMappingURL=editor-script.js.map