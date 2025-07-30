
const fabricationGrid = document.getElementById("fabrication-grid");
const fabricationSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

let fabricationData = {};

function createFabricationCard(item) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", item.ProductId);

    card.addEventListener("click", () => {
        window.location.href = `/item/?id=${item.ProductId}&type=fabrication`;
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
    fabricationGrid.appendChild(card);
}

function applyFabricationFilter() {
    const searchTerm = fabricationSearch.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    fabricationGrid.innerHTML = "";

    const sortedItems = Object.values(fabricationData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedItems.forEach(item => {
        const name = (item.Name_Text || item.Name || "").toLowerCase();
        const itemCategory = item.Type || "Ship";
        const matchesCategory = selectedCategory === "All" || itemCategory === selectedCategory;
        if ((!searchTerm || name.includes(searchTerm)) && matchesCategory) {
            createFabricationCard(item);
        }
    });
}

function populateCategoryFilter() {
    const categories = new Set();
    Object.values(fabricationData).forEach(item => {
        if (item.Type) categories.add(item.Type);
    });

    const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b));

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

fetch("/JSON_Files/Ship_Part_Table.json")
    .then(res => res.json())
    .then(data => {
        fabricationData = data;
        populateCategoryFilter();
        applyFabricationFilter();
    });

fabricationSearch.addEventListener("input", applyFabricationFilter);
categoryFilter.addEventListener("change", applyFabricationFilter);
