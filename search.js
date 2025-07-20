let allItems = [];
const MAX_RESULTS = 8;

// Load data from all three JSON_files
Promise.all([
    fetch('./JSON_Files/Product_Table.json').then(res => res.json()),
    fetch('./JSON_Files/Substance_Table.json').then(res => res.json()),
    fetch('./JSON_Files/Fish_Table.json').then(res => res.json())
])
.then(([products, substances, fish]) => {
    allItems = [
        ...Object.entries(products).map(([id, item]) => ({
            id,
            name: item.NameLower_Text,
            type: 'product'
        })),
        ...Object.entries(substances).map(([id, item]) => ({
            id,
            name: item.NameLower_Text,
            type: 'substance'
        })),
        ...Object.entries(fish).map(([id, item]) => ({
            id,
            name: item.NameLower_Text,
            type: 'product'
        }))
    ];

    initializeSearch();
});

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const resultBox = document.getElementById('search-results');

    if (!searchInput || !resultBox) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        resultBox.innerHTML = '';

        if (query.length === 0) return;

        const matches = allItems
            .filter(item => item.name && item.name.toLowerCase().includes(query));

        matches.slice(0, MAX_RESULTS).forEach(item => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.textContent = item.name;
            div.onclick = () => {
                const params = new URLSearchParams({ id: item.id, type: item.type });
                window.location.href = `item.html?${params.toString()}`;
            };
            resultBox.appendChild(div);
        });

        // Add "See all results" row if more than 6 matches
        if (matches.length > 6) {
            const seeAll = document.createElement('div');
            seeAll.className = 'search-result search-see-all';
            seeAll.textContent = `See all results for "${query}"`;
            seeAll.onclick = () => {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            };
            resultBox.appendChild(seeAll);
        }
    });

    document.addEventListener('click', (e) => {
        if (!document.getElementById('search-container').contains(e.target)) {
            resultBox.innerHTML = '';
        }
    });
}
