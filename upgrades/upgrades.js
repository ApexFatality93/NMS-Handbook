
const upgradeGrid = document.getElementById("upgrade-grid");
const upgradeDetails = document.getElementById("upgrade-details");
const upgradeSearch = document.getElementById("search-bar");
const categoryFilter = document.getElementById("categoryFilter");

const CATEGORY_ORDER = ["Multi-Tool", "Exosuit", "Starship", "Living Ship", "Corvette", "Freighter", "Exocraft", "Minotaur", "Nautilon"];

let upgradeData = {};

function upgradeIconSrc(file) {
    return (file || "")
        .replace(/\.DDS$/i, ".png")
        .replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, path) => `/TEXTURES/UI/FRONTEND/ICONS/${path.toLowerCase()}`);
}

function upgradeIcon(upgrade, className) {
    const icon = document.createElement("img");
    icon.className = className;
    icon.src = upgradeIconSrc(upgrade.Icon_Filename);
    icon.alt = upgrade.Name_Text;
    icon.style.backgroundColor = `rgba(${upgrade.Colour_R * 255}, ${upgrade.Colour_G * 255}, ${upgrade.Colour_B * 255}, ${upgrade.Colour_A})`;
    return icon;
}

function formatRange(stat) {
    const fmt = n => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
    const range = stat.Low === stat.High ? fmt(stat.Low) : `${fmt(stat.Low)}-${fmt(stat.High)}`;
    return range + stat.Unit;
}

function classLabel(cls) {
    if (cls.Class) return `${cls.Class}-Class`;
    return cls.Subtitle_Text || cls.Quality;
}

function createClassCard(cls) {
    const card = document.createElement("div");
    card.className = "recipe-card upgrade-class-card";

    if (cls.Class) {
        const patch = document.createElement("img");
        patch.className = "upgrade-class-patch";
        patch.src = cls.Class === "X"
            ? "/TEXTURES/UI/FRONTEND/ICONS/class/classmini.png"
            : `/TEXTURES/UI/FRONTEND/ICONS/expedition/patch.upgradeclass${cls.Class.toLowerCase()}.png`;
        patch.alt = classLabel(cls);
        patch.title = classLabel(cls);
        card.appendChild(patch);
    } else {
        const badge = document.createElement("div");
        badge.className = "upgrade-class-badge";
        badge.textContent = classLabel(cls);
        card.appendChild(badge);
    }

    const repeatsClass = cls.Subtitle_Text.startsWith(classLabel(cls)) ||
        (cls.Class === "X" && cls.Subtitle_Text.startsWith("Illegal"));
    if (cls.Subtitle_Text && cls.Class && !repeatsClass) {
        const subtitle = document.createElement("p");
        subtitle.className = "upgrade-class-subtitle";
        subtitle.textContent = cls.Subtitle_Text;
        card.appendChild(subtitle);
    }

    const alwaysStats = cls.Stats.filter(stat => stat.AlwaysChoose);
    const otherStats = cls.Stats.filter(stat => !stat.AlwaysChoose);
    const extraMin = Math.max(0, cls.NumStatsMin - alwaysStats.length);
    const extraMax = cls.NumStatsMax - alwaysStats.length;

    if (alwaysStats.length) {
        card.append(createRollsHeading("Always rolls:"), createStatList(alwaysStats));
        if (extraMax > 0 && otherStats.length) {
            const count = extraMin === 0 ? `up to ${extraMax}` : rollCount(extraMin, extraMax);
            card.append(createRollsHeading(`Plus ${count} more from:`), createStatList(otherStats));
        }
    } else {
        const count = rollCount(cls.NumStatsMin, cls.NumStatsMax);
        card.append(createRollsHeading(`Rolls ${count} stat${count === 1 ? "" : "s"} from:`), createStatList(otherStats));
    }

    return card;
}

function rollCount(min, max) {
    return min === max ? min : `${min}-${max}`;
}

function createRollsHeading(text) {
    const heading = document.createElement("p");
    heading.className = "upgrade-class-rolls";
    heading.textContent = text;
    return heading;
}

function createStatList(stats) {
    const list = document.createElement("ul");
    list.className = "upgrade-stat-list";
    stats.forEach(stat => {
        const row = document.createElement("li");
        row.className = "upgrade-stat";

        const name = document.createElement("span");
        name.textContent = stat.Name_Text;

        const value = document.createElement("span");
        value.className = "upgrade-stat-value";
        value.textContent = formatRange(stat);

        row.append(name, value);
        list.appendChild(row);
    });
    return list;
}

function showDetails(key, scroll = true) {
    const upgrade = upgradeData[key];
    if (!upgrade) {
        upgradeDetails.hidden = true;
        return;
    }

    const title = document.createElement("h2");
    title.textContent = `${upgrade.Name_Text} Upgrade Modules`;

    const header = document.createElement("div");
    header.className = "upgrade-details-header";
    const meta = document.createElement("p");
    meta.className = "upgrade-details-meta";
    meta.textContent = `${upgrade.Category} upgrade: Ranges show how much each stat can improve`;
    header.append(upgradeIcon(upgrade, "upgrade-details-icon"), meta);

    const grid = document.createElement("div");
    grid.className = "recipe-grid";
    upgrade.Classes.forEach(cls => grid.appendChild(createClassCard(cls)));

    upgradeDetails.replaceChildren(title, header, grid);
    upgradeDetails.hidden = false;

    document.querySelectorAll(".upgrade-card.selected").forEach(card => card.classList.remove("selected"));
    const selectedCard = upgradeGrid.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (selectedCard) selectedCard.classList.add("selected");

    if (scroll) upgradeDetails.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectUpgrade(key) {
    const url = new URL(window.location);
    url.searchParams.set("id", key);
    history.replaceState(null, "", url);
    showDetails(key);
}

function createUpgradeCard(key, upgrade) {
    const card = document.createElement("div");
    card.className = "product-card upgrade-card";
    card.dataset.key = key;
    card.tabIndex = 0;

    card.addEventListener("click", () => selectUpgrade(key));
    card.addEventListener("keydown", e => {
        if (e.key === "Enter") selectUpgrade(key);
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";
    imageWrapper.appendChild(upgradeIcon(upgrade, "product-icon"));

    const content = document.createElement("div");
    content.className = "product-info";
    const title = document.createElement("h3");
    title.textContent = upgrade.Name_Text;
    const category = document.createElement("p");
    category.className = "upgrade-card-category";
    category.textContent = upgrade.Category;
    content.append(title, category);

    card.append(imageWrapper, content);
    return card;
}

function applyFilters() {
    const search = upgradeSearch.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const selectedKey = new URLSearchParams(window.location.search).get("id");

    const entries = Object.entries(upgradeData)
        .filter(([, u]) => category === "All" || u.Category === category)
        .filter(([, u]) => !search || u.Name_Text.toLowerCase().includes(search))
        .sort(([, a], [, b]) =>
            CATEGORY_ORDER.indexOf(a.Category) - CATEGORY_ORDER.indexOf(b.Category) ||
            a.Name_Text.localeCompare(b.Name_Text));

    upgradeGrid.replaceChildren(...entries.map(([key, upgrade]) => {
        const card = createUpgradeCard(key, upgrade);
        if (key === selectedKey) card.classList.add("selected");
        return card;
    }));
}

function populateCategories() {
    const categories = [...new Set(Object.values(upgradeData).map(u => u.Category))]
        .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
    categoryFilter.replaceChildren(...["All", ...categories].map(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        return option;
    }));
}

fetch("/JSON_Files/Upgrade_Module_Table.json")
    .then(res => res.json())
    .then(data => {
        upgradeData = data;
        populateCategories();
        applyFilters();

        const key = new URLSearchParams(window.location.search).get("id");
        if (key) showDetails(key, false);

        upgradeSearch.addEventListener("input", applyFilters);
        categoryFilter.addEventListener("change", applyFilters);
    })
    .catch(err => {
        console.error("Failed to load upgrade module data:", err);
        upgradeGrid.textContent = "Couldn't load upgrade data. Please refresh the page.";
    });
