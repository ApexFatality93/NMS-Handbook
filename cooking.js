const cookingGrid = document.getElementById("cooking-grid");
const cookingSearch = document.getElementById("search-bar");

let cookingData = {};

function createCookingCard(recipe) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", recipe.ProductID);

    card.addEventListener("click", () => {
        window.location.href = `item.html?id=${recipe.ProductID}&type=product`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = recipe.Icon_Filename.replace("DDS", "png");
    icon.alt = recipe.Name_Text || recipe.Name;

    const rgba = `rgba(${recipe.Colour_R * 255}, ${recipe.Colour_G * 255}, ${recipe.Colour_B * 255}, ${recipe.Colour_A})`;
    icon.style.backgroundColor = rgba;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = recipe.NameLower_Text || recipe.Name;
    content.appendChild(title);

    // const ingredients = document.createElement("p");
    // ingredients.textContent = `Ingredients: ${recipe.Ingredients.map(i => `${i.NameLower_Text} (x${i.Amount})`).join(", ")}`;
    // content.appendChild(ingredients);

    card.appendChild(imageWrapper);
    card.appendChild(content);
    cookingGrid.appendChild(card);
}

function applyCookingFilter() {
    const searchTerm = cookingSearch.value.toLowerCase().trim();
    cookingGrid.innerHTML = "";

    const sortedRecipes = Object.values(cookingData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedRecipes.forEach(recipe => {
        const name = (recipe.Name_Text || recipe.Name || "").toLowerCase();
        if (!searchTerm || name.includes(searchTerm)) {
            createCookingCard(recipe);
        }
    });
}

fetch("./JSON_Files/Cooking_Table.json")
    .then(res => res.json())
    .then(data => {
        cookingData = data;
        applyCookingFilter();
    });

cookingSearch.addEventListener("input", applyCookingFilter);
