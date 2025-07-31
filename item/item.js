function sanitizeText(text) {
    return text.replace(/<[^>]*>/g, "").trim();
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        type: params.get('type') // 'product', 'substance', etc.
    };
}

function createCookingRecipeSection(cookingItem, recipes) {
    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Cooking Recipes";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";

    const recipeCards = [];

    recipes.forEach((recipe, index) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        // Output product name as header
        const outputHeader = document.createElement("h4");
        outputHeader.textContent = cookingItem.NameLower_Text || `Recipe ${index + 1}`;
        card.appendChild(outputHeader);

        // Output icon
        const outputIcon = document.createElement("img");
        outputIcon.className = "ingredient-icon";
        outputIcon.src = cookingItem.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
        const rgba = `rgba(${cookingItem.Colour_R * 255}, ${cookingItem.Colour_G * 255}, ${cookingItem.Colour_B * 255}, ${cookingItem.Colour_A})`;
        outputIcon.style.backgroundColor = rgba;
        card.appendChild(outputIcon);

        // Ingredient text
        const ingredientText = document.createElement("div");
        ingredientText.className = "ingredient-text";
        ingredientText.textContent = "Ingredients:";
        card.appendChild(ingredientText);

        // Ingredient grid
        const ingredientGrid = document.createElement("div");
        ingredientGrid.className = "ingredient-grid";

        recipe.Ingredients.forEach(ingredient => {
            const ingredientCard = document.createElement("div");
            ingredientCard.className = "ingredient";

            const icon = document.createElement("img");
            icon.className = "ingredient-icon";
            icon.src = ingredient.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
            icon.alt = ingredient.NameLower_Text || ingredient.Name;
            const rgba = `rgba(${ingredient.Colour_R * 255}, ${ingredient.Colour_G * 255}, ${ingredient.Colour_B * 255}, ${ingredient.Colour_A})`;
            icon.style.backgroundColor = rgba;

            const info = document.createElement("div");
            info.className = "ingredient-info";

            const link = document.createElement("a");
            link.href = `/item/?id=${ingredient.Id}&type=${ingredient.Type.toLowerCase()}`;
            link.textContent = ingredient.NameLower_Text;
            link.className = "ingredient-name";

            const qty = document.createElement("span");
            qty.className = "ingredient-qty";
            qty.textContent = ` (x${ingredient.Amount})`;

            info.appendChild(link);
            info.appendChild(qty);

            ingredientCard.appendChild(icon);
            ingredientCard.appendChild(info);
            ingredientGrid.appendChild(ingredientCard);
        });

        card.appendChild(ingredientGrid);

        // Hide recipes after the first 4
        if (index >= 4) card.style.display = "none";

        recipeCards.push(card);
        grid.appendChild(card);
    });

    section.appendChild(grid);

    if (recipes.length > 4) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "recipe-toggle-btn";
        toggleBtn.textContent = "See More";

        let expanded = false;

        toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            recipeCards.forEach((card, index) => {
                card.style.display = (expanded || index < 4) ? "" : "none";
            });
            toggleBtn.textContent = expanded ? "See Less" : "See More";
        });

        section.appendChild(toggleBtn);
    }

    return section;
}

function createCookingUsedInSection(itemId, cookingData) {
    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Used In (Cooking)";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";

    const usedInCards = [];

    Object.values(cookingData).forEach(product => {
        product.Recipes.forEach(recipe => {
            const isUsed = recipe.Ingredients.some(ing => ing.Id === itemId);
            if (isUsed) {
                const card = document.createElement("div");
                card.className = "recipe-card";

                // Linked product name as header
                const outputHeader = document.createElement("h4");
                const productLink = document.createElement("a");
                productLink.href = `/item/?id=${product.ProductID}&type=product`;
                productLink.textContent = product.NameLower_Text;
                productLink.className = "product-link";
                outputHeader.appendChild(productLink);
                card.appendChild(outputHeader);

                // Output icon
                const outputIcon = document.createElement("img");
                outputIcon.className = "ingredient-icon";
                outputIcon.src = product.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                const rgba = `rgba(${product.Colour_R * 255}, ${product.Colour_G * 255}, ${product.Colour_B * 255}, ${product.Colour_A})`;
                outputIcon.style.backgroundColor = rgba;
                card.appendChild(outputIcon);

                // Ingredient text
                const ingredientText = document.createElement("div");
                ingredientText.className = "ingredient-text";
                ingredientText.textContent = "Ingredients:";
                card.appendChild(ingredientText)

                // Ingredient list
                const ingredientGrid = document.createElement("div");
                ingredientGrid.className = "ingredient-grid";

                recipe.Ingredients.forEach(ingredient => {
                    const ingredientCard = document.createElement("div");
                    ingredientCard.className = "ingredient";

                    const icon = document.createElement("img");
                    icon.className = "ingredient-icon";
                    icon.src = ingredient.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                    icon.alt = ingredient.NameLower_Text || ingredient.Name;
                    const rgba = `rgba(${ingredient.Colour_R * 255}, ${ingredient.Colour_G * 255}, ${ingredient.Colour_B * 255}, ${ingredient.Colour_A})`;
                    icon.style.backgroundColor = rgba;

                    const info = document.createElement("div");
                    info.className = "ingredient-info";

                    const link = document.createElement("a");
                    link.href = `/item/?id=${ingredient.Id}&type=${ingredient.Type.toLowerCase()}`;
                    link.textContent = ingredient.NameLower_Text;
                    link.className = "ingredient-name";

                    const qty = document.createElement("span");
                    qty.className = "ingredient-qty";
                    qty.textContent = ` (x${ingredient.Amount})`;

                    info.appendChild(link);
                    info.appendChild(qty);

                    ingredientCard.appendChild(icon);
                    ingredientCard.appendChild(info);
                    ingredientGrid.appendChild(ingredientCard);
                });

                card.appendChild(ingredientGrid);

                // Hide cards beyond the first 4 initially
                if (usedInCards.length >= 4) card.style.display = "none";

                usedInCards.push(card);
                grid.appendChild(card);
            }
        });
    });

    if (usedInCards.length === 0) return null;

    section.appendChild(grid);

    if (usedInCards.length > 4) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "recipe-toggle-btn";
        toggleBtn.textContent = "See More";

        let expanded = false;

        toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            usedInCards.forEach((card, index) => {
                card.style.display = (expanded || index < 4) ? "" : "none";
            });
            toggleBtn.textContent = expanded ? "See Less" : "See More";
        });

        section.appendChild(toggleBtn);
    }

    return section;
}

function createRefiningRecipeSection(recipeItem, recipes) {
    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Refining Recipes";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";

    const recipeCards = [];

    recipes.forEach((recipe, index) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        // Output name and amount
        const outputHeader = document.createElement("h4");
        outputHeader.textContent = `${recipeItem.NameLower_Text || recipeItem.Name} (x${recipe.Amount})`;
        card.appendChild(outputHeader);

        // Output icon
        const outputIcon = document.createElement("img");
        outputIcon.className = "ingredient-icon";
        outputIcon.src = recipeItem.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
        const rgba = `rgba(${recipeItem.Colour_R * 255}, ${recipeItem.Colour_G * 255}, ${recipeItem.Colour_B * 255}, ${recipeItem.Colour_A})`;
        outputIcon.style.backgroundColor = rgba;
        card.appendChild(outputIcon);

        // Input label
        const inputLabel = document.createElement("div");
        inputLabel.className = "ingredient-text";
        inputLabel.textContent = "Refiner Inputs:";
        card.appendChild(inputLabel);

        // Ingredient list
        const ingredientGrid = document.createElement("div");
        ingredientGrid.className = "ingredient-grid";

        recipe.Ingredients.forEach(ingredient => {
            const ingredientCard = document.createElement("div");
            ingredientCard.className = "ingredient";

            const icon = document.createElement("img");
            icon.className = "ingredient-icon";
            icon.src = ingredient.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
            icon.alt = ingredient.NameLower_Text || ingredient.Name;
            const rgba = `rgba(${ingredient.Colour_R * 255}, ${ingredient.Colour_G * 255}, ${ingredient.Colour_B * 255}, ${ingredient.Colour_A})`;
            icon.style.backgroundColor = rgba;

            const info = document.createElement("div");
            info.className = "ingredient-info";

            const link = document.createElement("a");
            link.href = `/item/?id=${ingredient.Id}&type=${ingredient.Type.toLowerCase()}`;
            link.textContent = ingredient.NameLower_Text;
            link.className = "ingredient-name";

            const qty = document.createElement("span");
            qty.className = "ingredient-qty";
            qty.textContent = ` (x${ingredient.Amount})`;

            info.appendChild(link);
            info.appendChild(qty);

            ingredientCard.appendChild(icon);
            ingredientCard.appendChild(info);
            ingredientGrid.appendChild(ingredientCard);
        });

        card.appendChild(ingredientGrid);

        // Hide beyond the first 4 cards
        if (index >= 4) card.style.display = "none";

        recipeCards.push(card);
        grid.appendChild(card);
    });

    section.appendChild(grid);

    if (recipes.length > 4) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "recipe-toggle-btn";
        toggleBtn.textContent = "See More";

        let expanded = false;

        toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            recipeCards.forEach((card, index) => {
                card.style.display = (expanded || index < 4) ? "" : "none";
            });
            toggleBtn.textContent = expanded ? "See Less" : "See More";
        });

        section.appendChild(toggleBtn);
    }

    return section;
}

function createRefiningUsedInSection(itemId, refiningData) {
    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Used In (Refining)";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";

    const usedInCards = [];

    Object.values(refiningData).forEach(product => {
        product.Recipes.forEach(recipe => {
            const isUsed = recipe.Ingredients.some(ing => ing.Id === itemId);
            if (isUsed) {
                const card = document.createElement("div");
                card.className = "recipe-card";

                const outputHeader = document.createElement("h4");
                const productLink = document.createElement("a");
                productLink.href = `/item/?id=${product.ProductID}&type=substance`;
                productLink.textContent = product.NameLower_Text;
                productLink.className = "product-link";
                outputHeader.appendChild(productLink);
                card.appendChild(outputHeader);

                // amount after refining
                const refiningAmount = document.createElement("h4");
                refiningAmount.textContent = `(x${recipe.Amount})`;
                refiningAmount.className = "ingredient-qty";
                card.appendChild(refiningAmount)

                const outputIcon = document.createElement("img");
                outputIcon.className = "ingredient-icon";
                outputIcon.src = product.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                const rgba = `rgba(${product.Colour_R * 255}, ${product.Colour_G * 255}, ${product.Colour_B * 255}, ${product.Colour_A})`;
                outputIcon.style.backgroundColor = rgba;
                card.appendChild(outputIcon);

                const ingredientText = document.createElement("div");
                ingredientText.className = "ingredient-text";
                ingredientText.textContent = "Refiner Inputs:";
                card.appendChild(ingredientText)

                const ingredientGrid = document.createElement("div");
                ingredientGrid.className = "ingredient-grid";

                recipe.Ingredients.forEach(ingredient => {
                    const ingredientCard = document.createElement("div");
                    ingredientCard.className = "ingredient";

                    const icon = document.createElement("img");
                    icon.className = "ingredient-icon";
                    icon.src = ingredient.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                    icon.alt = ingredient.NameLower_Text || ingredient.Name;
                    const rgba = `rgba(${ingredient.Colour_R * 255}, ${ingredient.Colour_G * 255}, ${ingredient.Colour_B * 255}, ${ingredient.Colour_A})`;
                    icon.style.backgroundColor = rgba;

                    const info = document.createElement("div");
                    info.className = "ingredient-info";

                    const link = document.createElement("a");
                    link.href = `/item/?id=${ingredient.Id}&type=${ingredient.Type.toLowerCase()}`;
                    link.textContent = ingredient.NameLower_Text;
                    link.className = "ingredient-name";

                    const qty = document.createElement("span");
                    qty.className = "ingredient-qty";
                    qty.textContent = ` (x${ingredient.Amount})`;

                    info.appendChild(link);
                    info.appendChild(qty);

                    ingredientCard.appendChild(icon);
                    ingredientCard.appendChild(info);
                    ingredientGrid.appendChild(ingredientCard);
                });

                card.appendChild(ingredientGrid);

                if (usedInCards.length >= 4) card.style.display = "none";

                usedInCards.push(card);
                grid.appendChild(card);
            }
        });
    });

    if (usedInCards.length === 0) return null;

    section.appendChild(grid);

    if (usedInCards.length > 4) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "recipe-toggle-btn";
        toggleBtn.textContent = "See More";

        let expanded = false;

        toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            usedInCards.forEach((card, index) => {
                card.style.display = (expanded || index < 4) ? "" : "none";
            });
            toggleBtn.textContent = expanded ? "See Less" : "See More";
        });

        section.appendChild(toggleBtn);
    }

    return section;
}

function createCraftingSection(craftingItem) {
    if (!craftingItem || !Array.isArray(craftingItem.Ingredients)) return null;

    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Crafting Recipe";
    section.appendChild(title);

    const recipeGrid = document.createElement("div");
    recipeGrid.className = "recipe-grid";

    const card = document.createElement("div");
    card.className = "recipe-card";

    // Output name and amount
    const outputHeader = document.createElement("h4");
    outputHeader.textContent = `${craftingItem.NameLower_Text || craftingItem.Name} (x1)`;
    card.appendChild(outputHeader);

    // Output icon
    const outputIcon = document.createElement("img");
    outputIcon.className = "ingredient-icon";
    outputIcon.src = craftingItem.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    const rgba = `rgba(${craftingItem.Colour_R * 255}, ${craftingItem.Colour_G * 255}, ${craftingItem.Colour_B * 255}, ${craftingItem.Colour_A})`;
    outputIcon.style.backgroundColor = rgba;
    card.appendChild(outputIcon);

    // Ingredients Required Text
    const ingredientText = document.createElement("div");
    ingredientText.className = "ingredient-text";
    ingredientText.textContent = "Required Parts:";
    card.appendChild(ingredientText);

    // Ingredient list
    const ingredientGrid = document.createElement("div");
    ingredientGrid.className = "ingredient-grid";

    craftingItem.Ingredients.forEach(ing => {
        const ingredientCard = document.createElement("div");
        ingredientCard.className = "ingredient";

        const icon = document.createElement("img");
        icon.className = "ingredient-icon";
        icon.src = ing.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
        icon.alt = ing.NameLower_Text || ing.Name_ID;
        icon.style.backgroundColor = `rgba(${ing.Colour_R * 255}, ${ing.Colour_G * 255}, ${ing.Colour_B * 255}, ${ing.Colour_A})`;

        const info = document.createElement("div");
        info.className = "ingredient-info";

        const link = document.createElement("a");
        link.href = `/item/?id=${ing.Id}&type=${ing.Type.toLowerCase()}`;
        link.textContent = ing.NameLower_Text;
        link.className = "ingredient-name";

        const qty = document.createElement("span");
        qty.className = "ingredient-qty";
        qty.textContent = ` (x${ing.Amount})`;

        info.appendChild(link);
        info.appendChild(qty);

        ingredientCard.appendChild(icon);
        ingredientCard.appendChild(info);
        ingredientGrid.appendChild(ingredientCard);
    });

    card.appendChild(ingredientGrid);
    recipeGrid.appendChild(card);
    section.appendChild(recipeGrid);

    return section;
}

function createUsedInCraftingSection(itemId, craftingData) {
    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Used In (Crafting)";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";

    const usedInCards = [];

    Object.values(craftingData).forEach(product => {
        const ingredients = product.Ingredients || [];
        if (ingredients.some(ing => ing.Id === itemId)) {
            const card = document.createElement("div");
            card.className = "recipe-card";

            // Output product link & icon
            const outputHeader = document.createElement("h4");
            const productLink = document.createElement("a");
            productLink.href = `/item/?id=${product.ProductId}&type=product`;
            productLink.textContent = product.NameLower_Text;
            productLink.className = "product-link";
            outputHeader.appendChild(productLink);
            card.appendChild(outputHeader);

            const outputIcon = document.createElement("img");
            outputIcon.className = "ingredient-icon";
            outputIcon.src = product.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
            outputIcon.style.backgroundColor =
                `rgba(${product.Colour_R * 255}, ${product.Colour_G * 255}, ${product.Colour_B * 255}, ${product.Colour_A})`;
            card.appendChild(outputIcon);

            // Ingredient grid
            const ingredientText = document.createElement("div");
            ingredientText.className = "ingredient-text";
            ingredientText.textContent = "Required Parts:";
            card.appendChild(ingredientText);

            const ingredientGrid = document.createElement("div");
            ingredientGrid.className = "ingredient-grid";

            ingredients.forEach(ing => {
                const ingredientCard = document.createElement("div");
                ingredientCard.className = "ingredient";

                const icon = document.createElement("img");
                icon.className = "ingredient-icon";
                icon.src = ing.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                icon.alt = ing.NameLower_Text || ing.Name_ID;
                icon.style.backgroundColor = `rgba(${ing.Colour_R * 255}, ${ing.Colour_G * 255}, ${ing.Colour_B * 255}, ${ing.Colour_A})`;

                const info = document.createElement("div");
                info.className = "ingredient-info";

                const link = document.createElement("a");
                link.href = `/item/?id=${ing.Id}&type=${ing.Type.toLowerCase()}`;
                link.textContent = ing.NameLower_Text;
                link.className = "ingredient-name";

                const qty = document.createElement("span");
                qty.className = "ingredient-qty";
                qty.textContent = ` (x${ing.Amount})`;

                info.appendChild(link);
                info.appendChild(qty);

                ingredientCard.appendChild(icon);
                ingredientCard.appendChild(info);
                ingredientGrid.appendChild(ingredientCard);
            });

            card.appendChild(ingredientGrid);

            // Hide beyond first 4 for compactness
            if (usedInCards.length >= 4) card.style.display = "none";

            usedInCards.push(card);
            grid.appendChild(card);
        }
    });

    if (usedInCards.length === 0) return null;

    section.appendChild(grid);

    if (usedInCards.length > 4) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "recipe-toggle-btn";
        toggleBtn.textContent = "See More";

        let expanded = false;
        toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            usedInCards.forEach((card, i) => {
                card.style.display = (expanded || i < 4) ? "" : "none";
            });
            toggleBtn.textContent = expanded ? "See Less" : "See More";
        });

        section.appendChild(toggleBtn);
    }

    return section;
}

function createLegacySection(itemId, legacyData) {
    const legacyItem = legacyData[itemId];
    if (!legacyItem) return null;

    const section = document.createElement("div");
    section.className = "legacy-section";

    const legacyIcon = document.createElement("img");
    legacyIcon.className = "legacy-icon";
    legacyIcon.src = "/assets/icons/legacy.png";
    legacyIcon.alt = "Legacy Icon";
    section.appendChild(legacyIcon);

    const textContainer = document.createElement("div");
    textContainer.className = "legacy-text";

    const title = document.createElement("h2");
    title.textContent = "Legacy Item";
    textContainer.appendChild(title);

    const message = document.createElement("p");
    if (legacyItem.GameFile === "Yes") {
        convertItem = legacyItem.ConvertName;
        convertLink = `/item/?id=${legacyItem.ConvertID}&type=product`;
        message.innerHTML = `This item can no longer be obtained in the game. Any leftover inventory is automatically converted into <a href="${convertLink}">${convertItem}</a>.`;
    } else {
        message.innerHTML = 'This item can no longer be obtained through normal gameplay. But, it can still be acquired via save editing or traded between players.';
    }
    textContainer.appendChild(message);

    section.appendChild(textContainer);

    return section;
}

function createBaitSection(itemId, baitData) {
    const baitItem = baitData[itemId];
    if (!baitItem) return null;

    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Bait Info";
    section.appendChild(title);

    const card = document.createElement("div");
    card.className = "recipe-card";

    // Used For
    if (baitItem.UsedFor) {
        const usedFor = document.createElement("p");
        usedFor.innerHTML = `<strong>Used For:</strong> ${baitItem.UsedFor}`;
        card.appendChild(usedFor);
    }

    // Rarity
    if (baitItem.RarityPercent) {
        const rarity = document.createElement("p");
        rarity.innerHTML = `<strong>Rarity:</strong> ${baitItem.RarityPercent}%`;
        card.appendChild(rarity);
    }

    // Size
    if (baitItem.SizePercent) {
        const size = document.createElement("p");
        size.innerHTML = `<strong>Size:</strong> ${baitItem.SizePercent}%`;
        card.appendChild(size);
    }

    // Source link (if Source and Title are valid)
    if (baitItem.Source && baitItem.Title) {
        const source = document.createElement("p");
        source.innerHTML = `<strong>Source:</strong> <a href="/item/?id=${baitItem.Source}&type=product">${baitItem.Source}</a>`;
        card.appendChild(source);
    }

    section.appendChild(card);
    return section;
}

function createFishSection(itemId, fishData) {
    const fishItem = fishData[itemId];
    if (!fishItem) return null;

    const section = document.createElement("div");
    section.className = "recipe-section";

    const title = document.createElement("h2");
    title.textContent = "Fish Data";
    section.appendChild(title);

    const card = document.createElement("div");
    card.className = "recipe-card";

    // Quality
    if (fishItem.Quality) {
        const quality = document.createElement("p");
        quality.innerHTML = `<strong>Quality:</strong> ${fishItem.Quality}`;
        card.appendChild(quality);
    }

    // Size
    if (fishItem.Size) {
        const size = document.createElement("p");
        size.innerHTML = `<strong>Size:</strong> ${fishItem.Size}`;
        card.appendChild(size);
    }

    // Time of day
    if (fishItem.Time) {
        let timeOfDay = fishItem.Time
        if (timeOfDay === "Both") {
            timeOfDay = "Day/Night"
        }
        const time = document.createElement("p");
        time.innerHTML = `<strong>Time:</strong> ${timeOfDay}`;
        card.appendChild(time);
    }

    // Needs storm
    if (fishItem.NeedsStorm) {
        const needsStorm = document.createElement("p");
        needsStorm.innerHTML = `Requires Storm: ${fishItem.NeedsStorm === "true" ? "✅" : "❌"}`;
        card.appendChild(needsStorm);
    }

    // Biomes
    if (fishItem.Biomes) {
        const biomes = document.createElement("p");
        biomes.innerHTML = `Biome: ${fishItem.Biomes.join(", ")}`;
        card.appendChild(biomes);
    }

    section.appendChild(card);

    return section;
}

function loadDataAndDisplay() {
    const { id, type } = getQueryParams();

    // Fallback if url parameters are missing
    if (!id || !type) {
        document.getElementById("item-details").innerHTML = `
            <div class="fallback-message">
                <h2>Oops! No item selected.</h2>
                <p>This page displays detailed information about a specific item, but no item was selected.</p>
                <p>Click one of the buttons below to continue browsing:</p>
                <a href="/items" class="button">Browse All Items</a>
                <a href="/crafting" class="button">Crafting Products</a>
                <a href="/cooking" class="button">Cooking Recipes</a>
                <a href="/refining" class="button">Refining Products</a>
            </div>
        `;
        return;
    }

    // Map type to its corresponding file path
    const typeToFile = {
        product: "/JSON_Files/Product_Table.json",
        substance: "/JSON_Files/Substance_Table.json",
        fossil: "/JSON_Files/Fossil_Table.json",
        fabrication: "/JSON_Files/Ship_Part_Table.json",
        technology: "/JSON_Files/Technology_Table.json",
        construction: "/JSON_Files/Building_Parts_Table.json"
    };

    const dataFile = typeToFile[type];

    if (!dataFile) {
        // Unknown type
        document.getElementById("item-details").innerHTML = `
            <div class="fallback-message">
                <h2>Invalid Item Type</h2>
                <p>The item type specified in the URL is not recognized.</p>
                <p>Click one of the buttons below to continue browsing:</p>
                <a href="/items" class="button">Browse All Items</a>
                <a href="/crafting" class="button">Crafting Products</a>
                <a href="/cooking" class="button">Cooking Recipes</a>
                <a href="/refining" class="button">Refining Products</a>
            </div>
        `;
        return;
    }

    // Always fetch Special_Purchase since it's used conditionally
    Promise.all([
        fetch(dataFile).then(res => res.json()),
        fetch("/JSON_Files/Special_Purchase_Table.json").then(res => res.json())
    ]).then(([data, specialPurchaseData]) => {
        const item = data[id];
        if (!item) {
            document.getElementById("item-details").innerHTML = `
                <div class="fallback-message">
                    <h2>Item Not Found</h2>
                    <p>We couldn't find the item you're looking for. It may have been removed or never existed.</p>
                    <p>Click one of the buttons below to continue browsing:</p>
                    <a href="/items" class="button">Browse All Items</a>
                    <a href="/crafting" class="button">Crafting Products</a>
                    <a href="/cooking" class="button">Cooking Recipes</a>
                    <a href="/refining" class="button">Refining Products</a>
                </div>
            `;
            return;
        }

        const mainContainer = document.getElementById("item-details");
        mainContainer.className = "item-details-page";

        // --- Top: Item Info Section ---
        const infoContainer = document.createElement("div");
        infoContainer.className = "item-info-section";

        const iconTextWrapper = document.createElement("div");
        iconTextWrapper.className = "icon-text-wrapper";

        const copyLinkButton = document.createElement("button"); 
        copyLinkButton.className = "copy-link-button";
        copyLinkButton.textContent = "Copy Link";

        const copyConfirmation = document.createElement("p");
        copyConfirmation.className = "copy-confirmation"; 
        copyConfirmation.textContent = " Link Copied!"            
        copyConfirmation.style.display = "none";

        const icon = document.createElement("img");
        icon.src = item.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `/TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
        icon.alt = item.Name_Text || item.Name;
        icon.className = "product-icon";
        icon.style.backgroundColor = `rgba(${parseFloat(item.Colour_R) * 255}, ${parseFloat(item.Colour_G) * 255}, ${parseFloat(item.Colour_B) * 255}, ${item.Colour_A})`;

        const textBlock = document.createElement("div");
        textBlock.className = "info-text-block";

        const title = document.createElement("h1");
        title.textContent = item.NameLower_Text || item.Name;

        const subtitle = document.createElement("h3");
        subtitle.textContent = item.Subtitle_Text || item.Subtitle;

        const desc = document.createElement("p");
        desc.textContent = sanitizeText(item.Description_Text || item.Description);

        // --- Value Section ---
        const valueWrapper = document.createElement("div");
        valueWrapper.className = "item-value-wrapper";

        let formattedValue = "N/A";
        let numericValue;
        let label = "Value";
        let iconSrc = "/assets/icons/units.png";
        const isSpecial = specialPurchaseData.hasOwnProperty(id);

        // Determine which value to use based on type
        if (type === "technology") {
            numericValue = Number(item.FragmentCost);
            label = "Cost";
            iconSrc = "/assets/icons/nanites.png";
        } else {
            numericValue = Number(item.BaseValue);
            if (type === "construction") {
                label = "Cost";
                iconSrc = "/assets/icons/salvageData.png";
            } else if (isSpecial) {
                label = "Cost";
                iconSrc = "/assets/icons/quicksilver.png";
            }
        }

        if (!isNaN(numericValue)) {
            formattedValue = numericValue.toLocaleString();

            const valueText = document.createElement("span");
            valueText.textContent = `${label}: ${formattedValue} `;

            const unitsIcon = document.createElement("img");
            unitsIcon.src = iconSrc;
            unitsIcon.alt = "Currency";
            unitsIcon.className = "units-icon";

            valueWrapper.appendChild(valueText);
            valueWrapper.appendChild(unitsIcon);
        }

        textBlock.appendChild(title);
        textBlock.appendChild(subtitle);
        textBlock.appendChild(desc);
        if (!isNaN(numericValue)) {   
            textBlock.appendChild(valueWrapper);
        }
        
        // --- Exosuit Nutrient Ingestor Effect Section (if any) ---
        if (item.FoodBonusStatTypeText && 
            item.FoodBonusStatTypeText.trim() !== "" &&
            item.FoodBonusStatType !== "Unspecified"
        ) {
            const bonusWrapper = document.createElement("div");
            bonusWrapper.className = "bonus-stat-box";

            const bonusStat = document.createElement("p");
            bonusStat.innerHTML = `
            <strong>Exosuit Nutrient Ingestor Effect:</strong> Boosts ${item.FoodBonusStatTypeText}
            <span class="tooltip-icon" title="The exact duration and effect % boost will vary per item.">ℹ️</span>
            `;
            
            bonusWrapper.appendChild(bonusStat);
            textBlock.appendChild(bonusWrapper);
        }

        const iconWrapper = document.createElement("div");
        iconWrapper.className = "icon-button-wrapper";
        iconWrapper.appendChild(icon);
        iconWrapper.appendChild(copyLinkButton);
        iconWrapper.appendChild(copyConfirmation);

        iconTextWrapper.appendChild(iconWrapper);
        iconTextWrapper.appendChild(textBlock);

        infoContainer.appendChild(iconTextWrapper);
        mainContainer.appendChild(infoContainer);

        copyLinkButton.addEventListener("click", () => {
        const url = `${window.location.origin}${window.location.pathname}?id=${id}&type=${type}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                copyConfirmation.style.display = "block";
                setTimeout(() => {
                    copyConfirmation.style.display = "none";
                }, 2000);
            })
            .catch(err => console.error("Failed to copy:", err));
        });

        // --- Bottom: Dynamic Sections ---
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "item-sections-container";

        // Loads all JSON files before appending sections in fixed order
        Promise.all([
            fetch("/JSON_Files/Legacy_Item_Table.json").then(res => res.json()),
            fetch("/JSON_Files/Refining_Table.json").then(res => res.json()),
            fetch("/JSON_Files/Crafting_Table.json").then(res => res.json()),
            fetch("/JSON_Files/Cooking_Table.json").then(res => res.json()),
            fetch("/JSON_Files/Bait_Table.json").then(res => res.json()),
            fetch("/JSON_Files/Fish_Table.json").then(res => res.json())
        ]).then(([legacyData, refiningData, craftingData, cookingData, baitData, fishData]) => {

            // === Legacy Item Section ===
            if (legacyData[id]) {
                const legacySection = createLegacySection(id, legacyData);
                if (legacySection) {
                    sectionContainer.appendChild(legacySection);
                }
            }
            
            // === Refining Section ===
            const refiningItem = refiningData[id];
            if (
                type === "substance" &&
                refiningItem &&
                Array.isArray(refiningItem.Recipes) &&
                refiningItem.Recipes.length > 0
            ) {
                const refiningSection = createRefiningRecipeSection(refiningItem, refiningItem.Recipes);
                sectionContainer.appendChild(refiningSection);
            }

            const usedInRefining = createRefiningUsedInSection(id, refiningData);
            if (usedInRefining) {
                sectionContainer.appendChild(usedInRefining);
            }

            // === Crafting Section ===
            const craftingItem = craftingData[id];
            if (
                type === "product" &&
                craftingItem &&
                Array.isArray(craftingItem.Ingredients) &&
                craftingItem.Ingredients.length > 0
            ) {
                const craftingSection = createCraftingSection(craftingItem);
                if (craftingSection) {
                    sectionContainer.appendChild(craftingSection);
                }
            }

            const usedInCraftingSection = createUsedInCraftingSection(id, craftingData);
            if (usedInCraftingSection) {
                sectionContainer.appendChild(usedInCraftingSection);
            }

            // === Cooking Section ===
            const cookingItem = cookingData[id];
            if (
                type === "product" &&
                cookingItem &&
                Array.isArray(cookingItem.Recipes) &&
                cookingItem.Recipes.length > 0
            ) {
                const recipeSection = createCookingRecipeSection(cookingItem, cookingItem.Recipes);
                sectionContainer.appendChild(recipeSection);
            }

            const usedInCooking = createCookingUsedInSection(id, cookingData);
            if (usedInCooking) {
                sectionContainer.appendChild(usedInCooking);
            }

            // === Bait Section ===
            if (baitData[id]) {
                const baitSection = createBaitSection(id, baitData);
                if (baitSection) {
                    sectionContainer.appendChild(baitSection);
                }
            }

            // === Fish Section ===
            if (fishData[id]) {
                const fishSection = createFishSection(id, fishData);
                if (fishSection) {
                    sectionContainer.appendChild(fishSection);
                }
            }

            mainContainer.appendChild(sectionContainer);
        });
    });
}

loadDataAndDisplay();
