
const fishGrid = document.getElementById("fish-grid");
const biomeSelect = document.getElementById("biome-filter");
const sizeSelect = document.getElementById("size-filter");
const timeSelect = document.getElementById("time-filter");
const searchBar = document.getElementById("search-bar");

let fishData = {};

function getTimeIcon(time) {
    const icon = document.createElement("img");
    icon.className = "time-icon";
    switch (time.toLowerCase()) {
        case "day":
            icon.src = "./assets/icons/day.svg";
            icon.alt = "Day";
            break;
        case "night":
            icon.src = "./assets/icons/night.svg";
            icon.alt = "Night";
            break;
        case "both":
            icon.src = "./assets/icons/day-and-night.svg";
            icon.alt = "Day & Night";
            break;
        default:
            icon.alt = time;
            return document.createTextNode(time);
    }
    return icon;
}

function createFishCard(fish) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", fish.ProductID);

    // Make card clickable
    card.addEventListener("click", () => {
        window.location.href = `item.html?id=${fish.ProductID}&type=product`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = fish.Icon_Filename.replace("DDS", "png").replace("TEXTURES", "TEXTURES").toUpperCase();
    icon.alt = fish.Name_Text || fish.Name;
    const rgba = `rgba(${fish.Colour_R * 255}, ${fish.Colour_G * 255}, ${fish.Colour_B * 255}, ${fish.Colour_A})`;
    icon.style.backgroundColor = rgba;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = fish.NameLower_Text || fish.Name;
    content.appendChild(title);

    const biome = document.createElement("p");
    biome.textContent = `Biome: ${fish.Biomes.join(", ")}`;
    content.appendChild(biome);

    const time = document.createElement("p");
    time.textContent = "Time: ";
    time.appendChild(getTimeIcon(fish.Time));
    content.appendChild(time);

    const storm = document.createElement("p");
    storm.textContent = `Requires Storm: ${fish.NeedsStorm === "true" ? "✅" : "❌"}`;
    content.appendChild(storm);

    card.appendChild(imageWrapper);
    card.appendChild(content);

    fishGrid.appendChild(card);
}

function clearGrid() {
    fishGrid.innerHTML = "";
}

function applyFilters() {
    const selectedBiome = biomeSelect.value.toLowerCase();
    const selectedSize = sizeSelect.value.toLowerCase();
    const selectedTime = timeSelect.value.toLowerCase();
    const searchTerm = searchBar.value.toLowerCase().trim();

    fishGrid.innerHTML = "";

    const sortedFish = Object.values(fishData).sort((a, b) => {
        const nameA = (a.Name_Text || a.Name || "").toLowerCase();
        const nameB = (b.Name_Text || b.Name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedFish.forEach(fish => {
        const name = (fish.Name_Text || fish.Name || "").toLowerCase();
        const biomeMatch = selectedBiome === "all" || fish.Biomes.map(b => b.toLowerCase()).includes(selectedBiome);
        const sizeMatch = selectedSize === "all" || (fish.Size || "").toLowerCase() === selectedSize;
        const timeMatch = selectedTime === "all" || (fish.Time || "").toLowerCase() === selectedTime;
        const nameMatch = !searchTerm || name.includes(searchTerm);

        if (biomeMatch && sizeMatch && timeMatch && nameMatch) {
            createFishCard(fish);
        }
    });
}

function populateDropdown(select, values) {
    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "All";
    defaultOption.textContent = "All";
    select.appendChild(defaultOption);

    values
        .filter(value => value !== "All") // Remove "All" if already in list
        .forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
}

// Load fish data and initialize UI
fetch("./JSON_Files/Fish_Table.json")
    .then(response => response.json())
    .then(data => {

        const uniqueFishMap = new Map();

        Object.values(data).forEach(fish => {
            const nameKey = fish.Name_Text || fish.Name;
            if (!uniqueFishMap.has(nameKey)) {
                uniqueFishMap.set(nameKey, fish);
            }
        });

        fishData = Object.fromEntries(
            Array.from(uniqueFishMap.entries()).map(([_, fish]) => [fish.ProductID, fish])
        );

        // Collect filter values
        const biomes = new Set();
        const sizes = new Set();
        const times = new Set();

        Object.values(fishData).forEach(fish => {
            fish.Biomes.forEach(b => biomes.add(b));
            sizes.add(fish.Size);
            times.add(fish.Time);
        });

        populateDropdown(biomeSelect, Array.from(biomes).sort());
        populateDropdown(sizeSelect, Array.from(sizes).sort());
        populateDropdown(timeSelect, Array.from(times).sort());

        applyFilters();

    });

biomeSelect.addEventListener("change", applyFilters);
sizeSelect.addEventListener("change", applyFilters);
timeSelect.addEventListener("change", applyFilters);
searchBar.addEventListener("input", applyFilters);
