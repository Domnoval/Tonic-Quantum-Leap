/*
 * PRINTFUL EXPORT - Photoshop Script
 * ===================================
 * Exports the active document resized & DPI-set for Printful products.
 * 
 * USAGE:  File → Scripts → Browse → select this file
 *         Or install to: C:\Program Files\Adobe\Adobe Photoshop 2025\Presets\Scripts\
 *         Then access via File → Scripts → Printful Export
 *
 * Saves PNGs (transparent bg for DTG) and JPGs (for AOP/sublimation)
 * into a "Printful Exports" folder next to your source file.
 *
 * Color profile: sRGB (Printful requirement)
 * DPI: 150 for apparel/accessories, 300 for paper prints
 */

// ── Product Presets ──────────────────────────────────────────────────────
// Each preset: [name, widthInches, heightInches, dpi, format, notes]
var PRESETS = [
    // DTG (Direct-to-Garment) — PNG with transparency
    ["T-Shirt Front (DTG)",           15,   18,   300, "PNG", "Front print area - 4500x5400px"],
    ["T-Shirt Back (DTG)",            15,   18,   300, "PNG", "Back print area - 4500x5400px"],
    ["Hoodie Front (DTG)",            14,   16,   300, "PNG", "Hoodie front - 4200x4800px"],
    ["Hoodie Back (DTG)",             14,   18,   300, "PNG", "Hoodie back - 4200x5400px"],

    // All-Over Print (AOP) — JPG preferred
    ["AOP T-Shirt",                   62,   32,   300, "JPG", "All-over print tee - 18600x9600px"],
    ["AOP Hoodie",                    58,   50,   300, "JPG", "All-over print hoodie - 17400x15000px"],
    ["AOP Backpack",                  16,   18,   300, "PNG", "Backpack front - 4800x5400px"],
    ["AOP Fanny Pack",                14,    6,   300, "PNG", "Fanny pack front - 4200x1800px"],
    ["AOP Tote Bag",                  15,   15,   300, "JPG", "All-over tote - 4500x4500px"],

    // Accessories
    ["Phone Case",                     7,   10,   300, "PNG", "iPhone/Samsung case - 2100x3000px"],
    ["Mug (11oz)",                    9.5,   4,   300, "PNG", "Wraps around mug - 2850x1200px"],
    ["Mouse Pad",                      9,    8,   300, "PNG", "Standard mouse pad - 2700x2400px"],
    ["Sticker (4x4)",                  4,    4,   300, "PNG", "Die-cut sticker - 1200x1200px"],

    // Wall Art / Prints
    ["Poster 18x24",                  18,   24,   300, "JPG", "Standard poster - 5400x7200px"],
    ["Poster 24x36",                  24,   36,   300, "JPG", "Large poster - 7200x10800px"],
    ["Canvas 16x20",                  16,   20,   300, "JPG", "Gallery wrap canvas - 4800x6000px"],
    ["Canvas 24x36",                  24,   36,   300, "JPG", "Large canvas - 7200x10800px"],
    ["Framed Print 12x16",           12,   16,   300, "JPG", "Framed poster - 3600x4800px"],
];

// ── Main ─────────────────────────────────────────────────────────────────

function main() {
    if (!app.documents.length) {
        alert("No document open! Open an image first.");
        return;
    }

    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^.]+$/, "");

    // Build dialog
    var dlg = new Window("dialog", "Printful Export — Tonic Thought Studios");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];

    // Header
    var header = dlg.add("statictext", undefined, "Select products to export:");
    header.graphics.font = ScriptUI.newFont("Arial", "Bold", 14);

    // Source info
    var srcInfo = dlg.add("statictext", undefined,
        "Source: " + doc.width.as("px") + " × " + doc.height.as("px") + "px @ " +
        Math.round(doc.resolution) + " DPI");
    srcInfo.graphics.foregroundColor = srcInfo.graphics.newPen(
        srcInfo.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

    // Scrollable panel for checkboxes
    var panel = dlg.add("panel", undefined, "Products");
    panel.alignChildren = ["fill", "top"];
    panel.preferredSize = [500, 350];

    var checkboxes = [];
    var categories = {
        "DTG Apparel": [],
        "All-Over Print": [],
        "Accessories": [],
        "Wall Art": []
    };

    // Sort into categories
    for (var i = 0; i < PRESETS.length; i++) {
        var p = PRESETS[i];
        var cat;
        if (p[0].indexOf("DTG") > -1) cat = "DTG Apparel";
        else if (p[0].indexOf("AOP") > -1 || p[0].indexOf("Backpack") > -1 ||
                 p[0].indexOf("Fanny") > -1 || p[0].indexOf("Tote") > -1) cat = "All-Over Print";
        else if (p[0].indexOf("Poster") > -1 || p[0].indexOf("Canvas") > -1 ||
                 p[0].indexOf("Framed") > -1) cat = "Wall Art";
        else cat = "Accessories";
        categories[cat].push(i);
    }

    for (var catName in categories) {
        var catGroup = panel.add("group");
        catGroup.orientation = "column";
        catGroup.alignChildren = ["fill", "top"];
        var catLabel = catGroup.add("statictext", undefined, "— " + catName + " —");
        catLabel.graphics.font = ScriptUI.newFont("Arial", "Bold", 11);

        var indices = categories[catName];
        for (var j = 0; j < indices.length; j++) {
            var idx = indices[j];
            var p = PRESETS[idx];
            var pxW = Math.round(p[1] * p[3]);
            var pxH = Math.round(p[2] * p[3]);
            var label = p[0] + "  (" + pxW + "×" + pxH + "px, " + p[3] + "DPI, " + p[4] + ")";
            var cb = catGroup.add("checkbox", undefined, label);
            cb.presetIndex = idx;
            checkboxes.push(cb);
        }
    }

    // Select All / None
    var selGroup = dlg.add("group");
    var btnAll = selGroup.add("button", undefined, "Select All");
    var btnNone = selGroup.add("button", undefined, "Select None");
    var btnApparel = selGroup.add("button", undefined, "All Apparel");

    btnAll.onClick = function() {
        for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = true;
    };
    btnNone.onClick = function() {
        for (var i = 0; i < checkboxes.length; i++) checkboxes[i].value = false;
    };
    btnApparel.onClick = function() {
        for (var i = 0; i < checkboxes.length; i++) {
            var p = PRESETS[checkboxes[i].presetIndex];
            checkboxes[i].value = (p[0].indexOf("DTG") > -1 || p[0].indexOf("AOP") > -1 ||
                                   p[0].indexOf("Hoodie") > -1 || p[0].indexOf("Backpack") > -1);
        }
    };

    // Buttons
    var btnGroup = dlg.add("group");
    btnGroup.alignment = ["right", "bottom"];
    btnGroup.add("button", undefined, "Cancel", { name: "cancel" });
    var btnExport = btnGroup.add("button", undefined, "Export", { name: "ok" });

    if (dlg.show() !== 1) return; // cancelled

    // Gather selected presets
    var selected = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value) {
            selected.push(PRESETS[checkboxes[i].presetIndex]);
        }
    }

    if (selected.length === 0) {
        alert("No products selected!");
        return;
    }

    // Create output folder
    var docFolder = doc.path;
    var outFolder = new Folder(docFolder + "/Printful Exports/" + docName);
    if (!outFolder.exists) outFolder.create();

    // Convert to sRGB if needed
    var srgbProfile = "sRGB IEC61966-2.1";

    var exported = 0;

    for (var i = 0; i < selected.length; i++) {
        var preset = selected[i];
        var pName = preset[0];
        var wInch = preset[1];
        var hInch = preset[2];
        var dpi = preset[3];
        var fmt = preset[4];

        var targetW = Math.round(wInch * dpi);
        var targetH = Math.round(hInch * dpi);

        // Duplicate the document
        var dupe = doc.duplicate(pName);

        try {
            // Flatten for JPG, keep layers for PNG
            if (fmt === "JPG") {
                dupe.flatten();
            }

            // Convert to sRGB
            try {
                dupe.convertProfile(srgbProfile, Intent.RELATIVECOLORIMETRIC, true, true);
            } catch(e) {
                // May already be sRGB
            }

            // Resize with bicubic sharper (best for downscaling)
            dupe.resizeImage(
                new UnitValue(targetW, "px"),
                new UnitValue(targetH, "px"),
                dpi,
                ResampleMethod.BICUBICSHARPER
            );

            // Set resolution
            dupe.resizeImage(undefined, undefined, dpi, ResampleMethod.NONE);

            // Build filename
            var safeName = pName.replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "_");
            var filename = docName + "_" + safeName;

            if (fmt === "PNG") {
                var pngOpts = new PNGSaveOptions();
                pngOpts.compression = 6;
                pngOpts.interlaced = false;
                var pngFile = new File(outFolder + "/" + filename + ".png");
                dupe.saveAs(pngFile, pngOpts, true, Extension.LOWERCASE);
            } else {
                var jpgOpts = new JPEGSaveOptions();
                jpgOpts.quality = 12; // Max quality
                jpgOpts.embedColorProfile = true;
                jpgOpts.formatOptions = FormatOptions.PROGRESSIVE;
                jpgOpts.matte = MatteType.NONE;
                var jpgFile = new File(outFolder + "/" + filename + ".jpg");
                dupe.saveAs(jpgFile, jpgOpts, true, Extension.LOWERCASE);
            }

            exported++;
        } catch(e) {
            alert("Error exporting " + pName + ": " + e.message);
        } finally {
            dupe.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    alert("Exported " + exported + "/" + selected.length + " files!\n\nSaved to:\n" + outFolder.fsName);

    // Open the output folder
    outFolder.execute();
}

main();
