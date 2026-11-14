let allItems = [];
const MAX_RESULTS = 8;

const TYPE_LABELS = {
    product: 'Product',
    substance: 'Substance',
    fossil: 'Fossil',
    fabrication: 'Ship Part',
    technology: 'Technology',
    construction: 'Base Part'
};

function searchIconSrc(file) {
    return (file || '')
        .replace(/\.DDS$/i, '.png')
        .replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, path) => `/TEXTURES/UI/FRONTEND/ICONS/${path.toLowerCase()}`);
}

// Load data from all the JSON files
Promise.all([
    fetch('/JSON_Files/Product_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Substance_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Fish_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Fossil_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Ship_Part_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Technology_Table.json').then(res => res.json()),
    fetch('/JSON_Files/Building_Parts_Table.json').then(res => res.json())
])
.then(([products, substances, fish, fossils, shipParts, technology, construction]) => {
    const seen = new Set();

    const addAll = (table, type) => {
        for (const [id, item] of Object.entries(table)) {
            // Every fish is also a product, so skip anything already added
            const key = `${type}:${id}`;
            if (seen.has(key)) continue;
            seen.add(key);

            allItems.push({
                id,
                type,
                name: item.NameLower_Text,
                subtitle: item.Subtitle_Text || '',
                icon: item.Icon_Filename,
                rgba: [item.Colour_R, item.Colour_G, item.Colour_B, item.Colour_A]
            });
        }
    };

    addAll(products, 'product');
    addAll(substances, 'substance');
    addAll(fish, 'product');
    addAll(fossils, 'fossil');
    addAll(shipParts, 'fabrication');
    addAll(technology, 'technology');
    addAll(construction, 'construction');

    initializeSearch();
});

function createSearchResult(item) {
    const row = document.createElement('div');
    row.className = 'search-result';

    const icon = document.createElement('img');
    icon.className = 'search-result-icon';
    icon.src = searchIconSrc(item.icon);
    icon.alt = '';
    icon.onerror = () => { icon.style.visibility = 'hidden'; }; // a few game icons are missing
    const [r, g, b, a] = item.rgba;
    icon.style.backgroundColor = `rgba(${parseFloat(r) * 255}, ${parseFloat(g) * 255}, ${parseFloat(b) * 255}, ${a})`;

    const text = document.createElement('div');
    text.className = 'search-result-text';

    const name = document.createElement('span');
    name.className = 'search-result-name';
    name.textContent = item.name;

    const meta = document.createElement('span');
    meta.className = 'search-result-meta';
    meta.textContent = [TYPE_LABELS[item.type], item.subtitle].filter(Boolean).join(' · ');

    text.append(name, meta);
    row.append(icon, text);

    row.onclick = () => {
        const params = new URLSearchParams({ id: item.id, type: item.type });
        window.location.href = `/item/?${params.toString()}`;
    };
    return row;
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const resultBox = document.getElementById('search-results');

    if (!searchInput || !resultBox) return;

    const goToSearchPage = query => {
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    };

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        resultBox.innerHTML = '';

        if (query.length === 0) return;

        // Names starting with the search text first, then alphabetical
        const matches = allItems
            .filter(item => item.name && item.name.toLowerCase().includes(query))
            .sort((x, y) => {
                const xStarts = x.name.toLowerCase().startsWith(query) ? 0 : 1;
                const yStarts = y.name.toLowerCase().startsWith(query) ? 0 : 1;
                return xStarts - yStarts || x.name.localeCompare(y.name);
            });

        if (matches.length === 0) {
            const none = document.createElement('div');
            none.className = 'search-result-none';
            none.textContent = 'No results found';
            resultBox.appendChild(none);
            return;
        }

        matches.slice(0, MAX_RESULTS).forEach(item => {
            resultBox.appendChild(createSearchResult(item));
        });

        // "See all results" when there are more matches than the dropdown shows
        if (matches.length > MAX_RESULTS) {
            const seeAll = document.createElement('div');
            seeAll.className = 'search-see-all';
            seeAll.textContent = `See all ${matches.length} results for "${query}"`;
            seeAll.onclick = () => goToSearchPage(query);
            resultBox.appendChild(seeAll);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        // Enter opens the full search page; Escape closes the results
        const query = searchInput.value.trim();
        if (e.key === 'Enter' && query) {
            goToSearchPage(query);
        } else if (e.key === 'Escape') {
            resultBox.innerHTML = '';
        }
    });

    document.addEventListener('click', (e) => {
        if (!document.getElementById('search-container').contains(e.target)) {
            resultBox.innerHTML = '';
        }
    });
}
