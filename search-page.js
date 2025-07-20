const fullSearchInput = document.getElementById("full-search-input");
const resultsGrid = document.getElementById("search-results-grid");

let productData = {};
let substanceData = {};
let fishData = {};

// Load all JSON_files first
Promise.all([
    fetch("./JSON_Files/Product_Table.json").then(res => res.json()),
    fetch("./JSON_Files/Substance_Table.json").then(res => res.json()),
    fetch("./JSON_Files/Fish_Table.json").then(res => res.json())
]).then(([products, substances, fish]) => {
    productData = products;
    substanceData = substances;

    // De-dupe fish by Name
    const uniqueFishMap = new Map();
    Object.values(fish).forEach(f => {
        const name = f.NameLower_Text || f.Name;
        if (!uniqueFishMap.has(name)) uniqueFishMap.set(name, f);
    });
    fishData = Object.fromEntries(
        Array.from(uniqueFishMap.entries()).map(([_, f]) => [f.ProductID, f])
    );

    // Initial render from query param if any
    const urlParams = new URLSearchParams(window.location.search);
    const queryFromURL = urlParams.get("q") || "";
    fullSearchInput.value = queryFromURL;
    renderSearchResults(queryFromURL);

    // fullSearchInput.addEventListener("input", () => {
    //     const query = fullSearchInput.value.trim().toLowerCase();
    //     renderSearchResults(query);
    // });
    fullSearchInput.addEventListener("input", () => {
        const query = fullSearchInput.value.trim().toLowerCase();
    
        // Update URL bar without reloading the page
        const newUrl = new URL(window.location);
        newUrl.searchParams.set("q", query);
        window.history.replaceState({}, "", newUrl);
    
        renderSearchResults(query);
    });
});

function renderSearchResults(query) {
    resultsGrid.innerHTML = "";
    if (!query) return;

    const allItems = [];

    for (const [id, item] of Object.entries(productData)) {
        allItems.push({
            id,
            name: item.NameLower_Text,
            icon: item.Icon_Filename,
            rgba: [item.Colour_R, item.Colour_G, item.Colour_B, item.Colour_A],
            type: "product"
        });
    }

    for (const [id, item] of Object.entries(substanceData)) {
        allItems.push({
            id,
            name: item.NameLower_Text,
            icon: item.Icon_Filename,
            rgba: [item.Colour_R, item.Colour_G, item.Colour_B, item.Colour_A],
            type: "substance"
        });
    }

    for (const [id, fish] of Object.entries(fishData)) {
        allItems.push({
            id,
            name: fish.NameLower_Text || fish.Name,
            icon: fish.Icon_Filename,
            rgba: [fish.Colour_R, fish.Colour_G, fish.Colour_B, fish.Colour_A],
            type: "product"
        });
    }

    const matches = allItems.filter(item => item.name?.toLowerCase().includes(query));
    matches.forEach(createSearchCard);
}

function createSearchCard(item) {
    const card = document.createElement("div");
    card.className = "product-card";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = item.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = item.name;

    if (item.rgba && item.rgba.length === 4) {
        const [r, g, b, a] = item.rgba;
        icon.style.backgroundColor = `rgba(${parseFloat(r) * 255}, ${parseFloat(g) * 255}, ${parseFloat(b) * 255}, ${a})`;
    }

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h4");
    title.textContent = item.name;
    content.appendChild(title);

    card.appendChild(imageWrapper);
    card.appendChild(content);

    card.addEventListener("click", () => {
        const params = new URLSearchParams({ id: item.id, type: item.type });
        window.location.href = `item.html?${params.toString()}`;
    });

    resultsGrid.appendChild(card);
}
