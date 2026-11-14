
const MAX_QTY = 9999;
const MAX_SEARCH_RESULTS = 30;
const STORAGE_KEY = "nmsh-calculator-list";
const TYPE_LABELS = { product: "Product", technology: "Technology", construction: "Base Part" };

const searchInput = document.getElementById("calc-search");
const searchResults = document.getElementById("calc-search-results");
const listEl = document.getElementById("calc-list");
const emptyEl = document.getElementById("calc-empty");
const actionsEl = document.getElementById("calc-list-actions");
const resultsEl = document.getElementById("calc-results");
const rawEl = document.getElementById("calc-raw");
const stepsEl = document.getElementById("calc-steps");
const stepsToggle = document.getElementById("calc-steps-toggle");

let craftingData = {};
let catalog = {};
let list = [];

const clampQty = n => Math.min(Math.max(parseInt(n, 10) || 1, 1), MAX_QTY);

function makeInfo(id, type, item) {
    return {
        Id: id,
        Type: type,
        NameLower_Text: item.NameLower_Text || item.Name_Text || id,
        Icon_Filename: item.Icon_Filename,
        Colour_R: item.Colour_R, Colour_G: item.Colour_G, Colour_B: item.Colour_B, Colour_A: item.Colour_A
    };
}

function buildCatalog(crafting, technology, construction) {
    for (const [id, item] of Object.entries(crafting)) {
        if (!item.NameLower_Text || !Array.isArray(item.Ingredients) || !item.Ingredients.length) continue;
        const info = makeInfo(id, "product", item);
        
        catalog[`product:${id}`] = {
            key: `product:${id}`, type: "product", id, info, subtitle: item.Subtitle_Text || "",
            ingredients: [{ ...info, Amount: 1 }]
        };
    }
    for (const [type, table] of [["technology", technology], ["construction", construction]]) {
        for (const [id, item] of Object.entries(table)) {
            if (!item.NameLower_Text || !Array.isArray(item.Requirements) || !item.Requirements.length) continue;
            catalog[`${type}:${id}`] = {
                key: `${type}:${id}`, type, id, info: makeInfo(id, type, item), subtitle: item.Subtitle_Text || "",
                ingredients: item.Requirements
            };
        }
    }
}

// --- Saving and loading the list ---

function parseList(text) {
    const result = [];
    for (const part of (text || "").split(",")) {
        const [type, id, qty] = part.split(":");
        const key = `${type}:${id}`;
        if (catalog[key]) addToList(result, key, clampQty(qty));
    }
    return result;
}

function addToList(target, key, qty) {
    const existing = target.find(entry => entry.key === key);
    if (existing) existing.qty = clampQty(existing.qty + qty);
    else target.push({ key, qty });
}

function listToText() {
    return list.map(entry => `${entry.key}:${entry.qty}`).join(",");
}

function saveList() {
    const url = new URL(window.location);
    url.searchParams.delete("add");
    if (list.length) url.searchParams.set("items", listToText());
    else url.searchParams.delete("items");
    history.replaceState(null, "", url);

    try {
        localStorage.setItem(STORAGE_KEY, listToText());
    } catch (e) { /* storage unavailable */ }
}

function loadList() {
    const params = new URLSearchParams(window.location.search);
    let saved = "";
    try {
        saved = localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) { /* storage unavailable */ }

    list = parseList(params.has("items") ? params.get("items") : saved);


    for (const entry of parseList(params.get("add"))) addToList(list, entry.key, entry.qty);

    saveList();
}

// --- Search ---

function renderSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.replaceChildren();
    if (!query) {
        searchResults.hidden = true;
        return;
    }

    const matches = Object.values(catalog)
        .filter(entry => entry.info.NameLower_Text.toLowerCase().includes(query))
        .sort((a, b) => {
            const aStarts = a.info.NameLower_Text.toLowerCase().startsWith(query) ? 0 : 1;
            const bStarts = b.info.NameLower_Text.toLowerCase().startsWith(query) ? 0 : 1;
            return aStarts - bStarts || a.info.NameLower_Text.localeCompare(b.info.NameLower_Text);
        })
        .slice(0, MAX_SEARCH_RESULTS);

    if (!matches.length) {
        const none = document.createElement("li");
        none.className = "calc-search-none";
        none.textContent = "No craftable items found";
        searchResults.appendChild(none);
    }

    for (const entry of matches) {
        const row = document.createElement("li");
        row.className = "calc-search-result";
        row.tabIndex = 0;

        const text = document.createElement("div");
        text.className = "calc-search-text";
        const name = document.createElement("span");
        name.className = "calc-search-name";
        name.textContent = entry.info.NameLower_Text;
        const meta = document.createElement("span");
        meta.className = "calc-search-meta";
        meta.textContent = [TYPE_LABELS[entry.type], entry.subtitle].filter(Boolean).join(" · ");
        text.append(name, meta);

        row.append(breakdownIcon(entry.info, "ingredient-icon"), text);

        const choose = () => {
            addToList(list, entry.key, 1);
            searchInput.value = "";
            searchResults.hidden = true;
            update();
            searchInput.focus();
        };
        row.addEventListener("click", choose);
        row.addEventListener("keydown", e => {
            if (e.key === "Enter") choose();
        });

        searchResults.appendChild(row);
    }
    searchResults.hidden = false;
}

// --- List ---

function createListRow(entry) {
    const item = catalog[entry.key];
    const row = document.createElement("li");
    row.className = "calc-list-item";

    const icon = breakdownIcon(item.info, "calc-list-icon");

    const text = document.createElement("div");
    text.className = "calc-list-text";
    const link = document.createElement("a");
    link.className = "ingredient-name calc-list-name";
    link.href = breakdownItemUrl(item.info);
    link.textContent = item.info.NameLower_Text;
    const meta = document.createElement("span");
    meta.className = "calc-search-meta";
    meta.textContent = TYPE_LABELS[item.type];
    text.append(link, meta);

    const controls = document.createElement("div");
    controls.className = "breakdown-controls calc-list-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "breakdown-qty-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Decrease ${item.info.NameLower_Text}`);

    const input = document.createElement("input");
    input.type = "number";
    input.className = "breakdown-qty-input";
    input.min = "1";
    input.max = String(MAX_QTY);
    input.value = entry.qty;
    input.inputMode = "numeric";
    input.setAttribute("aria-label", `Quantity of ${item.info.NameLower_Text}`);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "breakdown-qty-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Increase ${item.info.NameLower_Text}`);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "calc-remove-btn";
    remove.textContent = "✕";
    remove.title = "Remove";
    remove.setAttribute("aria-label", `Remove ${item.info.NameLower_Text}`);

    const setQty = qty => {
        entry.qty = clampQty(qty);
        input.value = entry.qty;
        update(false);
    };

    input.addEventListener("input", () => {
        if (input.value !== "") {
            entry.qty = clampQty(input.value);
            update(false);
        }
    });
    input.addEventListener("change", () => setQty(input.value));
    minus.addEventListener("click", () => setQty(entry.qty - 1));
    plus.addEventListener("click", () => setQty(entry.qty + 1));
    remove.addEventListener("click", () => {
        list = list.filter(e => e !== entry);
        update();
    });

    controls.append(minus, input, plus, remove);
    row.append(icon, text, controls);
    return row;
}

// --- Results ---

function renderResults() {
    if (!list.length) {
        resultsEl.hidden = true;
        return;
    }

    // Combine everything into one ingredient list, scaled by each item's quantity
    const ingredients = [];
    for (const entry of list) {
        for (const ing of catalog[entry.key].ingredients) {
            ingredients.push({ ...ing, Amount: (Number(ing.Amount) || 1) * entry.qty });
        }
    }

    const { raw, steps } = Breakdown.compute(ingredients, 1, craftingData);
    rawEl.replaceChildren(...raw.map(createRawMaterialCard));
    stepsEl.replaceChildren(...steps.map(createBreakdownStep));
    stepsToggle.dataset.count = steps.length;
    stepsToggle.parentElement.hidden = steps.length === 0;
    updateStepsToggle();
    resultsEl.hidden = false;
}

function updateStepsToggle() {
    stepsToggle.textContent = `${stepsEl.hidden ? "Show" : "Hide"} crafting steps (${stepsToggle.dataset.count || 0})`;
    stepsToggle.setAttribute("aria-expanded", String(!stepsEl.hidden));
}

function update(redrawList = true) {
    if (redrawList) listEl.replaceChildren(...list.map(createListRow));
    emptyEl.hidden = list.length > 0;
    actionsEl.hidden = list.length === 0;
    renderResults();
    saveList();
}

// --- Setup ---

stepsToggle.addEventListener("click", () => {
    stepsEl.hidden = !stepsEl.hidden;
    updateStepsToggle();
});

document.getElementById("calc-clear").addEventListener("click", () => {
    list = [];
    update();
});

document.getElementById("calc-copy-link").addEventListener("click", () => {
    const confirmation = document.getElementById("calc-copy-confirmation");
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            confirmation.hidden = false;
            setTimeout(() => { confirmation.hidden = true; }, 2000);
        })
        .catch(err => console.error("Failed to copy:", err));
});

searchInput.addEventListener("input", renderSearch);
searchInput.addEventListener("focus", renderSearch);
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const first = searchResults.querySelector(".calc-search-result");
        if (first) first.click();
    } else if (e.key === "Escape") {
        searchResults.hidden = true;
    }
});
document.addEventListener("click", e => {
    if (!e.target.closest(".calc-search-wrapper")) searchResults.hidden = true;
});

Promise.all([
    fetch("/JSON_Files/Crafting_Table.json").then(res => res.json()),
    fetch("/JSON_Files/Technology_Table.json").then(res => res.json()),
    fetch("/JSON_Files/Building_Parts_Table.json").then(res => res.json())
]).then(([crafting, technology, construction]) => {
    craftingData = crafting;
    buildCatalog(crafting, technology, construction);
    loadList();
    update();
    searchInput.disabled = false;
    searchInput.placeholder = "Search products, technology and base parts...";
}).catch(err => {
    console.error("Failed to load calculator data:", err);
    searchInput.placeholder = "Couldn't load item data. Please refresh the page.";
});
