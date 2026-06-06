let editingSoulTraitId = null;

async function fetchSoulTraits() {

    try {

        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            "http://localhost:3000/api/admin",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ table: "catalog_soul_traits", action: "getAll" })
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
                    <td>ATK : ${soulTrait.stat_atk || 0}, DEF : ${soulTrait.stat_def || 0}, MAX_HP : ${soulTrait.stat_max_hp || 0}, MAX_MP : ${soulTrait.stat_max_mp || 0}, CRIT_DMG : ${soulTrait.stat_crit_dmg || 0}, CRIT_RATE : ${soulTrait.stat_crit_pct || 0}%</td>
                    <td>ATK : ${soulTrait.growth_atk || 0}, DEF : ${soulTrait.growth_def || 0}, MAX_HP : ${soulTrait.growth_max_hp || 0}, MAX_MP : ${soulTrait.growth_max_mp || 0}, CRIT_DMG : ${soulTrait.growth_crit_dmg || 0}, CRIT_RATE : ${soulTrait.growth_crit_pct || 0}%</td>
                    <td>${soulTrait.skill_name ?? soulTrait.skillName}</td>
                    <td>${soulTrait.skill_mp_cost ?? soulTrait.skillMpCost}</td>
                    <td>${JSON.stringify(soulTrait.effects || [])}</td>
                    <td>
                        <button type="button"
                            class="table-btn edit edit-btn"
                            data-id="${soulTrait.id}">
                            Edit
                        </button>
                        <button 
                            class="table-btn delete delete-btn"
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

    document.getElementById("soulTraitATK").value =
        soulTrait.stat_atk || 0;
    document.getElementById("soulTraitDEF").value =
        soulTrait.stat_def || 0;
    document.getElementById("soulTraitMAX_HP").value =
        soulTrait.stat_max_hp || 0;
    document.getElementById("soulTraitMAX_MP").value =
        soulTrait.stat_max_mp || 0;
    document.getElementById("soulTraitCRIT_DMG").value =
        soulTrait.stat_crit_dmg || 0;
    document.getElementById("soulTraitCRIT_PCT").value =
        soulTrait.stat_crit_pct || 0;
    document.getElementById("soulTraitGrowthATK").value =
        soulTrait.growth_atk || 0;
    document.getElementById("soulTraitGrowthDEF").value =
        soulTrait.growth_def || 0;
    document.getElementById("soulTraitGrowthMAX_HP").value =
        soulTrait.growth_max_hp || 0;
    document.getElementById("soulTraitGrowthMAX_MP").value =
        soulTrait.growth_max_mp || 0;
    document.getElementById("soulTraitGrowthCRIT_DMG").value =
        soulTrait.growth_crit_dmg || 0;
    document.getElementById("soulTraitGrowthCRIT_PCT").value =
        soulTrait.growth_crit_pct || 0;

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
                    "http://localhost:3000/api/admin",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            action: "delete",
                            table: "catalog_soul_traits",
                            id: soulTraitId
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

            stat_atk: parseFloat(
                document.getElementById("soulTraitATK").value
            ) || 0,
            stat_def: parseFloat(
                document.getElementById("soulTraitDEF").value
            ) || 0,
            stat_max_hp: parseFloat(
                document.getElementById("soulTraitMAX_HP").value
            ) || 0,
            stat_max_mp: parseFloat(
                document.getElementById("soulTraitMAX_MP").value
            ) || 0,
            stat_crit_dmg: parseFloat(
                document.getElementById("soulTraitCRIT_DMG").value
            ) || 0,
            stat_crit_pct: parseFloat(
                document.getElementById("soulTraitCRIT_PCT").value
            ) || 0,
            growth_atk: parseFloat(
                document.getElementById("soulTraitGrowthATK").value
            ) || 0,
            growth_def: parseFloat(
                document.getElementById("soulTraitGrowthDEF").value
            ) || 0,
            growth_max_hp: parseFloat(
                document.getElementById("soulTraitGrowthMAX_HP").value
            ) || 0,
            growth_max_mp: parseFloat(
                document.getElementById("soulTraitGrowthMAX_MP").value
            ) || 0,
            growth_crit_dmg: parseFloat(
                document.getElementById("soulTraitGrowthCRIT_DMG").value
            ) || 0,
            growth_crit_pct: parseFloat(
                document.getElementById("soulTraitGrowthCRIT_PCT").value
            ) || 0,

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
                    "http://localhost:3000/api/admin",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            action: "update",
                            table: "catalog_soul_traits",
                            id: editingSoulTraitId,
                            data: formData,
                        }),
                    }
                );

                const result = await response.json();


                //const text = await response.text();
                //console.log(text);

                if (!response.ok) {
                    throw new Error(result.error);
                }
            }

            // =====================
            // ADD
            // =====================
            else {

                const response = await fetch(
                    "http://localhost:3000/api/admin",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            action: "create",
                            table: "catalog_soul_traits",
                            data: formData
                        }),
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