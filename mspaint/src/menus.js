// @ts-check
/* global tool_transparent_mode:writable, palette:writable */
/* global $canvas_area, $colorbox, $status_area, $toolbox, available_languages, get_iso_language_name, get_language, get_language_emoji, get_language_endonym, localize, magnification, main_canvas, menu_bar, MENU_DIVIDER, redos, selection, set_language, show_grid, show_thumbnail, systemHooks, undos */
// import { available_languages, get_iso_language_name, get_language, get_language_emoji, get_language_endonym, localize, set_language } from "./app-localization.js";
import { show_edit_colors_window } from "./edit-colors.js";
import { palette_formats } from "./file-format-data.js";
import { are_you_sure, change_url_param, choose_file_to_paste, clear, delete_selection, deselect, edit_copy, edit_cut, edit_paste, file_load_from_url, file_new, file_open, file_print, file_save, file_save_as, image_attributes, image_flip_and_rotate, image_invert_colors, image_stretch_and_skew, redo, render_history_as_gif, sanity_check_blob, save_selection_to_file, select_all, set_magnification, show_about_paint, show_custom_zoom_window, show_document_history, show_file_format_errors, show_multi_user_setup_dialog, show_news, toggle_grid, toggle_thumbnail, undo, view_bitmap } from "./functions.js";

import { $G, get_rgba_from_color, is_discord_embed } from "./helpers.js";

import { manage_storage } from "./manage-storage.js";
import { showMessageBox } from "./msgbox.js";
import { simulateRandomGesturesPeriodically, simulatingGestures, stopSimulatingGestures } from "./simulate-random-gestures.js";
import { speech_recognition_active, speech_recognition_available } from "./speech-recognition.js";
import { get_theme, set_theme } from "./theme.js";
import { $DialogWindow } from "./$ToolWindow.js";

const looksLikeChrome = !!(window.chrome && (window.chrome.loadTimes || window.chrome.csi));
// NOTE: Microsoft Edge includes window.chrome.app
// (also this browser detection logic could likely use some more nuance)

/** @type {OSGUITopLevelMenus} */
const menus = {
	[localize("&File")]: [
		{
			label: localize("&New"),
			...shortcut(window.is_electron_app ? "Ctrl+N" : "Ctrl+Alt+N"), // Ctrl+N opens a new browser window
			speech_recognition: [
				"new", "new file", "new document", "create new document", "create a new document", "start new document", "start a new document",
			],
			action: () => { file_new(); },
			description: localize("Creates a new document."),
		},
		{
			label: localize("&Open"),
			...shortcut("Ctrl+O"),
			speech_recognition: [
				"open", "open document", "open file", "open an image file", "open a document", "open a file",
				"load document", "load a document", "load an image file", "load an image",
				"show file picker", "show file chooser", "show file browser", "show finder",
				"browser for file", "browse for a file", "browse for an image", "browse for an image file",
			],
			action: () => { file_open(); },
			description: localize("Opens an existing document."),
		},
		{
			label: localize("&Save"),
			...shortcut("Ctrl+S"),
			speech_recognition: [
				"save", "save document", "save file", "save image", "save picture", "save image file",
				// "save a document", "save a file", "save an image", "save an image file", // too "save as"-like
				"save the document", "save the file", "save the image", "save the image file",

				"download", "download document", "download file", "download image", "download picture", "download image file",
				"download the document", "download the file", "download the image", "download the image file",
			],
			action: () => { file_save(); },
			description: localize("Saves the active document."),
		},
		{
			label: localize("Save &As"),
			// in mspaint, no shortcut is listed; it supports F12 (but in a browser that opens the dev tools)
			// it doesn't support Ctrl+Shift+S but that's a good & common modern shortcut
			...shortcut("Ctrl+Shift+S"),
			speech_recognition: [
				// this is ridiculous
				// this would be really simple in JSGF format
				"save as", "save as a new file", "save as a new picture", "save as a new image", "save a new file", "save new file",
				"save a new document", "save a new image file", "save a new image", "save a new picture",
				"save as a copy", "save a copy", "save as copy", "save under a new name", "save with a new name",
				"save document as a copy", "save document copy", "save document as copy", "save document under a new name", "save document with a new name",
				"save image as a copy", "save image copy", "save image as copy", "save image under a new name", "save image with a new name",
				"save file as a copy", "save file copy", "save file as copy", "save file under a new name", "save file with a new name",
				"save image file as a copy", "save image file copy", "save image file as copy", "save image file under a new name", "save image file with a new name",
			],
			action: () => { file_save_as(); },
			description: localize("Saves the active document with a new name."),
		},
		MENU_DIVIDER,
		{
			label: localize("&Load From URL"),
			// shortcut: "", // no shortcut: Ctrl+L is taken, and you can paste a URL with Ctrl+V, so it's not really needed
			speech_recognition: [
				"load from url",
				"load from a url",
				"load from address",
				"load from an address",
				"load from a web address",
				// this is ridiculous
				// this would be really simple in JSGF format
				"load an image from a URL",
				"load an image from an address",
				"load an image from a web address",
				"load image from a URL",
				"load image from an address",
				"load image from a web address",
				"load an image from URL",
				"load an image from address",
				"load an image from web address",
				"load image from URL",
				"load image from address",
				"load image from web address",

				"load an picture from a URL",
				"load an picture from an address",
				"load an picture from a web address",
				"load picture from a URL",
				"load picture from an address",
				"load picture from a web address",
				"load an picture from URL",
				"load an picture from address",
				"load an picture from web address",
				"load picture from URL",
				"load picture from address",
				"load picture from web address",
			],
			action: () => { file_load_from_url(); },
			description: localize("Opens an image from the web."),
		},

		MENU_DIVIDER,
		{
			label: localize("Manage Storage"),
			speech_recognition: [
				"manage storage", "show storage", "open storage window", "manage sessions", "show sessions", "show local sessions", "local sessions", "storage manager", "show storage manager", "open storage manager",
				"show autosaves", "show saves", "show saved documents", "show saved files", "show saved pictures", "show saved images", "show local storage",
				"autosaves", "autosave", "saved documents", "saved files", "saved pictures", "saved images", "local storage",
			],
			action: () => { manage_storage(); },
			description: localize("Manages storage of previously created or opened pictures."),
		},
		MENU_DIVIDER,
		{
			label: localize("Print Pre&view"),
			speech_recognition: [
				"preview print", "print preview", "show print preview", "show preview of print",
			],
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
			//description: localize("Displays full pages."),
		},
		{
			label: localize("Page Se&tup"),
			speech_recognition: [
				"setup page for print", "setup page for printing", "set-up page for print", "set-up page for printing", "set up page for print", "set up page for printing",
				"page setup", "printing setup", "page set-up", "printing set-up", "page set up", "printing set up",
			],
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
			//description: localize("Changes the page layout."),
		},
		{
			label: localize("&Print"),
			...shortcut("Ctrl+P"), // relies on browser's print shortcut being Ctrl+P
			speech_recognition: [
				"print", "send to printer", "show print dialog",
				"print page", "print image", "print picture", "print drawing",
				"print out page", "print out image", "print out picture", "print out drawing",
				"print out the page", "print out the image", "print out the picture", "print out the drawing",

				"send page to printer", "send image to printer", "send picture to printer", "send drawing to printer",
				"send page to the printer", "send image to the printer", "send picture to the printer", "send drawing to the printer",
				"send the page to the printer", "send the image to the printer", "send the picture to the printer", "send the drawing to the printer",
				"send the page to printer", "send the image to printer", "send the picture to printer", "send the drawing to printer",
			],
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
		},
		MENU_DIVIDER,
		{
			label: localize("Set As &Wallpaper (Tiled)"),
			speech_recognition: [
				"set as wallpaper",
				"set as wallpaper tiled",
				"set image as wallpaper tiled", "set picture as wallpaper tiled", "set drawing as wallpaper tiled",
				"use as wallpaper tiled",
				"use image as wallpaper tiled", "use picture as wallpaper tiled", "use drawing as wallpaper tiled",
				"tile image as wallpaper", "tile picture as wallpaper", "tile drawing as wallpaper",
			],
			action: () => { systemHooks.setWallpaperTiled(main_canvas); },
			description: localize("Tiles this bitmap as the desktop background."),
		},
		{
			label: localize("Set As Wallpaper (&Centered)"), // in mspaint it's Wa&llpaper
			speech_recognition: [
				"set as wallpaper centered",
				"set image as wallpaper centered", "set picture as wallpaper centered", "set drawing as wallpaper centered",
				"use as wallpaper centered",
				"use image as wallpaper centered", "use picture as wallpaper centered", "use drawing as wallpaper centered",
				"center image as wallpaper", "center picture as wallpaper", "center drawing as wallpaper",
			],
			action: () => { systemHooks.setWallpaperCentered(main_canvas); },
			description: localize("Centers this bitmap as the desktop background."),
		},
		MENU_DIVIDER,
		{
			label: localize("Recent File"),
			enabled: false, // @TODO for desktop app
			description: localize(""),
		},
		MENU_DIVIDER,
		{
			label: localize("E&xit"),
			...shortcut(window.is_electron_app ? "Alt+F4" : ""), // Alt+F4 closes the browser window (in most window managers)
			speech_recognition: [
				"exit application", "exit paint", "close paint window",
			],
			action: () => {
				are_you_sure(() => {
					if (is_discord_embed) {
						// For the Discord Activity, there doesn't seem to be an API to exit the activity.
						showMessageBox({
							message: "Click the Leave Activity button in Discord to exit.",
						});
						return;
					}

					// Note: For a Chrome PWA, window.close() is allowed only if there is only one history entry.
					// I could make it try to close the window and then navigate to the official web desktop if it fails,
					// but that would be inconsistent, as it wouldn't close the window after using File > New or File > Open.
					// I could make it so that it uses replaceState when opening a new document (starting a new session);
					// that would prevent you from using Alt+Left to go back to the previous document, but that may be acceptable
					// for a desktop app experience, where the back button is already hidden.
					// That said, if you just installed the PWA, it will have history already (even if just the New Tab page),
					// as the tab is converted to a window, and in that case,
					// it would be unable to close, again being inconsistent, but less so.
					// (If on PWA install, the app could open a fresh new window and close itself, it could work from the start,
					// but if we try to do that, we'll be back at square one, trying to close a window with history.)
					try {
						// API contract is containing page can override window.close()
						// Note that e.g. (()=>{}).bind().toString() gives "function () { [native code] }"
						// so the window.close() must not use bind() (not that that's common practice anyway)
						const close_overridden = frameElement && window.close && !/\{\s*\[native code\]\s*\}/.test(window.close.toString());
						if (close_overridden || window.is_electron_app) {
							window.close();
							return;
						}
					} catch (_error) {
						// In a cross-origin iframe, most likely
						// @TODO: establish postMessage API
					}
					// In a cross-origin iframe, or same origin but without custom close(), or top level:
					// Not all browsers support close() for closing a tab,
					// so redirect instead. Exit to the official web desktop.
					// @ts-ignore
					window.location = "https://98.js.org/";
				});
			},
			description: localize("Quits Paint."),
		},
	],
	[localize("&Edit")]: [
		{
			label: localize("&Undo"),
			...shortcut("Ctrl+Z"),
			speech_recognition: [
				"undo", "undo that",
			],
			enabled: () => undos.length >= 1,
			action: () => { undo(); },
			description: localize("Undoes the last action."),
		},
		{
			label: localize("&Repeat"),
			...shortcut("F4"), // also supported: Ctrl+Shift+Z, Ctrl+Y
			speech_recognition: [
				"repeat", "redo",
			],
			enabled: () => redos.length >= 1,
			action: () => { redo(); },
			description: localize("Redoes the previously undone action."),
		},
		{
			label: localize("&History"),
			...shortcut("Ctrl+Shift+Y"),
			speech_recognition: [
				"show history", "history",
			],
			action: () => { show_document_history(); },
			description: localize("Shows the document history and lets you navigate to states not accessible with Undo or Repeat."),
		},
		MENU_DIVIDER,
		{
			label: localize("Cu&t"),
			...shortcut("Ctrl+X"),
			speech_recognition: [
				"cut", "cut selection", "cut selection to clipboard", "cut the selection", "cut the selection to clipboard", "cut the selection to the clipboard",
			],
			enabled: () =>
				// @TODO: support cutting text with this menu item as well (e.g. for the text tool)
				!!selection,
			action: () => {
				edit_cut(true);
			},
			description: localize("Cuts the selection and puts it on the Clipboard."),
		},
		{
			label: localize("&Copy"),
			...shortcut("Ctrl+C"),
			speech_recognition: [
				"copy", "copy selection", "copy selection to clipboard", "copy the selection", "copy the selection to clipboard", "copy the selection to the clipboard",
			],
			enabled: () =>
				// @TODO: support copying text with this menu item as well (e.g. for the text tool)
				!!selection,
			action: () => {
				edit_copy(true);
			},
			description: localize("Copies the selection and puts it on the Clipboard."),
		},
		{
			label: localize("&Paste"),
			...shortcut("Ctrl+V"),
			speech_recognition: [
				"paste", "paste from clipboard", "paste from the clipboard", "insert clipboard", "insert clipboard contents", "insert the contents of the clipboard", "paste what's on the clipboard",
			],
			enabled: () =>
				// @TODO: disable if nothing in clipboard or wrong type (if we can access that)
				true,
			action: () => {
				edit_paste(true);
			},
			description: localize("Inserts the contents of the Clipboard."),
		},
		{
			label: localize("C&lear Selection"),
			...shortcut("Del"),
			speech_recognition: [
				"delete", "clear selection", "delete selection", "delete selected", "delete selected area", "clear selected area", "erase selected", "erase selected area",
			],
			enabled: () => !!selection,
			action: () => { delete_selection(); },
			description: localize("Deletes the selection."),
		},
		{
			label: localize("Select &All"),
			...shortcut("Ctrl+A"),
			speech_recognition: [
				"select all", "select everything",
				"select the whole image", "select the whole picture", "select the whole drawing", "select the whole canvas", "select the whole document",
				"select the entire image", "select the entire picture", "select the entire drawing", "select the entire canvas", "select the entire document",
			],
			action: () => { select_all(); },
			description: localize("Selects everything."),
		},
		MENU_DIVIDER,
		{
			label: `${localize("C&opy To")}...`,
			speech_recognition: [
				"copy to file", "copy selection to file", "copy selection to a file", "save selection",
				"save selection as file", "save selection as image", "save selection as picture", "save selection as image file", "save selection as document",
				"save selection as a file", "save selection as a image", "save selection as a picture", "save selection as a image file", "save selection as a document",
				"save selection to file", "save selection to image", "save selection to picture", "save selection to image file", "save selection to document",
				"save selection to a file", "save selection to a image", "save selection to a picture", "save selection to a image file", "save selection to a document",
			],
			enabled: () => !!selection,
			action: () => { save_selection_to_file(); },
			description: localize("Copies the selection to a file."),
		},
		{
			label: `${localize("Paste &From")}...`,
			speech_recognition: [
				"paste a file", "paste from a file", "insert a file", "insert an image file",
			],
			action: () => { choose_file_to_paste(); },
			description: localize("Pastes a file into the selection."),
		},
	],
	[localize("&View")]: [
		{
			label: localize("&Tool Box"),
			...shortcut(window.is_electron_app ? "Ctrl+T" : ""), // Ctrl+T opens a new browser tab, Ctrl+Alt+T opens a Terminal in Ubuntu, and Ctrl+Shift+Alt+T feels silly.
			speech_recognition: [
				"toggle tool box", "toggle tools box", "toggle toolbox", "toggle tool palette", "toggle tools palette",
				// @TODO: hide/show
			],
			checkbox: {
				toggle: () => {
					$toolbox.toggle();
				},
				check: () => $toolbox.is(":visible"),
			},
			description: localize("Shows or hides the tool box."),
		},
		{
			label: localize("&Color Box"),
			...shortcut("Ctrl+L"), // focuses browser address bar, but Firefox and Chrome both allow overriding the default behavior
			speech_recognition: [
				"toggle color box", "toggle colors box", "toggle palette", "toggle color palette", "toggle colors palette",
				// @TODO: hide/show
			],
			checkbox: {
				toggle: () => {
					$colorbox.toggle();
				},
				check: () => $colorbox.is(":visible"),
			},
			description: localize("Shows or hides the color box."),
		},
		{
			label: localize("&Status Bar"),
			speech_recognition: [
				"toggle status bar", "toggle status text", "toggle status area", "toggle status indicator",
				// @TODO: hide/show
			],
			checkbox: {
				toggle: () => {
					$status_area.toggle();
				},
				check: () => $status_area.is(":visible"),
			},
			description: localize("Shows or hides the status bar."),
		},
		{
			label: localize("T&ext Toolbar"),
			speech_recognition: [
				"toggle text toolbar", "toggle font toolbar", "toggle text tool bar", "toggle font tool bar",
				"toggle font box", "toggle fonts box", "toggle text options box", "toggle text tool options box", "toggle font options box",
				"toggle font window", "toggle fonts window", "toggle text options window", "toggle text tool options window", "toggle font options window",
				// @TODO: hide/show
			],
			enabled: false, // @TODO: toggle fonts box
			checkbox: {
				toggle: () => {
					// Kind of silly that I haven't implemented this in the 10 years I've been working on this project.
				},
				check: () => false,
			},
			description: localize("Shows or hides the text toolbar."),
		},
		MENU_DIVIDER,
		{
			label: localize("&Zoom"),
			submenu: [
				{
					label: localize("&Normal Size"),
					...shortcut(window.is_electron_app ? "Ctrl+PgUp" : ""), // Ctrl+PageUp cycles thru browser tabs in Chrome & Firefox; can be overridden in Chrome in fullscreen only
					speech_recognition: [
						"reset zoom", "zoom to normal size",
						"zoom to 100%", "set zoom to 100%", "set zoom 100%",
						"zoom to 1x", "set zoom to 1x", "set zoom 1x",
						"zoom level to 100%", "set zoom level to 100%", "set zoom level 100%",
						"zoom level to 1x", "set zoom level to 1x", "set zoom level 1x",
					],
					description: localize("Zooms the picture to 100%."),
					enabled: () => magnification !== 1,
					action: () => {
						set_magnification(1);
					},
				},
				{
					label: localize("&Large Size"),
					...shortcut(window.is_electron_app ? "Ctrl+PgDn" : ""), // Ctrl+PageDown cycles thru browser tabs in Chrome & Firefox; can be overridden in Chrome in fullscreen only
					speech_recognition: [
						"zoom to large size",
						"zoom to 400%", "set zoom to 400%", "set zoom 400%",
						"zoom to 4x", "set zoom to 4x", "set zoom 4x",
						"zoom level to 400%", "set zoom level to 400%", "set zoom level 400%",
						"zoom level to 4x", "set zoom level to 4x", "set zoom level 4x",
					],
					description: localize("Zooms the picture to 400%."),
					enabled: () => magnification !== 4,
					action: () => {
						set_magnification(4);
					},
				},
				{
					label: localize("Zoom To &Window"),
					speech_recognition: [
						"zoom to window", "zoom to view",
						"zoom to fit",
						"zoom to fit within window", "zoom to fit within view",
						"zoom to fit within the window", "zoom to fit within the view",
						"zoom to fit in window", "zoom to fit in view",
						"zoom to fit in the window", "zoom to fit in the view",
						"auto zoom", "fit zoom",
						"zoom to max", "zoom to maximum", "zoom to max size", "zoom to maximum size",
						"zoom so canvas fits", "zoom so picture fits", "zoom so image fits", "zoom so document fits",
						"zoom so whole canvas is visible", "zoom so whole picture is visible", "zoom so whole image is visible", "zoom so whole document is visible",
						"zoom so the whole canvas is visible", "zoom so the whole picture is visible", "zoom so the whole image is visible", "zoom so the whole document is visible",

						"fit to window", "fit to view", "fit in window", "fit in view", "fit within window", "fit within view",
						"fit picture to window", "fit picture to view", "fit picture in window", "fit picture in view", "fit picture within window", "fit picture within view",
						"fit image to window", "fit image to view", "fit image in window", "fit image in view", "fit image within window", "fit image within view",
						"fit canvas to window", "fit canvas to view", "fit canvas in window", "fit canvas in view", "fit canvas within window", "fit canvas within view",
						"fit document to window", "fit document to view", "fit document in window", "fit document in view", "fit document within window", "fit document within view",
					],
					description: localize("Zooms the picture to fit within the view."),
					action: () => {
						const rect = $canvas_area[0].getBoundingClientRect();
						const margin = 30; // leave a margin so scrollbars won't appear
						let mag = Math.min(
							(rect.width - margin) / main_canvas.width,
							(rect.height - margin) / main_canvas.height,
						);
						// round to an integer percent for the View > Zoom > Custom... dialog, which shows non-integers as invalid
						mag = Math.floor(100 * mag) / 100;
						set_magnification(mag);
					},
				},
				{
					label: `${localize("C&ustom")}...`,
					description: localize("Zooms the picture."),
					speech_recognition: [
						"zoom custom", "custom zoom", "set custom zoom", "set custom zoom level", "zoom to custom level", "zoom to custom", "zoom level", "set zoom level",
					],
					action: () => { show_custom_zoom_window(); },
				},
				MENU_DIVIDER,
				{
					label: localize("Show &Grid"),
					...shortcut("Ctrl+G"),
					speech_recognition: [
						"toggle show grid",
						"toggle grid", "toggle gridlines", "toggle grid lines", "toggle grid cells",
						// @TODO: hide/show
					],
					enabled: () => magnification >= 4,
					checkbox: {
						toggle: () => { toggle_grid(); },
						check: () => show_grid,
					},
					description: localize("Shows or hides the grid."),
				},
				{
					label: localize("Show T&humbnail"),
					speech_recognition: [
						"toggle show thumbnail",
						"toggle thumbnail", "toggle thumbnail view", "toggle thumbnail box", "toggle thumbnail window",
						"toggle preview", "toggle image preview", "toggle picture preview",
						"toggle picture in picture", "toggle picture in picture view", "toggle picture in picture box", "toggle picture in picture window",
						// @TODO: hide/show
					],
					checkbox: {
						toggle: () => { toggle_thumbnail(); },
						check: () => show_thumbnail,
					},
					description: localize("Shows or hides the thumbnail view of the picture."),
				},
			],
		},
		{
			label: localize("&View Bitmap"),
			...shortcut("Ctrl+F"),
			speech_recognition: [
				"view bitmap", "show bitmap",
				"fullscreen", "full-screen", "full screen",
				"show picture fullscreen", "show picture full-screen", "show picture full screen",
				"show image fullscreen", "show image full-screen", "show image full screen",
				// @TODO: exit fullscreen
			],
			action: () => { view_bitmap(); },
			description: localize("Displays the entire picture."),
		},
		MENU_DIVIDER,
		{
			label: localize("&Fullscreen"),
			...shortcut("F11"), // relies on browser's shortcut
			speech_recognition: [
				// won't work with speech recognition, needs a user gesture
			],
			enabled: () => Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled),
			checkbox: {
				check: () => Boolean(document.fullscreenElement || document.webkitFullscreenElement),
				toggle: () => {
					if (document.fullscreenElement || document.webkitFullscreenElement) {
						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						}
					} else {
						if (document.documentElement.requestFullscreen) {
							document.documentElement.requestFullscreen();
						} else if (document.documentElement.webkitRequestFullscreen) {
							document.documentElement.webkitRequestFullscreen();
						}
					}
					// check() would need to be async or faked with a timeout,
					// if the menus stayed open. @TODO: make all checkboxes close menus
					menu_bar.closeMenus();
				},
			},
			description: localize("Makes the application take up the entire screen."),
		},
	],
	[localize("&Image")]: [
		// @TODO: speech recognition: terms that apply to selection
		{
			label: localize("&Flip/Rotate"),
			...shortcut((window.is_electron_app && !window.electron_is_dev) ? "Ctrl+R" : "Ctrl+Alt+R"), // Ctrl+R reloads the browser tab (or Electron window in dev mode via electron-debug)
			speech_recognition: [
				"flip",
				"rotate",
				"flip/rotate", "flip slash rotate", "flip and rotate", "flip or rotate", "flip rotate",
				// @TODO: parameters to command
			],
			action: () => { image_flip_and_rotate(); },
			description: localize("Flips or rotates the picture or a selection."),
		},
		{
			label: localize("&Stretch/Skew"),
			...shortcut(window.is_electron_app ? "Ctrl+W" : "Ctrl+Alt+W"), // Ctrl+W closes the browser tab
			speech_recognition: [
				"stretch", "scale", "resize image",
				"skew",
				"stretch/skew", "stretch slash skew", "stretch and skew", "stretch or skew", "stretch skew",
				// @TODO: parameters to command
			],
			action: () => { image_stretch_and_skew(); },
			description: localize("Stretches or skews the picture or a selection."),
		},
		{
			label: localize("&Invert Colors"),
			...shortcut("Ctrl+I"),
			speech_recognition: [
				"invert",
				"invert colors",
				"invert image", "invert picture", "invert drawing",
				"invert image colors", "invert picture colors", "invert drawing colors",
				"invert colors of image", "invert colors of picture", "invert colors of drawing",
			],
			action: () => { image_invert_colors(); },
			description: localize("Inverts the colors of the picture or a selection."),
		},
		{
			label: `${localize("&Attributes")}...`,
			...shortcut("Ctrl+E"),
			speech_recognition: [
				"attributes", "image attributes", "picture attributes", "image options", "picture options",
				"dimensions", "image dimensions", "picture dimensions",
				"resize canvas", "resize document", "resize page", // not resize image/picture because that implies scaling, handled by Stretch/Skew
				"set image size", "set picture size", "set canvas size", "set document size", "set page size",
				"image size", "picture size", "canvas size", "document size", "page size",
				"configure image size", "configure picture size", "configure canvas size", "configure document size", "configure page size",
			],
			action: () => { image_attributes(); },
			description: localize("Changes the attributes of the picture."),
		},
		{
			label: localize("&Clear Image"),
			...shortcut((window.is_electron_app || !looksLikeChrome) ? "Ctrl+Shift+N" : ""), // Ctrl+Shift+N opens incognito window in chrome
			speech_recognition: [
				"clear image", "clear canvas", "clear picture", "clear page", "clear drawing",
				// @TODO: erase?
			],
			// (mspaint says "Ctrl+Shft+N")
			action: () => { if (!selection) { clear(); } },
			enabled: () => !selection,
			description: localize("Clears the picture."),
			// action: ()=> {
			// 	if (selection) {
			// 		delete_selection();
			// 	} else {
			// 		clear();
			// 	}
			// },
			// mspaint says localize("Clears the picture or selection."), but grays out the option when there's a selection
		},
		{
			label: localize("&Draw Opaque"),
			speech_recognition: [
				"toggle draw opaque",
				"toggle transparent selection", "toggle transparent selections",
				"toggle transparent selection mode", "toggle transparent selections mode",
				"toggle opaque selection", "toggle opaque selections",
				"toggle opaque selection mode", "toggle opaque selections mode",
				// toggle opaque? toggle opacity?
				// @TODO: hide/show / "draw opaque" / "draw transparent"/translucent?
			],
			checkbox: {
				toggle: () => {
					tool_transparent_mode = !tool_transparent_mode;
					$G.trigger("option-changed");
				},
				check: () => !tool_transparent_mode,
			},
			description: localize("Makes the current selection either opaque or transparent."),
		},
	],
	[localize("&Colors")]: [
		{
			label: `${localize("&Edit Colors")}...`,
			speech_recognition: [
				"edit colors", "edit color", "edit custom colors", "edit custom color",
				"pick custom color", "choose custom color", "pick a custom color", "choose a custom color",
				"edit last color", "create new color", "choose new color", "create a new color", "pick a new color",
			],
			action: () => {
				show_edit_colors_window();
			},
			description: localize("Creates a new color."),
		},
		{
			label: localize("&Get Colors"),
			speech_recognition: [
				"get colors", "load colors", "load color palette", "load palette", "load color palette file", "load palette file", "load list of colors",
			],
			action: async () => {
				const { file } = await systemHooks.showOpenFileDialog({ formats: palette_formats });
				AnyPalette.loadPalette(file, (error, new_palette) => {
					if (error) {
						show_file_format_errors({ as_palette_error: error });
					} else {
						palette = new_palette.map((color) => color.toString());
						$colorbox.rebuild_palette();
						window.console?.log(`Loaded palette: ${palette.map(() => "%c█").join("")}`, ...palette.map((color) => `color: ${color};`));
					}
				});
			},
			description: localize("Uses a previously saved palette of colors."),
		},
		{
			label: localize("&Save Colors"),
			speech_recognition: [
				"save colors", "save list of colors", "save color palette", "save palette", "save color palette file", "save palette file",
			],
			action: () => {
				const ap = new AnyPalette.Palette();
				ap.name = "JS Paint Saved Colors";
				ap.numberOfColumns = 16; // 14?
				for (const color of palette) {
					const [r, g, b] = get_rgba_from_color(color);
					ap.push(new AnyPalette.Color({
						red: r / 255,
						green: g / 255,
						blue: b / 255,
					}));
				}
				systemHooks.showSaveFileDialog({
					dialogTitle: localize("Save Colors"),
					defaultFileName: localize("untitled.pal"),
					formats: palette_formats,
					getBlob: (format_id) => {
						const file_content = AnyPalette.writePalette(ap, AnyPalette.formats[format_id]);
						const blob = new Blob([file_content], { type: "text/plain" });
						return new Promise((resolve) => {
							sanity_check_blob(blob, () => {
								resolve(blob);
							});
						});
					},
				});
			},
			description: localize("Saves the current palette of colors to a file."),
		},
	],
	[localize("E&xtras")]: [
		{
			emoji_icon: "💄",
			label: localize("&Themes"),
			submenu: [
				{
					emoji_icon: "⚪",
					label: localize("&Modern Light"),
					speech_recognition: [
						"modern theme", "switch to modern theme", "use modern theme", "set theme to modern", "set theme modern", "switch to modern theme", "switch theme to modern", "switch theme modern",
						"modern light", "light modern",
					],
					action: () => { set_theme("modern.css"); },
					enabled: () => get_theme() != "modern.css",
					description: localize("Gives JS Paint a more modern look, with light colors."),
				},
				{
					emoji_icon: "⚫",
					label: localize("Mod&ern Dark"),
					speech_recognition: [
						"dark modern theme", "switch to dark modern theme", "use dark modern theme", "set theme to dark modern", "set theme dark modern", "switch to dark modern theme", "switch theme to dark modern", "switch theme dark modern",
						"modern dark", "dark modern",
					],
					action: () => { set_theme("modern-dark.css"); },
					enabled: () => get_theme() != "modern-dark.css",
					description: localize("Gives JS Paint a more modern look, with dark colors."),
				},
				{
					emoji_icon: "🌓",
					label: localize("&Toggle Light/Dark"),
					speech_recognition: [
						"toggle theme", "switch theme", "toggle light dark", "switch light dark", "toggle day night", "switch day night",
						"light dark toggle", "day night toggle", "theme toggle", "mode toggle",
						"toggle light mode", "toggle dark mode", "switch light mode", "switch dark mode"
					],
					action: () => {
						const current_theme = get_theme();
						if (current_theme === "modern.css" || current_theme === "classic.css" || current_theme === "bubblegum.css") {
							set_theme("modern-dark.css");
						} else {
							set_theme("modern.css");
						}
					},
					description: localize("Quickly switch between light and dark themes."),
				},
			]
			// ... existing code ...
		},
		{
			emoji_icon: "🌍",
			label: localize("&Language"),
			submenu: available_languages.map((available_language) => (
				{
					emoji_icon: get_language_emoji(available_language),
					label: get_language_endonym(available_language),
					action: () => {
						set_language(available_language);
					},
					enabled: () => get_language() != available_language,
					description: localize("Changes the language to %1.", get_iso_language_name(available_language)),
				}
			)),
		},
		{
			emoji_icon: "↕️",
			label: localize("&Vertical Color Box"),
			speech_recognition: [
				"toggle vertical color box", "toggle vertical color box mode",
				"toggle vertical colors box", "toggle vertical colors box mode",
				"toggle vertical palette", "toggle vertical palette mode",
				"toggle horizontal color box", "toggle horizontal color box mode",
				"toggle horizontal colors box", "toggle horizontal colors box mode",
				"toggle horizontal palette", "toggle horizontal palette mode",
				// @TODO: "use a vertical/horizontal color box", "place palette on the left", "make palette tall/wide", etc.
			],
			checkbox: {
				toggle: () => {
					change_url_param("vertical-color-box-mode", !/vertical-color-box-mode/i.test(location.hash));
				},
				check: () => {
					return /vertical-color-box-mode/i.test(location.hash);
				},
			},
			description: localize("Arranges the color box vertically."),
		},
	],
};

for (const [top_level_menu_key, menu] of Object.entries(menus)) {
	const top_level_menu_name = top_level_menu_key.replace(/&/, "");
	const add_literal_navigation_speech_recognition = (menu, ancestor_names) => {
		for (const menu_item of menu) {
			if (menu_item !== MENU_DIVIDER) {
				const menu_item_name = menu_item.label.replace(/&|\.\.\.|\(|\)/g, "");
				// console.log(menu_item_name);
				let menu_item_matchers = [menu_item_name];
				if (/\//.test(menu_item_name)) {
					menu_item_matchers = [
						menu_item_name,
						menu_item_name.replace(/\//, " "),
						menu_item_name.replace(/\//, " and "),
						menu_item_name.replace(/\//, " or "),
						menu_item_name.replace(/\//, " slash "),
					];
				}
				menu_item_matchers = menu_item_matchers.map((menu_item_matcher) => {
					return `${ancestor_names} ${menu_item_matcher}`;
				});
				menu_item.speech_recognition = (menu_item.speech_recognition || []).concat(menu_item_matchers);
				// console.log(menu_item_matchers, menu_item.speech_recognition);

				if (menu_item.submenu) {
					add_literal_navigation_speech_recognition(menu_item.submenu, `${ancestor_names} ${menu_item_name}`);
				}
			}
		}
	};
	add_literal_navigation_speech_recognition(menu, top_level_menu_name);
}

export { menus };

/**
 * Expands a shortcut label into an object with the label and a corresponding ARIA key shortcuts value.
 * Could handle "CtrlOrCmd" like Electron does, here, or just treat "Ctrl" as control or command.
 * Of course it would be more ergonomic if OS-GUI.js handled this sort of thing,
 * and I have thought about rewriting the OS-GUI API to mimic Electron's.
 * I also have some munging logic in electron-main.js related to this.
 * @param {string} shortcutLabel
 * @returns {{shortcutLabel?: string, ariaKeyShortcuts?: string}}
 */
function shortcut(shortcutLabel) {
	if (!shortcutLabel) return {};
	const ariaKeyShortcuts = shortcutLabel.replace(/Ctrl/g, "Control").replace(/\bDel\b/, "Delete");//.replace(/\bEsc\b/, "Escape").replace(/\bIns\b/, "Insert");
	if (!validateAriaKeyshortcuts(ariaKeyShortcuts)) {
		console.error(`Invalid ARIA key shortcuts: ${JSON.stringify(ariaKeyShortcuts)} (from shortcut label: ${JSON.stringify(shortcutLabel)}) (or validator is incomplete)`);
	}
	return {
		shortcutLabel,
		ariaKeyShortcuts,
	};
}

/**
 * Validates an aria-keyshortcuts value.
 *
 * AI-generated code (ChatGPT), prompted with the spec section: https://w3c.github.io/aria/#aria-keyshortcuts
 *
 * @param {string} value
 * @returns {boolean} valid
 */
function validateAriaKeyshortcuts(value) {
	// Define valid modifier and non-modifier keys based on UI Events KeyboardEvent key Values spec
	const modifiers = ["Alt", "Control", "Shift", "Meta", "AltGraph"];
	const nonModifiers = [
		"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
		"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
		"1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
		"Delete",
		"Enter", "Tab", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
		"PageUp", "PageDown", "End", "Home", "Escape", "Space", "Plus",
		"Minus", "Comma", "Period", "Slash", "Backslash", "Quote", "Semicolon",
		"BracketLeft", "BracketRight", "F1", "F2", "F3", "F4", "F5", "F6",
		"F7", "F8", "F9", "F10", "F11", "F12",
		// Add more non-modifier keys as needed
	];

	// Split the value into individual shortcuts
	const shortcuts = value.split(" ");

	// Function to validate a single shortcut
	function validateShortcut(shortcut) {
		const keys = shortcut.split("+");

		if (keys.length === 0) {
			return false;
		}

		let nonModifierFound = false;

		// Check each key in the shortcut
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];

			if (modifiers.includes(key)) {
				if (nonModifierFound) {
					// Modifier key found after a non-modifier key
					return false;
				}
			} else if (nonModifiers.includes(key)) {
				if (nonModifierFound) {
					// Multiple non-modifier keys found
					return false;
				}
				nonModifierFound = true;
			} else {
				// Invalid key
				return false;
			}
		}

		// Ensure at least one non-modifier key is present
		return nonModifierFound;
	}

	// Validate all shortcuts
	for (let i = 0; i < shortcuts.length; i++) {
		if (!validateShortcut(shortcuts[i])) {
			return false;
		}
	}

	return true;
}

/** @type {[string, boolean][]} */
const ariaKeyShortcutsTestCases = [
	["Control+A Shift+Alt+B", true],
	["Control+Shift+1", true],
	["Shift+Alt+T Control+5", true],
	["T", true],
	["ArrowLeft", true],
	["Shift+T Alt+Control", false],
	["T+Shift", false],
	["Alt", false],
	["IncredibleKey", false],
	["Ctrl+Shift+A", false],
];
for (const [ariaKeyShortcuts, expectedValidity] of ariaKeyShortcutsTestCases) {
	const returnedValidity = validateAriaKeyshortcuts(ariaKeyShortcuts);
	if (returnedValidity !== expectedValidity) {
		console.error(`validateAriaKeyshortcuts("${ariaKeyShortcuts}") returned ${returnedValidity} but expected ${expectedValidity}`);
	}
}

// Inject modern flat styles for dialog windows (flip/rotate, stretch/skew, attributes, etc.)
(function inject_modern_dialog_styles(){
	if (document.getElementById("modern-dialog-styles")) return;
	const style = document.createElement("style");
	style.id = "modern-dialog-styles";
	style.textContent = `
		/* Color variables */
		.os-window.dialog-window{ 
			--dlg-bg: rgba(255,255,255,.92);
			--dlg-border: rgba(229,231,235,.9);
			--dlg-title-bg: #eceff3;
			--dlg-title-fg: #111827;
		}
		@media (prefers-color-scheme: dark){
			.os-window.dialog-window{
				--dlg-bg: rgba(32,34,37,.92);
				--dlg-border: rgba(60,65,73,.9);
				--dlg-title-bg: #2b2f36;
				--dlg-title-fg: #e5e7eb;
			}
		}
		.os-window.dialog-window{ border-radius:12px!important; background:var(--dlg-bg)!important; backdrop-filter:saturate(120%) blur(6px); -webkit-backdrop-filter:saturate(120%) blur(6px); border:1px solid var(--dlg-border)!important; box-shadow:0 12px 36px rgba(0,0,0,.16)!important; }
		.os-window.dialog-window .window-titlebar{ height: 30px !important; padding: 0 8px !important; background: var(--dlg-title-bg) !important; border-bottom: 1px solid var(--dlg-border) !important; }
		.os-window.dialog-window .window-title{ line-height: 30px !important; font-size: 13px !important; color: var(--dlg-title-fg) !important; }
		/* Close button - even smaller */
		.os-window.dialog-window .window-close-button{ width:14px!important; height:14px!important; border-radius:7px!important; background:#e5e7eb!important; border:0!important; display:inline-flex; align-items:center; justify-content:center; margin-left:4px; color:#374151; position:relative; padding:0; }
		@media (prefers-color-scheme: dark){ .os-window.dialog-window .window-close-button{ background:#4b5563!important; color:#e5e7eb; } }
		.os-window.dialog-window .window-close-button{ background-image:none!important; border-image:none!important; }
		.os-window.dialog-window .window-close-button::before,
		.os-window.dialog-window .window-close-button::after{ display:none!important; }
		.os-window.dialog-window .window-close-button .window-button-icon{ background:none!important; -webkit-mask:none!important; mask:none!important; width:8px; height:8px; position:relative; display:block; }
		.os-window.dialog-window .window-close-button .window-button-icon::before,
		.os-window.dialog-window .window-close-button .window-button-icon::after{ content:""; position:absolute; left:50%; top:50%; width:8px; height:2px; background: currentColor; border-radius:1px; transform: translate(-50%, -50%) rotate(45deg); }
		.os-window.dialog-window .window-close-button .window-button-icon::after{ transform: translate(-50%, -50%) rotate(-45deg); }
		.os-window.dialog-window .window-close-button:hover{ background:#ef4444!important; color:#ffffff; }
		.os-window.dialog-window .window-close-button:active{ filter:brightness(0.95); }
	`;
	document.head.appendChild(style);
})();

// Observe dialog windows and apply modern class/inline resets to ensure styles take effect
(function observe_and_upgrade_dialogs(){
	function upgrade(win){
		if (!win.classList.contains("dialog-window")) return;
		if (win.classList.contains("modern-dialog")) return;
		win.classList.add("modern-dialog");
		// Inline hard resets defeat legacy border-image from theme
		win.style.borderImage = "none";
		win.style.borderWidth = "1px";
		const titlebar = win.querySelector('.window-titlebar');
		if (titlebar){
			titlebar.style.backgroundImage = 'none';
			titlebar.style.borderImage = 'none';
		}
	}
	const mo = new MutationObserver((muts)=>{
		for (const m of muts){
			for (const node of m.addedNodes){
				if (node.nodeType === 1){
					const el = /** @type {Element} */ (node);
					if (el.classList.contains('os-window')) upgrade(/** @type {HTMLElement} */(el));
					el.querySelectorAll?.('.os-window').forEach((w)=> upgrade(/** @type {HTMLElement} */(w)));
				}
			}
		}
	});
	mo.observe(document.body, { childList: true, subtree: true });
	// Also upgrade existing ones if already open
	document.querySelectorAll('.os-window').forEach((w)=> upgrade(/** @type {HTMLElement} */(w)));
})();

(function create_toolbar_when_ready(){
	function icon_url(name){
		return `images/toolbar/${name}.svg`;
	}
	function make_img_icon(name, alt){
		const img = document.createElement("img");
		img.src = icon_url(name);
		img.width = 16;
		img.height = 16;
		img.alt = alt || name;
		img.decoding = "async";
		img.loading = "eager";
		img.style.pointerEvents = "none";
		// Fallback to potential misspelling settting.svg
		img.onerror = () => { if (name === 'setting') img.src = 'images/toolbar/settting.svg'; };
		return img;
	}
	function make_button(title, icon_key, on_click, key){
		const btn = document.createElement("button");
		btn.className = "jspd-toolbar-btn";
		btn.type = "button";
		btn.title = title;
		if (key) btn.dataset.key = key;
		btn.appendChild(make_img_icon(icon_key, title));
		btn.addEventListener("click", (e)=>{ e.preventDefault(); on_click(); });
		return btn;
	}
	function make_divider(){
		const sep = document.createElement("span");
		sep.className = "jspd-toolbar-sep";
		sep.setAttribute("role", "separator");
		return sep;
	}
	function build_toolbar(){
		if (!window.menu_bar) return; // will try again shortly
		const host = window.menu_bar.element; // insert below menu bar
		const existing = document.querySelector(".jspd-toolbar");
		if (existing) {
			// Ensure new quick action buttons exist even if toolbar was created earlier
			const bar = existing;
			if (!bar.querySelector('[data-key="edit-colors"]')) {
				bar.appendChild(make_divider());
				bar.appendChild(make_button(localize("Edit Colors"), "setting-color", ()=> { show_edit_colors_window(); }, "edit-colors"));
			}
			return;
		}
		const bar = document.createElement("div");
		bar.className = "jspd-toolbar";
		// File group
		bar.appendChild(make_button(localize("New"), "file-new", ()=> file_new()));
		bar.appendChild(make_button(localize("Open"), "file-open", ()=> file_open()));
		bar.appendChild(make_button(localize("Save"), "file-save", ()=> file_save()));
		bar.appendChild(make_button(localize("Save As"), "file-save-as", ()=> file_save_as()));
		bar.appendChild(make_divider());
		// Edit group
		const undoButton = make_button(localize("Undo"), "edit-undo", ()=> undo());
		const redoButton = make_button(localize("Redo"), "edit-redo", ()=> redo());
		
		// Function to update button states
		const updateUndoRedoButtons = () => {
			undoButton.disabled = undos.length < 1;
			redoButton.disabled = redos.length < 1;
		};
		
		// Initial state
		updateUndoRedoButtons();
		
		// Listen for history changes
		$G.on("session-update", updateUndoRedoButtons);
		
		bar.appendChild(undoButton);
		bar.appendChild(redoButton);
		bar.appendChild(make_button(localize("Cut"), "edit-cut", ()=> edit_cut()));
		bar.appendChild(make_button(localize("Copy"), "edit-copy", ()=> edit_copy()));
		bar.appendChild(make_button(localize("Paste"), "edit-paste", ()=> edit_paste()));
		bar.appendChild(make_divider());
		// Image menu group
		bar.appendChild(make_button(localize("Flip/Rotate"), "image-flip-rotate", ()=> image_flip_and_rotate()));
		bar.appendChild(make_button(localize("Stretch/Skew"), "image-stretch-skew", ()=> image_stretch_and_skew()));
		bar.appendChild(make_button(localize("Invert Colors"), "image-invert-colors", ()=> image_invert_colors()));
		bar.appendChild(make_button(localize("Attributes"), "image-attributes", ()=> image_attributes()));
		bar.appendChild(make_button(localize("Clear Image"), "image-clear", ()=> { if (!selection) { clear(); } }));
		bar.appendChild(make_button(localize("Draw Opaque"), "image-draw-opaque", ()=> { tool_transparent_mode = !tool_transparent_mode; $G.trigger("option-changed"); }));
		bar.appendChild(make_button(localize("Edit Colors"), "setting-color", ()=> { show_edit_colors_window(); }, "edit-colors"));
		bar.appendChild(make_divider());
		// Theme toggle button
		const themeButton = make_button(localize("Toggle Theme"), "setting-daylight", ()=> {
			const current_theme = get_theme();
			let new_theme;
			
			if (current_theme === "modern.css" || current_theme === "classic.css" || current_theme === "bubblegum.css") {
				new_theme = "modern-dark.css";
			} else if (current_theme === "modern-dark.css" || current_theme === "dark.css" || current_theme === "occult.css") {
				new_theme = "modern.css";
			} else {
				new_theme = "modern.css";
			}
			
			set_theme(new_theme);
			
			// Update button icon based on new theme
			const isDarkTheme = new_theme === "modern-dark.css" || new_theme === "dark.css" || new_theme === "occult.css";
			const img = themeButton.querySelector("img");
			if (img) {
				img.src = isDarkTheme ? "images/toolbar/setting-night.svg" : "images/toolbar/setting-daylight.svg";
			}
		}, "theme-toggle");
		
		// Set initial icon based on current theme
		const current_theme = get_theme();
		const isDarkTheme = current_theme === "modern-dark.css" || current_theme === "dark.css" || current_theme === "occult.css";
		const img = themeButton.querySelector("img");
		if (img) {
			img.src = isDarkTheme ? "images/toolbar/setting-night.svg" : "images/toolbar/setting-daylight.svg";
		}
		
		bar.appendChild(themeButton);
		
		// Language toggle button
		const languageButton = make_button(localize("Toggle Language"), "setting-cn", ()=> {
			const current_language = get_language();
			let new_language;
			
			if (current_language === "zh" || current_language === "zh-simplified") {
				new_language = "en";
			} else {
				new_language = "zh";
			}
			
			// Directly save language and reload without confirmation dialog
			try {
				localStorage["mspaint language"] = new_language;
				location.reload();
			} catch (error) {
				show_error_message("Failed to store language preference. Make sure cookies / local storage is enabled in your browser settings.", error);
			}
		}, "language-toggle");
		
		// Set initial icon based on current language
		const current_language = get_language();
		const langImg = languageButton.querySelector("img");
		if (langImg) {
			langImg.src = (current_language === "zh" || current_language === "zh-simplified") ? "images/toolbar/setting-cn.svg" : "images/toolbar/setting-en.svg";
		}
		
		bar.appendChild(languageButton);
		// Insert toolbar into DOM
		host.after(bar);
		// Styles (scoped)
		const style = document.createElement("style");
		style.textContent = `
			.jspd-toolbar{ display:flex; gap:4px; align-items:center; padding:4px 6px; border-bottom:1px solid var(--ButtonDkShadow,#888); background: var(--ButtonFace,#eee); }
			.jspd-toolbar-btn{ display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border:1px solid var(--ButtonShadow,#bbb); background: var(--ButtonFace,#f8f8f8); color: var(--ButtonText,#000); padding:0; cursor:pointer; border-radius:4px; box-shadow: 0 1px 0 rgba(0,0,0,.06) inset; }
			.jspd-toolbar-btn:hover{ background: #ffffff; border-color: #aaa; }
			.jspd-toolbar-btn:active{ background: #f0f0f0; border-color: #999; }
			.jspd-toolbar-btn:disabled{ opacity: 0.5; cursor: not-allowed; background: var(--ButtonFace,#f0f0f0); color: var(--ButtonDkShadow,#888); }
			.jspd-toolbar-btn:disabled:hover{ background: var(--ButtonFace,#f0f0f0); border-color: var(--ButtonShadow,#bbb); }
			.jspd-toolbar-sep{ width:1px; height:18px; margin:0 6px; background: var(--ButtonShadow,#bbb); display:inline-block; }
			.jspd-toolbar-btn img{ width:16px; height:16px; display:block; }
		`;
		document.head.appendChild(style);
	}
	function try_build(){
		if (document.readyState === "complete" || document.readyState === "interactive"){
			setTimeout(build_toolbar, 0);
		} else {
			window.addEventListener("DOMContentLoaded", build_toolbar, { once: true });
		}
		let tries = 0;
		const iid = setInterval(()=>{
			if (document.querySelector(".jspd-toolbar")) { clearInterval(iid); return; }
			build_toolbar();
			if (++tries > 50) clearInterval(iid);
		}, 100);
	}
	try_build();
})();
