
const Breakdown = (() => {
    const MAX_DEPTH = 25;

    function getRecipe(id, craftingData) {
        const recipe = craftingData[id];
        return recipe && Array.isArray(recipe.Ingredients) && recipe.Ingredients.length > 0
            ? recipe.Ingredients
            : null;
    }

    function hasCraftableIngredient(ingredients, craftingData) {
        return Array.isArray(ingredients) && ingredients.some(ing => getRecipe(ing.Id, craftingData));
    }

    function compute(ingredients, quantity, craftingData) {
        const info = {};
        const order = [];
        const state = {};
        const treatAsRaw = {};

        function visit(id, depth) {
            if (state[id] === "done") return;
            if (state[id] === "visiting" || depth > MAX_DEPTH) {
                treatAsRaw[id] = true;
                return;
            }
            state[id] = "visiting";
            for (const ing of getRecipe(id, craftingData)) {
                if (!info[ing.Id]) info[ing.Id] = ing;
                if (getRecipe(ing.Id, craftingData)) visit(ing.Id, depth + 1);
            }
            state[id] = "done";
            order.push(id);
        }

        for (const ing of ingredients) {
            if (!info[ing.Id]) info[ing.Id] = ing;
            if (getRecipe(ing.Id, craftingData)) visit(ing.Id, 1);
        }

        const isCraftable = id => !treatAsRaw[id] && state[id] === "done";

        // Work out how many of each item are needed, starting from the top
        const needed = {};
        const add = (id, amount) => { needed[id] = (needed[id] || 0) + amount; };

        for (const ing of ingredients) add(ing.Id, (Number(ing.Amount) || 1) * quantity);

        for (let i = order.length - 1; i >= 0; i--) {
            const id = order[i];
            if (!isCraftable(id) || !needed[id]) continue;
            for (const ing of getRecipe(id, craftingData)) {
                add(ing.Id, (Number(ing.Amount) || 1) * needed[id]);
            }
        }

        const raw = Object.keys(needed)
            .filter(id => !isCraftable(id))
            .map(id => ({ info: info[id], amount: needed[id] }))
            .sort((a, b) => b.amount - a.amount);

        const steps = order
            .filter(id => isCraftable(id) && needed[id])
            .map(id => ({
                info: info[id],
                crafts: needed[id],
                uses: getRecipe(id, craftingData).map(ing => ({
                    info: info[ing.Id],
                    amount: (Number(ing.Amount) || 1) * needed[id]
                }))
            }));

        return { raw, steps };
    }

    return { compute, hasCraftableIngredient };
})();

// --- Item page section ---

function breakdownIconSrc(file) {
    return (file || "")
        .replace(/\.DDS$/i, ".png")
        .replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, path) => `/TEXTURES/UI/FRONTEND/ICONS/${path.toLowerCase()}`);
}

function breakdownIcon(info, className) {
    const icon = document.createElement("img");
    icon.className = className;
    icon.src = breakdownIconSrc(info.Icon_Filename);
    icon.alt = info.NameLower_Text || info.Id;
    icon.loading = "lazy";
    icon.style.backgroundColor = `rgba(${info.Colour_R * 255}, ${info.Colour_G * 255}, ${info.Colour_B * 255}, ${info.Colour_A})`;
    return icon;
}

function breakdownItemUrl(info) {
    return `/item/?id=${encodeURIComponent(info.Id)}&type=${String(info.Type).toLowerCase()}`;
}

// Create card
function createRawMaterialCard({ info, amount }) {
    const listItem = document.createElement("li");
    listItem.className = "charge-item";
    listItem.addEventListener("click", () => {
        window.location.href = breakdownItemUrl(info);
    });

    const textWrapper = document.createElement("div");
    textWrapper.className = "requirement-text-wrapper";

    const name = document.createElement("span");
    name.className = "requirement-name";
    name.textContent = info.NameLower_Text || info.Id;

    const qty = document.createElement("span");
    qty.className = "requirement-amount";
    qty.textContent = `(x${amount.toLocaleString("en-US")})`;

    textWrapper.appendChild(name);
    textWrapper.appendChild(qty);
    listItem.appendChild(breakdownIcon(info, "charge-icon"));
    listItem.appendChild(textWrapper);
    return listItem;
}

function createBreakdownStep(step, index) {
    const row = document.createElement("li");
    row.className = "breakdown-step";

    const number = document.createElement("span");
    number.className = "breakdown-step-number";
    number.textContent = index + 1;

    const body = document.createElement("div");
    body.className = "breakdown-step-body";

    const heading = document.createElement("div");
    heading.className = "breakdown-step-heading";
    heading.appendChild(breakdownIcon(step.info, "ingredient-icon"));

    const craftText = document.createElement("span");
    craftText.append("Craft ");
    const link = document.createElement("a");
    link.className = "ingredient-name";
    link.href = breakdownItemUrl(step.info);
    link.textContent = step.info.NameLower_Text || step.info.Id;
    craftText.append(link, ` (x${step.crafts.toLocaleString("en-US")})`);
    heading.appendChild(craftText);

    const uses = document.createElement("div");
    uses.className = "breakdown-step-uses";
    uses.textContent = "Uses: " + step.uses
        .map(u => `${u.info.NameLower_Text || u.info.Id} x${u.amount.toLocaleString("en-US")}`)
        .join(", ");

    body.appendChild(heading);
    body.appendChild(uses);
    row.appendChild(number);
    row.appendChild(body);
    return row;
}

function createRawMaterialsSection(ingredients, craftingData, calcItem) {
    if (!Breakdown.hasCraftableIngredient(ingredients, craftingData)) return null;

    const section = document.createElement("div");
    section.className = "recipe-section breakdown-section";

    const title = document.createElement("h2");
    title.textContent = "Raw Materials";
    section.appendChild(title);

    const controls = document.createElement("div");
    controls.className = "breakdown-controls";

    const label = document.createElement("label");
    label.className = "breakdown-qty-label";
    label.textContent = "Quantity to make:";
    label.htmlFor = "breakdown-qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "breakdown-qty-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease quantity");

    const input = document.createElement("input");
    input.type = "number";
    input.id = "breakdown-qty";
    input.className = "breakdown-qty-input";
    input.min = "1";
    input.max = "9999";
    input.step = "1";
    input.value = "1";
    input.inputMode = "numeric";

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "breakdown-qty-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase quantity");

    controls.append(label, minus, input, plus);
    section.appendChild(controls);

    const note = document.createElement("p");
    note.className = "breakdown-note";
    note.textContent = "Everything you need to gather, with all crafted components broken down.";
    section.appendChild(note);

    const rawList = document.createElement("ul");
    rawList.className = "charge-list";
    section.appendChild(rawList);

    // Crafting steps (hidden until toggled)
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "recipe-toggle-btn breakdown-toggle";
    toggle.setAttribute("aria-expanded", "false");

    const stepsList = document.createElement("ol");
    stepsList.className = "breakdown-steps";
    stepsList.hidden = true;

    const toggleWrapper = document.createElement("div");
    toggleWrapper.className = "breakdown-toggle-wrapper";
    toggleWrapper.appendChild(toggle);

    let calcLink = null;
    if (calcItem) {
        calcLink = document.createElement("a");
        calcLink.className = "recipe-toggle-btn breakdown-calc-link";
        calcLink.textContent = "Add to Calculator";
        toggleWrapper.appendChild(calcLink);
    }
    section.appendChild(toggleWrapper);
    section.appendChild(stepsList);

    let stepCount = 0;
    const updateToggleText = () => {
        toggle.textContent = `${stepsList.hidden ? "Show" : "Hide"} crafting steps (${stepCount})`;
    };

    toggle.addEventListener("click", () => {
        stepsList.hidden = !stepsList.hidden;
        toggle.setAttribute("aria-expanded", String(!stepsList.hidden));
        updateToggleText();
    });

    function render() {
        const quantity = Math.min(Math.max(parseInt(input.value, 10) || 1, 1), 9999);
        const { raw, steps } = Breakdown.compute(ingredients, quantity, craftingData);

        rawList.replaceChildren(...raw.map(createRawMaterialCard));
        stepsList.replaceChildren(...steps.map(createBreakdownStep));
        stepCount = steps.length;
        updateToggleText();

        if (calcLink) {
            calcLink.href = `/calculator/?add=${encodeURIComponent(`${calcItem.type}:${calcItem.id}:${quantity}`)}`;
        }
    }

    function setQuantity(value) {
        input.value = Math.min(Math.max(value, 1), 9999);
        render();
    }

    input.addEventListener("input", render);
    input.addEventListener("change", () => setQuantity(parseInt(input.value, 10) || 1));
    minus.addEventListener("click", () => setQuantity((parseInt(input.value, 10) || 1) - 1));
    plus.addEventListener("click", () => setQuantity((parseInt(input.value, 10) || 1) + 1));

    render();
    return section;
}
