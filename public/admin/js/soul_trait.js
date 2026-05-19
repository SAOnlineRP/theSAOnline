console.log("soul traits initialized");

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

let editingSoulTraitId = null;

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
                        <button 
                            class="edit-btn"
                            data-id="${soulTrait.id}"
                        >
                            Edit
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillSoulTraitForm(soulTrait) {

    document.getElementById("soulTraitName").value =
        soulTrait.name;

    document.getElementById("soulTraitStats").value =
        soulTrait.stats.join(", ");

    document.getElementById("soulTraitGrowth").value =
        soulTrait.growth.join(", ");

    document.getElementById("soulTraitSkillName").value =
        soulTrait.skillName;

    document.getElementById("soulTraitSkillMPCost").value =
        soulTrait.skillMpCost;
}

async function initSoulTraitsPage() {
    const modalSoulTrait =
        document.getElementById("soulTraitModal");

    const openBtnSoulTrait =
        document.getElementById("openSoulTraitModal");

    const closeBtnSoulTrait =
        document.getElementById("closeSoulTraitModal");

    const soulTraitsTableBody =
        document.getElementById("soulTraitsTableBody");
    
    const soulTraitForm =
    document.getElementById("soulTraitForm");

    const modalTitle =
        modalSoulTrait.querySelector("h2");

    renderSoulTraits(dummySoulTrait, soulTraitsTableBody);

    // buka modal
    openBtnSoulTrait.addEventListener("click", () => {

        editingSoulTraitId = null;

        modalTitle.textContent = "Add New Soul Trait";

        soulTraitForm.reset();

        modalSoulTrait.style.display = "flex";
    });

    // tutup modal
    closeBtnSoulTrait.addEventListener("click", () => {
        modalSoulTrait.style.display = "none";
    });

    soulTraitsTableBody.addEventListener("click", (e) => {

        if (!e.target.classList.contains("edit-btn")) {
            return;
        }

        const soulTraitId =
            Number(e.target.dataset.id);

        const soulTrait =
            dummySoulTrait.find(
                (item) => item.id === soulTraitId
            );

        if (!soulTrait) return;

        editingSoulTraitId = soulTraitId;

        modalTitle.textContent = "Edit Soul Trait";

        fillSoulTraitForm(soulTrait);

        modalSoulTrait.style.display = "flex";
    });

    soulTraitForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const formData = {
            name: document.getElementById("soulTraitName").value,

            stats: document
                .getElementById("soulTraitStats")
                .value
                .split(","),

            growth: document
                .getElementById("soulTraitGrowth")
                .value
                .split(","),

            skillName:
                document.getElementById("soulTraitSkillName")
                    .value,

            skillMpCost: Number(
                document.getElementById(
                    "soulTraitSkillMPCost"
                ).value
            ),
        };

        // EDIT
        if (editingSoulTraitId !== null) {

            const index = dummySoulTrait.findIndex(
                (item) => item.id === editingSoulTraitId
            );

            dummySoulTrait[index] = {
                ...dummySoulTrait[index],
                ...formData,
            };
        }

        // ADD
        else {

            dummySoulTrait.push({
                id: Date.now(),
                effects: "",
                ...formData,
            });
        }

        renderSoulTraits(
            dummySoulTrait,
            soulTraitsTableBody
        );

        modalSoulTrait.style.display = "none";

        soulTraitForm.reset();
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalSoulTrait) {
            modalSoulTrait.style.display = "none";
        }
    });
}