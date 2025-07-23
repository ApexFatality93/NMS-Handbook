
const loreGrid = document.getElementById("lore-grid");

let loreData = {};

function sanitizeText(text) {
    return text.replace(/<[^>]*>/g, "").trim();
}

function createLoreCard(storyId, story) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", storyId);

    card.addEventListener("click", () => {
        window.location.href = `lore.html?id=${encodeURIComponent(storyId)}`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = story.IconOn.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = story.CategoryText || storyId;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = story.CategoryText;
    content.appendChild(title);

    card.appendChild(imageWrapper);
    card.appendChild(content);
    loreGrid.appendChild(card);
}

function displayAllLoreCards() {
    const sortedStories = Object.entries(loreData).sort((a, b) => {
        const nameA = (a[1].CategoryText || "").toLowerCase();
        const nameB = (b[1].CategoryText || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedStories.forEach(([storyId, story]) => {
        createLoreCard(storyId, story);
    });
}

function displayStoryDetail(storyId, story) {
    const container = document.createElement("div");
    container.className = "story-detail";

    const title = document.createElement("h2");
    title.textContent = story.CategoryText;
    container.appendChild(title);

    const icon = document.createElement("img");
    icon.src = story.IconOn.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = story.CategoryText;
    icon.className = "detail-icon";
    container.appendChild(icon);

    // Loop through pages
    story.Pages.forEach((page, index) => {
        if (!page.Entries || page.Entries.length === 0) return; // Skip if no entries

        const pageWrapper = document.createElement("div");
        pageWrapper.className = "lore-page-wrapper";

        const pageHeader = document.createElement("div");
        pageHeader.className = "lore-page-header";

        const title = document.createElement("span");
        title.className = "page-title";
        title.textContent = page.PageText || `Page ${index + 1}`;

        const toggleWrapper = document.createElement("span");
        toggleWrapper.className = "toggle-wrapper";

        const icon = document.createElement("span");
        icon.className = "toggle-icon";
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16">
            <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        const label = document.createElement("span");
        label.className = "toggle-label";
        label.textContent = "(Expand)";

        toggleWrapper.appendChild(icon);
        toggleWrapper.appendChild(label);

        pageHeader.appendChild(title);
        pageHeader.appendChild(toggleWrapper);
        pageWrapper.appendChild(pageHeader);

        const entriesContainer = document.createElement("div");
        entriesContainer.className = "lore-page-entries collapsed";

        page.Entries.forEach(entry => {
            const entryDiv = document.createElement("div");
            entryDiv.className = "lore-entry";
            entryDiv.textContent = sanitizeText(entry.EntryText) || "";
            entriesContainer.appendChild(entryDiv);
        });

        // Toggle expand/collapse behavior
        pageHeader.addEventListener("click", () => {
            const isCollapsed = entriesContainer.classList.toggle("collapsed");
            icon.innerHTML = isCollapsed
                ? `<svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
                : `<svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
            label.textContent = isCollapsed ? "(Expand)" : "(Collapse)";
        });

        pageWrapper.appendChild(entriesContainer);
        container.appendChild(pageWrapper);
    });

    loreGrid.innerHTML = "";  // Clear grid
    loreGrid.appendChild(container);


}

fetch("./JSON_Files/Story_Table.json")
    .then(res => res.json())
    .then(data => {
        loreData = data;

        const urlParams = new URLSearchParams(window.location.search);
        const selectedId = urlParams.get("id");

        if (selectedId && loreData[selectedId]) {
            loreGrid.innerHTML = "";
            displayStoryDetail(selectedId, loreData[selectedId]);
        } else {
            displayAllLoreCards();
        }
    })
    .catch(err => console.error("Error loading Story_Table.json:", err));

