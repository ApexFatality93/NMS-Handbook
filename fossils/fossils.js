
const fossilGrid = document.getElementById("fossil-grid");
const fossilSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

let fossilData = {};

function createFossilCard(item) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", item.FossilID);

    card.addEventListener("click", () => {
        window.location.href = `/item/?id=${item.FossilID}&type=fossil`;
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
    fossilGrid.appendChild(card);
}

// function applyFossilFilter() {
//     const searchTerm = fossilSearch.value.toLowerCase().trim();
//     const selectedCategory = categoryFilter.value;
//     fossilGrid.innerHTML = "";

//     const sortedItems = Object.values(fossilData).sort((a, b) => {
//         const nameA = (a.Name_Text || a.Name || "").toLowerCase();
//         const nameB = (b.Name_Text || b.Name || "").toLowerCase();
//         return nameA.localeCompare(nameB);
//     });

//     sortedItems.forEach(item => {
//         const name = (item.Name_Text || item.Name || "").toLowerCase();
//         const itemCategory = item.WikiCategory || "Construction";
//         const matchesCategory = itemCategory === selectedCategory;
//         if ((!searchTerm || name.includes(searchTerm)) && matchesCategory) {
//             createFossilCard(item);
//         }
//     });
// }

function applyFossilFilter() {
    const searchTerm = fossilSearch.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    fossilGrid.innerHTML = "";

    const sortedItems = Object.values(fossilData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedItems.forEach(item => {
        const name = (item.Name_Text || item.Name || "").toLowerCase();
        const itemCategory = item.FossilCategory || "Construction";
        const matchesCategory = selectedCategory === "All" || itemCategory === selectedCategory;
        if ((!searchTerm || name.includes(searchTerm)) && matchesCategory) {
            createFossilCard(item);
        }
    });
}


function populateCategoryFilter() {
    const categories = new Set();
    Object.values(fossilData).forEach(item => {
        if (item.FossilCategory) categories.add(item.FossilCategory);
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

fetch("/JSON_Files/Fossil_Table.json")
    .then(res => res.json())
    .then(data => {
        fossilData = data;
        populateCategoryFilter();
        applyFossilFilter();
    });

fossilSearch.addEventListener("input", applyFossilFilter);
categoryFilter.addEventListener("change", applyFossilFilter);
