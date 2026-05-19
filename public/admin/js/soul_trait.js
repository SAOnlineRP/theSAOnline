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

async function fetchSoulTraits() {

    try {

        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            "http://localhost:3000/api/catalog_soul_traits",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const soulTraits =
            await response.json();

        return soulTraits;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderSoulTraits(soulTraits, tableBody) {

    tableBody.innerHTML = soulTraits
        .map((soulTrait) => {
            return `
                <tr>
                    <td>${soulTrait.name}</td>
                    <td>${JSON.stringify(soulTrait.stats)}</td>
                    <td>${JSON.stringify(soulTrait.growth)}</td>
                    <td>${soulTrait.skill_name ?? soulTrait.skillName}</td>
                    <td>${soulTrait.skill_mp_cost ?? soulTrait.skillMpCost}</td>
                    <td>${soulTrait.effects}</td>
                    <td>
                        <button type="button"
                            class="edit-btn"
                            data-id="${soulTrait.id}">
                            Edit
                        </button>
                        <button 
                            class="delete-btn"
                            data-id="${soulTrait.id}"
                        >
                            Delete
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
        JSON.stringify(soulTrait.stats);

    document.getElementById("soulTraitGrowth").value =
        JSON.stringify(soulTrait.growth);

    document.getElementById("soulTraitSkillName").value =
        soulTrait.skillName ?? soulTrait.skill_name;

    document.getElementById("soulTraitSkillMPCost").value =
        soulTrait.skillMpCost ?? soulTrait.skill_mp_cost;

    document.getElementById("soulTraitEffects").value =
        soulTrait.effects;
}

async function initSoulTraitsPage() {
    let soulTraits = [];

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

    const saveSoulTraitBtn =
    document.getElementById("saveSoulTraitBtn");

    const saveBtnText =
        saveSoulTraitBtn.querySelector(".btn-text");

    const saveBtnLoading =
        saveSoulTraitBtn.querySelector(".btn-loading");

    const tableOverlayLoading =
        document.getElementById(
            "tableOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }
    function setSaveLoading(isLoading) {

        saveSoulTraitBtn.classList.toggle(
            "loading",
            isLoading
        );

        saveBtnText.classList.toggle(
            "hidden",
            isLoading
        );

        saveBtnLoading.classList.toggle(
            "hidden",
            !isLoading
        );

        saveSoulTraitBtn.disabled = isLoading;
    }

    try {

        setTableLoading(true);

        const soulTraitsResponse =
            await fetchSoulTraits();

        soulTraits = Array.isArray(soulTraitsResponse)
            ? soulTraitsResponse
            : soulTraitsResponse?.data || [];

        renderSoulTraits(
            soulTraits,
            soulTraitsTableBody
        );

    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

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

    soulTraitsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const soulTraitId = editButton.dataset.id;

            const soulTrait = soulTraits.find(
                (item) => item.id === soulTraitId
            );

            if (!soulTrait) {
                console.error(
                    "Soul trait not found for ID:",
                    soulTraitId
                );

                return;
            }

            editingSoulTraitId = soulTraitId;

            modalTitle.textContent =
                "Edit Soul Trait";

            fillSoulTraitForm(soulTrait);

            modalSoulTrait.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this soul trait?");

            if (!confirmed) {
                return;
            }

            const token =
                localStorage.getItem("access_token");

            const soulTraitId = deleteButton.dataset.id;

            try {

                const response = await fetch(
                    "http://localhost:3000/api/catalog_soul_traits",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            id: soulTraitId,
                        }),
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                const soulTraitsResponse =
                    await fetchSoulTraits();

                const updatedSoulTraits =
                    Array.isArray(soulTraitsResponse)
                        ? soulTraitsResponse
                        : soulTraitsResponse?.data || [];

                renderSoulTraits(
                    updatedSoulTraits,
                    soulTraitsTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    soulTraitForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

        const formData = {
            name: document.getElementById("soulTraitName").value,

            stats: JSON.parse(
                document.getElementById("soulTraitStats").value
            ),

            growth: JSON.parse(
                document.getElementById("soulTraitGrowth").value
            ),

            skill_name:
                document.getElementById("soulTraitSkillName")
                    .value,

            skill_mp_cost: Number(
                document.getElementById(
                    "soulTraitSkillMPCost"
                ).value
            ),

            effects:
                document.getElementById(
                    "soulTraitEffects"
                ).value
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingSoulTraitId !== null) {

                const response = await fetch(
                    "http://localhost:3000/api/catalog_soul_traits",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            id: editingSoulTraitId,
                            ...formData,
                        }),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }
            }

            // =====================
            // ADD
            // =====================
            else {

                const response = await fetch(
                    "http://localhost:3000/api/catalog_soul_traits",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify(formData),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }
            }

            // reload data
            const soulTraitsResponse =
                await fetchSoulTraits();

            soulTraits = Array.isArray(soulTraitsResponse)
                ? soulTraitsResponse
                : soulTraitsResponse?.data || [];

            renderSoulTraits(
                soulTraits,
                soulTraitsTableBody
            );

            modalSoulTrait.style.display = "none";

            soulTraitForm.reset();

            editingSoulTraitId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalSoulTrait) {
            modalSoulTrait.style.display = "none";
        }
    });
}