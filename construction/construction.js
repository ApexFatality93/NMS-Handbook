
const constructionGrid = document.getElementById("construction-grid");
const constructionSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

let constructionData = {};

function createConstructionCard(item) {
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
    constructionGrid.appendChild(card);
}

function applyConstructionFilter() {
    const searchTerm = constructionSearch.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    constructionGrid.innerHTML = "";

    const sortedItems = Object.values(constructionData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedItems.forEach(item => {
        const name = (item.Name_Text || item.Name || "").toLowerCase();
        const itemCategory = item.Subtitle_Text || "Construction";
        const matchesCategory = selectedCategory === "All" || itemCategory === selectedCategory;
        if ((!searchTerm || name.includes(searchTerm)) && matchesCategory) {
            createConstructionCard(item);
        }
    });
}

function populateCategoryFilter() {
    const categoryCounts = {};

    // Count how many times each Subtitle_Text appears
    Object.values(constructionData).forEach(item => {
        const cat = item.Subtitle_Text;
        if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    // Only include categories with more 4 or more items
    const filteredCategories = Object.keys(categoryCounts).filter(cat => categoryCounts[cat] > 3);
    filteredCategories.sort((a, b) => a.localeCompare(b));

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.textContent = "All";
    categoryFilter.appendChild(allOption);

    filteredCategories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = "Advanced Freighter Module";
}

fetch("/JSON_Files/Building_Parts_Table.json")
    .then(res => res.json())
    .then(data => {
        constructionData = data;
        populateCategoryFilter();
        applyConstructionFilter();
    });

constructionSearch.addEventListener("input", applyConstructionFilter);
categoryFilter.addEventListener("change", applyConstructionFilter);
