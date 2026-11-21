
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
