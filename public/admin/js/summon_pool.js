let editingSummonPoolId = null;
let selectedSummonPoolIds = new Set();

function fillSummonPoolForm(summonPool) {

    document.getElementById("summonType").value =
        summonPool.summon_type;

    document.getElementById("rewardType").value =
        summonPool.reward_type || "";
    document.getElementById("rewardName").value =
        summonPool.reward_name || "";
    document.getElementById("probability").value =
        summonPool.probability || 0;
    document.getElementById("quantity").value =
        summonPool.quantity || 0;
}

function updateDeleteSummonPoolButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedSummonPoolBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedSummonPoolIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedSummonPoolIds.size})`;
}

async function initSummonPoolsPage() {
    let summonPools = [];

    const modalSummonPool =
        document.getElementById("summonPoolModal");

    const openBtnSummonPool =
        document.getElementById("openSummonPoolModal");

    const closeBtnSummonPool =
        document.getElementById("closeSummonPoolModal");

    const summonPoolsTableBody =
        document.getElementById("summonPoolsTableBody");

    const summonPoolForm =
        document.getElementById("summonPoolForm");

    const modalTitle =
        modalSummonPool.querySelector("h2");


    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#summonPoolsTable', {
        ajax: {
            url: `${BASE_URL}/api/admin`,
            type: 'POST',

            headers: {
                Authorization: `Bearer ${token}`
            },

            contentType: 'application/json',

            data: function () {
                return JSON.stringify({
                    action: "getAll",
                    table: "summon_pool"
                });
            },

            dataSrc: function (json) {
                return Array.isArray(json)
                    ? json
                    : json?.data || [];
            }
        },

        order: [[2, 'asc']],

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
                data: 'summon_type'
            },

            {
                data: 'reward_type'
            },

            {
                data: 'reward_name'
            },

            {
                data: 'probability'
            },

            {
                data: 'quantity'
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
                        type="button"
                        class="table-btn delete delete-btn"
                        data-id="${row.id}">
                        Delete
                    </button>
                `
            }
        ]
    });
    document.getElementById('selectAllSummonPools').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedSummonPoolIds.add(id);
                } else {
                    selectedSummonPoolIds.delete(id);
                }
            }
        });

        updateDeleteSummonPoolButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedSummonPoolIds.add(id);
        } else {
            selectedSummonPoolIds.delete(id);
        }

        console.log(selectedSummonPoolIds);

        updateDeleteSummonPoolButton();
    });

    document.getElementById("deleteSelectedSummonPoolBtn").addEventListener("click", async () => {

        if (selectedSummonPoolIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedSummonPoolIds.size} pool(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedSummonPoolIds);

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
                        action: "bulkDelete",
                        table: "summon_pool",
                        ids: [...selectedSummonPoolIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedSummonPoolIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        };

    });
    async function loadRewards() {

        const rewardType =
            document.getElementById("rewardType").value;

        const rewardSelect =
            document.getElementById("rewardName");

        rewardSelect.innerHTML = "";

        let table;

        if (rewardType === "item") {
            table = "catalog_items";
        } else if (rewardType === "partner") {
            table = "catalog_partners";
        } else {
            return;
        }

        const response = await fetch(
            `${BASE_URL}/api/admin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: "getAll",
                    table
                })
            }
        );

        const rewards = await response.json();
        let data = rewards.data;

        data.forEach(reward => {

            const option =
                document.createElement("option");

            option.value = reward.id;
            option.textContent = reward.name;

            rewardSelect.appendChild(option);
        });
    }

    const rewardType =
        document.getElementById("rewardType");

    rewardType.addEventListener("change", loadRewards);
    // buka modal
    openBtnSummonPool.addEventListener("click", () => {

        editingSummonPoolId = null;

        modalTitle.textContent = "Add New Pool";

        summonPoolForm.reset();

        modalSummonPool.style.display = "flex";
    });

    // tutup modal
    closeBtnSummonPool.addEventListener("click", () => {
        modalSummonPool.style.display = "none";
    });

    summonPoolsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const summonPoolId = editButton.dataset.id;

            const row = editButton.closest("tr");

            const pool =
                table.row(row).data();

            if (!pool) {
                console.error(
                    "Pool not found for ID:",
                    summonPoolId
                );

                return;
            }

            editingSummonPoolId = summonPoolId;

            modalTitle.textContent =
                "Edit Pool";

            fillEquipmentForm(pool);

            modalSummonPool.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this pool?");

            if (!confirmed) {
                return;
            }

            const summonPoolId = deleteButton.dataset.id;

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
                            table: "summon_pool",
                            id: summonPoolId
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

    summonPoolForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            summon_type: document.getElementById("summonType").value,
            reward_type: document.getElementById("rewardType").value,
            reward_id: document.getElementById("rewardName").value,
            probability: parseFloat(
                document.getElementById("probability").value
            ) || 0,
            quantity: parseFloat(
                document.getElementById("quantity").value
            ) || 0
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingSummonPoolId !== null) {

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
                            table: "summon_pool",
                            id: editingSummonPoolId,
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
                            table: "summon_pool",
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

            modalSummonPool.style.display = "none";

            summonPoolForm.reset();

            editingSummonPoolId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalSummonPool) {
            modalSummonPool.style.display = "none";
        }
    });
}