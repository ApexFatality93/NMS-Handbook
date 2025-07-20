
const craftingGrid = document.getElementById("crafting-grid");
const craftingSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

let craftingData = {};

function createCraftingCard(item) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", item.ProductId);

    card.addEventListener("click", () => {
        window.location.href = `item.html?id=${item.ProductId}&type=product`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = item.Icon_Filename.replace("DDS", "png").replace("TEXTURES", "TEXTURES").toUpperCase();
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
    craftingGrid.appendChild(card);
}

function applyCraftingFilter() {
    const searchTerm = craftingSearch.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    craftingGrid.innerHTML = "";

    const sortedItems = Object.values(craftingData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedItems.forEach(item => {
        const name = (item.Name_Text || item.Name || "").toLowerCase();
        const itemCategory = item.WikiCategory || "Crafting";
        const matchesCategory = itemCategory === selectedCategory;
        if ((!searchTerm || name.includes(searchTerm)) && matchesCategory) {
            createCraftingCard(item);
        }
    });
}

function populateCategoryFilter() {
    const categories = new Set();
    Object.values(craftingData).forEach(item => {
        if (item.WikiCategory) categories.add(item.WikiCategory);
    });

    if (!categories.has("Crafting")) {
        categories.add("Crafting");
    }

    const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b));

    sorted.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = "Crafting";
}

fetch("./JSON Files/Crafting_Table.json")
    .then(res => res.json())
    .then(data => {
        craftingData = data;
        populateCategoryFilter();
        applyCraftingFilter();
    });

craftingSearch.addEventListener("input", applyCraftingFilter);
categoryFilter.addEventListener("change", applyCraftingFilter);
