//console.log("partner");

const dummySoulTrait = [
    {
        id: 1,
        name: "Valor",
        stats: ["atk:10", "def:5"],
        growth: ["atk:2", "def:1"],
        skillName: "Valor Strike",
        skillMpCost: 50,    
        effects: "Deals double damage with dual-wielded weapons"
    },
    {
        id: 2,
        name: "Insight",
        stats: ["atk:5", "def:10"],
        growth: ["atk:1", "def:2"],
        skillName: "Insight's Heal",
        skillMpCost: 75,
        effects: "Heals all party members"
    },
];

function renderSoulTraits(soulTraits, tableBody) {

    tableBody.innerHTML = soulTraits
        .map((soulTrait) => {
            return `
                <tr>
                    <td>${soulTrait.name}</td>
                    <td>${soulTrait.stats.join(", ")}</td>
                    <td>${soulTrait.growth.join(", ")}</td>
                    <td>${soulTrait.skillName}</td>
                    <td>${soulTrait.skillMpCost}</td>
                    <td>${soulTrait.effects}</td>
                    <td>
                        <button>Edit</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function initSoulTraitsPage() {
    const soulTraitsTableBody =
        document.getElementById("soulTraitsTableBody");

    renderSoulTraits(dummySoulTrait, soulTraitsTableBody);

}