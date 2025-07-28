
const datasetSelect = document.getElementById("dataset-select");
const categorySelect = document.getElementById("category-select");

let productData = {};
let substanceData = {};

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        dataset: params.get("dataset") || "products",
        category: params.get("category") || "All"
    };
}

function updateQueryParams(dataset, category) {
    const url = new URL(window.location);

    // Always set both parameters, even if value is "All"
    url.searchParams.set("dataset", dataset);
    url.searchParams.set("category", category);

    history.replaceState(null, "", url);
}

// Populate product category dropdown using "Type"
function populateProductCategories(data, selectedCategory = "All") {
    const types = new Set();
    for (const key in data) {
        const item = data[key];
        if (item.Type) types.add(item.Type);
    }

    const sortedTypes = Array.from(types).sort();
    categorySelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "All";
    defaultOption.textContent = "All";
    categorySelect.appendChild(defaultOption);

    for (const type of sortedTypes) {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        categorySelect.appendChild(option);
    }

    categorySelect.value = sortedTypes.includes(selectedCategory) ? selectedCategory : "All";
}

// Populate substance category dropdown using "Category"
function populateSubstanceCategories(data, selectedCategory = "All") {
    const categories = new Set();
    for (const key in data) {
        const item = data[key];
        if (item.Category) categories.add(item.Category);
    }

    const sortedCategories = Array.from(categories).sort();
    categorySelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "All";
    defaultOption.textContent = "All";
    categorySelect.appendChild(defaultOption);

    for (const category of sortedCategories) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }

    categorySelect.value = sortedCategories.includes(selectedCategory) ? selectedCategory : "All";
}

// Change dropdown and URL when dataset or category changes
function handleFilterChange() {
    const dataset = datasetSelect.value;

    // Populate new dropdown first
    if (dataset === "products") {
        populateProductCategories(productData);
    } else {
        populateSubstanceCategories(substanceData);
    }

    // Now get the newly updated category value
    const category = categorySelect.value;

    // Update the URL using the latest values
    updateQueryParams(dataset, category);

    displayItems();
}

function displayItems() {
    const dataset = datasetSelect.value;
    const category = categorySelect.value;
    const gridContainer = document.getElementById("product-grid");
    gridContainer.innerHTML = ""; // Clear previous items

    const data = dataset === "products" ? productData : substanceData;

    for (const key in data) {
        const item = data[key];

        // Apply filter
        if (category !== "All") {
            const field = dataset === "products" ? item.Type : item.Category;
            if (field !== category) continue;
        }

        // Create card
        const card = document.createElement("div");
        card.className = "product-card";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "image-wrapper";

        const icon = document.createElement("img");
        icon.className = "product-icon";
        icon.style.backgroundColor = `rgba(${parseFloat(item.Colour_R) * 255}, ${parseFloat(item.Colour_G) * 255}, ${parseFloat(item.Colour_B) * 255}, ${item.Colour_A})`;
        icon.src = item.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
        icon.alt = item.Name_Text || item.Name;
        imageWrapper.appendChild(icon);

        const title = document.createElement("h4");
        title.textContent = item.NameLower_Text || item.Name;

        card.appendChild(imageWrapper);
        card.appendChild(title);
        gridContainer.appendChild(card);

        // Make it clickable
        const type = dataset === "products" ? "product" : "substance";
        card.addEventListener("click", () => {
            window.location.href = `/item/?id=${encodeURIComponent(key)}&type=${type}`;
        });
    }
}

// Initial fetch and setup
Promise.all([
    fetch("/JSON_Files/Product_Table.json").then(res => res.json()),
    fetch("/JSON_Files/Substance_Table.json").then(res => res.json())
]).then(([productJson, substanceJson]) => {
    productData = productJson;
    substanceData = substanceJson;

    const { dataset, category } = getQueryParams();

    // If no parameters present in URL, set default ones
    if (!window.location.search) {
        updateQueryParams(dataset, category);
    }

    datasetSelect.value = dataset;

    if (dataset === "products") {
        populateProductCategories(productData, category);
    } else {
        populateSubstanceCategories(substanceData, category);
    }

    // Event listeners
    datasetSelect.addEventListener("change", handleFilterChange);
    categorySelect.addEventListener("change", () => {
        const dataset = datasetSelect.value;
        const category = categorySelect.value;
        updateQueryParams(dataset, category);
        
        displayItems();
    });

    displayItems();
});
