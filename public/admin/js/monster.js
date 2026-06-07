let editingMonsterId = null;
let selectedMonsterIds = new Set();

function renderMonsters(monsters, tableBody) {

    tableBody.innerHTML = monsters
        .map((monster) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${monster.id}"></td>
                    <td><img src="${monster.link_photo || 'https://via.placeholder.com/50'}" alt="${monster.name}" width="50" height="50"></td>
                    <td>${monster.name}</td>
                    <td>${monster.type || 'N/A'}</td>
                    <td>ATK: ${monster.atk || 'N/A'}, DEF: ${monster.def || 'N/A'}, HP: ${monster.max_hp || 'N/A'}, MP: ${monster.max_mp || 'N/A'}</td>
                    <td>
                        <button class="table-btn edit edit-btn" data-id="${monster.id}">Edit</button>
                        <button class="table-btn delete delete-btn" data-id="${monster.id}">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillMonsterForm(monster) {

    document.getElementById("monsterName").value =
        monster.name;

    document.getElementById("monsterType").value =
        monster.type || "";

    document.getElementById("monsterDescription").value =
        monster.description || "";
}

function updateDeleteMonsterButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedMonstersBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedMonsterIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedMonsterIds.size})`;
}

async function initMonstersPage() {
    let monsters = [];

    const modalMonster =
        document.getElementById("monsterModal");

    const openBtnMonster =
        document.getElementById("openMonsterModal");

    const closeBtnMonster =
        document.getElementById("closeMonsterModal");

    const monstersTableBody =
        document.getElementById("monstersTableBody");

    const monsterForm =
        document.getElementById("monsterForm");

    const modalTitle =
        modalMonster.querySelector("h2");

    const token =
        localStorage.getItem("access_token");

    let table = new DataTable('#monstersTable', {
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
                    table: "catalog_monsters"
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
                data: null,
                render: (data, type, row) => `
                    <img
                        src="${row.link_photo || 'https://via.placeholder.com/50'}"
                        alt="${row.name}"
                        width="150"
                        height="50"
                    >
                `
            },
            {
                data: "name"
            },
            {
                data: "type"
            },
            {
                data: null,
                render: (data, type, row) =>
                    `ATK : ${row.atk || 0},
                    DEF : ${row.def || 0},
                    MAX_HP : ${row.max_hp || 0},
                    MAX_MP : ${row.max_mp || 0}`
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
    document.getElementById('selectAllMonsterTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedMonsterIds.add(id);
                } else {
                    selectedMonsterIds.delete(id);
                }
            }
        });

        updateDeleteMonsterButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedMonsterIds.add(id);
        } else {
            selectedMonsterIds.delete(id);
        }

        console.log(selectedMonsterIds);

        updateDeleteMonsterButton();
    });

    document.getElementById("deleteSelectedMonstersBtn").addEventListener("click", async () => {

        if (selectedMonsterIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedMonsterIds.size} monster(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedMonsterIds);

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
                        table: "catalog_monsters",
                        ids: [...selectedMonsterIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedMonsterIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });
    // buka modal
    openBtnMonster.addEventListener("click", () => {

        editingMonsterId = null;

        modalTitle.textContent = "Add New Monster";

        monsterForm.reset();

        modalMonster.style.display = "flex";
    });

    // tutup modal
    closeBtnMonster.addEventListener("click", () => {
        modalMonster.style.display = "none";
    });

    monstersTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const monsterId = editButton.dataset.id;

            const row =
                editButton.closest("tr");

            const monster =
                table.row(row).data();

            if (!monster) {
                console.error(
                    "Monster not found for ID:",
                    monsterId
                );

                return;
            }

            editingMonsterId = monsterId;

            modalTitle.textContent =
                "Edit Monster";

            fillMonsterForm(monster);

            modalMonster.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this monster?");

            if (!confirmed) {
                return;
            }

            const monsterId = deleteButton.dataset.id;

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
                            table: "catalog_monsters",
                            id: monsterId
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

    monsterForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            name: document.getElementById("monsterName").value,
            description: document.getElementById("monsterDescription").value,
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingMonsterId !== null) {

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
                            table: "catalog_monsters",
                            id: editingMonsterId,
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
                            table: "catalog_monsters",
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

            modalMonster.style.display = "none";

            monsterForm.reset();

            editingMonsterId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalMonster) {
            modalMonster.style.display = "none";
        }
    });
}