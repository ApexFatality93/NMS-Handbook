
const expeditionGrid = document.getElementById("expedition-grid");

let expeditionData = {};

function createExpeditionCard(seasonNumber, seasonData) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", seasonNumber);

    card.addEventListener("click", () => {
        window.location.href = `expeditions.html?id=${encodeURIComponent(seasonNumber)}`;
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";

    const icon = document.createElement("img");
    icon.className = "product-icon";
    icon.src = seasonData.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = seasonData.SeasonName || seasonNumber;

    imageWrapper.appendChild(icon);

    const content = document.createElement("div");
    content.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = seasonData.SeasonName;
    content.appendChild(title);

    card.appendChild(imageWrapper);
    card.appendChild(content);
    expeditionGrid.appendChild(card);
}

function displayAllExpeditionCards() {
    const sortedExpeditions = Object.entries(expeditionData).sort((a, b) => {
        return Number(a[0]) - Number(b[0]);
    });

    sortedExpeditions.forEach(([seasonNumber, seasonData]) => {
        createExpeditionCard(seasonNumber, seasonData);
    });
}

function displayExpeditionDetail(seasonNumber, seasonData) {
    const container = document.createElement("div");
    container.className = "expedition-detail";

    // Name
    const title = document.createElement("h2");
    title.textContent = seasonData.SeasonName;
    container.appendChild(title);

    // Description
    const description = document.createElement("h3");
    description.textContent = seasonData.Description;
    container.appendChild(description);

    // Icon
    const icon = document.createElement("img");
    icon.src = seasonData.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
    icon.alt = seasonData.SeasonName;
    icon.className = "detail-icon";
    container.appendChild(icon);

    // Rewards header
    const rewardHeader = document.createElement("h2");
    rewardHeader.textContent = "Expedition Rewards"
    container.appendChild(rewardHeader)

    // Rewards per stage
    if (seasonData.Rewards && typeof seasonData.Rewards === "object") {
        Object.entries(seasonData.Rewards).forEach(([stageId, rewards]) => {
            const stageDiv = document.createElement("div");
            stageDiv.className = "stage-section";

            const stageTitle = document.createElement("h3");
            stageTitle.textContent = stageId === "-1" ? "Final Reward" : `Stage ${stageId}`;
            stageDiv.appendChild(stageTitle);

            const rewardList = document.createElement("ul");
            rewardList.className = "reward-list";

            rewards.forEach(reward => {
                const listItem = document.createElement("li");
                listItem.className = "reward-item";

                // Make item clickable
                listItem.addEventListener("click", () => {
                    window.location.href = `item.html?id=${reward.ID}&type=product`;
                });

                const rewardIcon = document.createElement("img");
                rewardIcon.src = reward.Icon_Filename.replace(/\.DDS$/, ".png").replace(/^TEXTURES\/UI\/FRONTEND\/ICONS\/(.+)$/, (_, dynamic) => `TEXTURES/UI/FRONTEND/ICONS/${dynamic.toLowerCase()}`);
                rewardIcon.alt = reward.RewardName || "Reward";
                rewardIcon.className = "reward-icon";
                const rgba = `rgba(${reward.Colour_R * 255}, ${reward.Colour_G * 255}, ${reward.Colour_B * 255}, ${reward.Colour_A})`;
                rewardIcon.style.backgroundColor = rgba;

                const rewardText = document.createElement("span");
                rewardText.textContent = reward.RewardName;

                listItem.appendChild(rewardIcon);
                listItem.appendChild(rewardText);
                rewardList.appendChild(listItem);
            });

            stageDiv.appendChild(rewardList);
            container.appendChild(stageDiv);
        });
    }

    expeditionGrid.innerHTML = "";  // Clear grid
    expeditionGrid.appendChild(container);
}


fetch("./JSON_Files/Expedition_Table.json")
    .then(res => res.json())
    .then(data => {
        expeditionData = data;

        const urlParams = new URLSearchParams(window.location.search);
        const selectedId = urlParams.get("id");

        if (selectedId && expeditionData[selectedId]) {
            expeditionGrid.innerHTML = "";
            displayExpeditionDetail(selectedId, expeditionData[selectedId]);
        } else {
            displayAllExpeditionCards();
        }
    })
    .catch(err => console.error("Error loading Expedition_Table.json:", err));
