let editingSoulTraitId = null;
let selectedSoulTraitIds = new Set();

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

function updateDeleteSoulTraitsButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedSoulTraitsBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedSoulTraitIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedSoulTraitIds.size})`;
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

    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#soulTraitsTable', {
        ajax: {
            url: `${BASE_URL}/api/admin`,
            type: "POST",

            headers: {
                Authorization: `Bearer ${token}`
            },

            contentType: "application/json",

            data: function () {
                return JSON.stringify({
                    action: "getAll",
                    table: "catalog_soul_traits"
                });
            },

            dataSrc: function (json) {
                return Array.isArray(json)
                    ? json
                    : json?.data || [];
            }
        },

        columns: [
            {
                data: null,
                orderable: false,
                render: (data, type, row) => `
                    <input
                        type="checkbox"
                        class="task-checkbox selectTaskCheckbox"
                        data-id="${row.id}"
                    >
                `
            },
            {
                data: "name"
            },
            {
                data: null,
                render: (data, type, row) =>
                    `ATK : ${row.stat_atk || 0},
                    DEF : ${row.stat_def || 0},
                    MAX_HP : ${row.stat_max_hp || 0},
                    MAX_MP : ${row.stat_max_mp || 0},
                    CRIT_DMG : ${row.stat_crit_dmg || 0},
                    CRIT_RATE : ${row.stat_crit_pct || 0}%`
            },
            {
                data: null,
                render: (data, type, row) =>
                    `ATK : ${row.growth_atk || 0},
                    DEF : ${row.growth_def || 0},
                    MAX_HP : ${row.growth_max_hp || 0},
                    MAX_MP : ${row.growth_max_mp || 0},
                    CRIT_DMG : ${row.growth_crit_dmg || 0},
                    CRIT_RATE : ${row.growth_crit_pct || 0}%`
            },
            {
                data: null,
                render: (data, type, row) =>
                    row.skill_name ?? row.skillName
            },
            {
                data: null,
                render: (data, type, row) =>
                    row.skill_mp_cost ?? row.skillMpCost
            },
            {
                data: null,
                render: (data, type, row) =>
                    JSON.stringify(row.effects || [])
            },
            {
                data: null,
                orderable: false,
                render: (data, type, row) => `
                    <button
                        type="button"
                        class="table-btn edit edit-btn"
                        data-id="${row.id}">
                        Edit
                    </button>

                    <button
                        class="table-btn delete delete-btn"
                        data-id="${row.id}">
                        Delete
                    </button>
                `
            }
        ]
    });

    document.getElementById('selectAllSoulTraits').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedSoulTraitIds.add(id);
                } else {
                    selectedSoulTraitIds.delete(id);
                }
            }
        });

        updateDeleteSoulTraitsButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedSoulTraitIds.add(id);
        } else {
            selectedSoulTraitIds.delete(id);
        }

        console.log(selectedSoulTraitIds);

        updateDeleteSoulTraitsButton();
    });

    document.getElementById("deleteSelectedSoulTraitsBtn").addEventListener("click", async () => {

        if (selectedSoulTraitIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedSoulTraitIds.size} soul trait(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedSoulTraitIds);

        try {

            const response = await fetch(
                `${BASE_URL}/api/admin`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: "deleteBulk",
                        table: "catalog_soul_traits",
                        ids: [...selectedSoulTraitIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedSoulTraitIds.clear()

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });

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

            const row = editButton.closest("tr");

            const soulTrait =
                table.row(row).data();

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

            const soulTraitId = deleteButton.dataset.id;

            try {

                const response = await fetch(
                    `${BASE_URL}/api/admin`,
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

                table.ajax.reload(null, false);

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    soulTraitForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

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
                    `${BASE_URL}/api/admin`,
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

                if (!response.ok) {
                    throw new Error(result.error);
                }
            }

            // =====================
            // ADD
            // =====================
            else {

                const response = await fetch(
                    `${BASE_URL}/api/admin`,
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
            table.ajax.reload(null, false);

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