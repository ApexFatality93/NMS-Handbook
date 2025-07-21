
const baitGrid = document.getElementById("bait-grid");
const usedForSelect = document.getElementById("usedfor-filter");
const raritySelect = document.getElementById("rarity-filter");
const sizeSelect = document.getElementById("size-filter");
const searchBar = document.getElementById("search-bar");

let baitData = {};

function createBaitCard(bait, id) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", id);

    card.addEventListener("click", () => {
        window.location.href = `item.html?id=${encodeURIComponent(id)}&type=${bait.Source}`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = bait.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = bait.NameLower_Text;

    const r = parseFloat(bait.Colour_R || 0);
    const g = parseFloat(bait.Colour_G || 0);
    const b = parseFloat(bait.Colour_B || 0);
    const a = parseFloat(bait.Colour_A || 1);
    const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    icon.style.backgroundColor = rgba;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = bait.NameLower_Text;
    content.appendChild(title);

    const used = document.createElement("p");
    used.textContent = `Used For: ${bait.UsedFor || "—"}`;
    content.appendChild(used);

    const rarity = document.createElement("p");
    rarity.textContent = bait.RarityPercent != null ? `Rarity: ${bait.RarityPercent}%` : "Rarity: —";
    content.appendChild(rarity);

    const size = document.createElement("p");
    size.textContent = bait.SizePercent != null ? `Size: ${bait.SizePercent}%` : "Size: —";
    content.appendChild(size);

    card.appendChild(imageWrapper);
    card.appendChild(content);

    baitGrid.appendChild(card);
}

function clearGrid() {
    baitGrid.innerHTML = "";
}

function applyFilters() {
    const selectedUsedFor = usedForSelect.value.toLowerCase();
    const raritySort = raritySelect.value;
    const sizeSort = sizeSelect.value;
    const searchTerm = searchBar.value.toLowerCase().trim();

    clearGrid();

    let filtered = Object.entries(baitData).filter(([_, bait]) => {
        const name = bait.NameLower_Text.toLowerCase();
        const usedFor = (bait.UsedFor || "").toLowerCase();
        const matchesUsedFor = selectedUsedFor === "all" || usedFor === selectedUsedFor;
        const matchesSearch = !searchTerm || name.includes(searchTerm);
        return matchesUsedFor && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        const baitA = a[1];
        const baitB = b[1];

        // Rarity sort has higher priority than size
        if (raritySort !== "none") {
            const valA = baitA.RarityPercent ?? 0;
            const valB = baitB.RarityPercent ?? 0;
            return raritySort === "asc" ? valA - valB : valB - valA;
        }

        if (sizeSort !== "none") {
            const valA = baitA.SizePercent ?? 0;
            const valB = baitB.SizePercent ?? 0;
            return sizeSort === "asc" ? valA - valB : valB - valA;
        }

        // Default: alphabetical
        return baitA.NameLower_Text.toLowerCase().localeCompare(baitB.NameLower_Text.toLowerCase());
    });

    filtered.forEach(([id, bait]) => {
        createBaitCard(bait, id);
    });
}

function populateUsedForDropdown(set) {
    usedForSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "All";
    defaultOption.textContent = "All";
    usedForSelect.appendChild(defaultOption);

    Array.from(set).sort().forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        usedForSelect.appendChild(option);
    });
}

// Load bait data and initialize
fetch("./JSON_Files/Bait_Table.json")
    .then(response => response.json())
    .then(data => {
        baitData = data;

        const usedForSet = new Set();
        Object.values(baitData).forEach(bait => {
            if (bait.UsedFor) usedForSet.add(bait.UsedFor);
        });

        populateUsedForDropdown(usedForSet);
        applyFilters();
    });

usedForSelect.addEventListener("change", applyFilters);
raritySelect.addEventListener("change", applyFilters);
sizeSelect.addEventListener("change", applyFilters);
searchBar.addEventListener("input", applyFilters);

document.getElementById("reset-filters").addEventListener("click", () => {
    usedForSelect.value = "All";
    raritySelect.value = "none";
    sizeSelect.value = "none";
    searchBar.value = "";
    applyFilters();
});