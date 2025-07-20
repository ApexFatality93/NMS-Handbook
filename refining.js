const refiningGrid = document.getElementById("refining-grid");
const refiningSearch = document.getElementById("search-bar");

let refiningData = {};

function createRefiningCard(recipe) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", recipe.ProductID);

    card.addEventListener("click", () => {
        window.location.href = `item.html?id=${recipe.ProductID}&type=substance`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = recipe.Icon_Filename.replace("DDS", "png").replace("TEXTURES", "TEXTURES").toUpperCase();
    icon.alt = recipe.Name_Text || recipe.Name;

    const rgba = `rgba(${recipe.Colour_R * 255}, ${recipe.Colour_G * 255}, ${recipe.Colour_B * 255}, ${recipe.Colour_A})`;
    icon.style.backgroundColor = rgba;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = recipe.NameLower_Text || recipe.Name;
    content.appendChild(title);

    card.appendChild(imageWrapper);
    card.appendChild(content);
    refiningGrid.appendChild(card);
}

function applyRefiningFilter() {
    const searchTerm = refiningSearch.value.toLowerCase().trim();
    refiningGrid.innerHTML = "";

    const sortedRecipes = Object.values(refiningData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedRecipes.forEach(recipe => {
        const name = (recipe.Name_Text || recipe.Name || "").toLowerCase();
        if (!searchTerm || name.includes(searchTerm)) {
            createRefiningCard(recipe);
        }
    });
}

fetch("./JSON_Files/Refining_Table.json")
    .then(res => res.json())
    .then(data => {
        refiningData = data;
        applyRefiningFilter();
    });

refiningSearch.addEventListener("input", applyRefiningFilter);
