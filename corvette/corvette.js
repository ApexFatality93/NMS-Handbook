
const corvetteGrid = document.getElementById("fossil-grid");
const corvetteSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

let corvetteData = {};

function createCorvetteCard(item) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", item.ProductId);

    card.addEventListener("click", () => {
        window.location.href = `/item/?id=${item.ProductId}&type=construction`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = item.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = item.Name_Text || item.Name;

    const rgba = `rgba(${item.Colour_R * 255}, ${item.Colour_G * 255}, ${item.Colour_B * 255}, ${item.Colour_A})`;
    icon.style.backgroundColor = rgba;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = item.NameLower_Text || item.Name;
    content.appendChild(title);

    card.appendChild(imageWrapper);
    card.appendChild(content);
    corvetteGrid.appendChild(card);
}

function applyCorvetteFilter() {
    const searchTerm = corvetteSearch.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    corvetteGrid.innerHTML = "";

    const sortedItems = Object.values(corvetteData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // --- de-dupe by display name (first occurrence wins) ---
    const seen = new Set();

    sortedItems.forEach(item => {
        const nameLower = (item.NameLower_Text || item.Name_Text || item.Name || "").toLowerCase();
        if (!nameLower) return;               // skip bad entries
        if (seen.has(nameLower)) return;       // drop duplicates
        seen.add(nameLower);

        const itemCategory = item.Category || "Other";
        const matchesCategory = selectedCategory === "All" || itemCategory === selectedCategory;

        const matchesSearch =
            !searchTerm ||
            nameLower.includes(searchTerm) ||
            (item.Subtitle_Text || "").toLowerCase().includes(searchTerm) ||
            (item.Description_Text || "").toLowerCase().includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            createCorvetteCard(item);
        }
    });
}

function populateCategoryFilter() {
    const categories = new Set();
    Object.values(corvetteData).forEach(item => {
        if (item.Category) categories.add(item.Category);
    });

    const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b));

    categoryFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.textContent = "All";
    categoryFilter.appendChild(allOption);

    sorted.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = "All";
}

fetch("/JSON_Files/Corvette_Parts_Table.json")
    .then(res => res.json())
    .then(data => {
        corvetteData = data;
        populateCategoryFilter();
        applyCorvetteFilter();
    });

corvetteSearch.addEventListener("input", applyCorvetteFilter);
categoryFilter.addEventListener("change", applyCorvetteFilter);
