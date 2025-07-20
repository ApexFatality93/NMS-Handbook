
let productData = {};
let substanceData = {};

const gridContainer = document.getElementById("product-grid");
const datasetSelect = document.getElementById("dataset-select");
const typeSelect = document.getElementById("product-type-select");
const productTypeFilter = document.getElementById("product-type-filter");
const categorySelect = document.getElementById("substance-category-select");
const substanceCategoryFilter = document.getElementById("substance-category-filter");

function sanitizeText(text) {
    return text.replace(/<[^>]*>/g, "").trim();
}

function createCard(item, isProduct = true, key) {
    const card = document.createElement("div");
    card.className = "product-card";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.style.backgroundColor = `rgba(${parseFloat(item.Colour_R) * 255}, ${parseFloat(item.Colour_G) * 255}, ${parseFloat(item.Colour_B) * 255}, ${item.Colour_A})`;
    icon.src = item.Icon_Filename.replace("TEXTURES", "TEXTURES").replace("DDS", "png").toUpperCase();
    icon.alt = item.Name_Text || item.Name;
    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h4");
    title.textContent = item.NameLower_Text || item.Name;

    // const subtitle = document.createElement("h4");
    // subtitle.textContent = item.Subtitle_Text || item.Subtitle;

    // const desc = document.createElement("p");
    // desc.textContent = sanitizeText(item.Description_Text || item.Description);

    content.appendChild(title);
    // content.appendChild(subtitle);
    // content.appendChild(desc);

    card.appendChild(imageWrapper);
    card.appendChild(content);

    gridContainer.appendChild(card);

    card.addEventListener("click", () => {
        const id = item.ID || Object.keys(item)[0]; // fallback if needed
        const type = isProduct ? "product" : "substance";
        window.location.href = `item.html?id=${encodeURIComponent(key)}&type=${type}`;
    });
}

function displayData(data, filterType = "All") {
    gridContainer.innerHTML = "";

    for (const key in data) {
        const item = data[key];

        if (datasetSelect.value === "substances") {
            if (["Reward Item", "Technological Currency"].includes(item.Subtitle_Text)) {
                continue;
            }

            const selectedCategory = categorySelect.value;
            if (selectedCategory !== "All" && selectedCategory !== "" && item.Category !== selectedCategory) {
                continue;
            }

            createCard(item, false, key);
        } else {
            if (filterType === "All" || filterType === "" || item.Type === filterType) {
                createCard(item, true, key);
            }
        }
    }
}

function fetchAndDisplay(dataset) {
    const file = dataset === "products" ? "./JSON_Files/Product_Table.json" : "./JSON_Files/Substance_Table.json";

    fetch(file)
        .then(response => response.json())
        .then(data => {
            if (dataset === "products") {
                productData = data;
                productTypeFilter.style.display = "block";
                substanceCategoryFilter.style.display = "none";
                displayData(productData, typeSelect.value || "All");
            } else {
                substanceData = data;
                productTypeFilter.style.display = "none";
                substanceCategoryFilter.style.display = "block";
                displayData(substanceData, categorySelect.value || "All");
            }
        });
}

datasetSelect.addEventListener("change", () => {
    const dataset = datasetSelect.value;
    fetchAndDisplay(dataset);
});

typeSelect.addEventListener("change", () => {
    const selectedType = typeSelect.value;
    if (selectedType === "none") {
        gridContainer.innerHTML = "";
    } else {
        displayData(productData, selectedType);
    }
});

categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    if (selectedCategory === "none") {
        gridContainer.innerHTML = "";
    } else {
        displayData(substanceData, selectedCategory);
    }
});

// Initial load
fetchAndDisplay("products");







function showDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {
    var myDropdown = document.getElementById("myDropdown");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
    }
  }
