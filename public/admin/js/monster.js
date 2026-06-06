let editingMonsterId = null;
let selectedMonsterIds = new Set();

async function fetchMonsters() {

    try {

        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            `${BASE_URL}/api/admin`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ table: "catalog_monsters", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const monsters =
            await response.json();

        return monsters;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderMonsters(monsters, tableBody) {

    tableBody.innerHTML = monsters
        .map((monster) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${monster.id}"></td>
                    <td><img src="${monster.link_photo || 'https://via.placeholder.com/50'}" alt="${monster.name}" width="50" height="50"></td>
                    <td>${monster.name}</td>
                    <td>${monster.description}</td>
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

    const openBtnEquipment =
        document.getElementById("openMonsterModal");

    const closeBtnEquipment =
        document.getElementById("closeMonsterModal");

    const monstersTableBody =
        document.getElementById("monstersTableBody");

    const monsterForm =
        document.getElementById("monsterForm");

    const modalTitle =
        modalMonster.querySelector("h2");

    const tableOverlayLoading =
        document.getElementById(
            "tableMonsterOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const monstersResponse =
            await fetchMonsters();

        monsters = Array.isArray(monstersResponse)
            ? monstersResponse
            : monstersResponse?.data || [];

        renderMonsters(
            monsters,
            monstersTableBody
        );
        
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

    let table = new DataTable('#monstersTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
            }
        ]
    });
    document.getElementById('selectAllMonsters').addEventListener('change', function () {

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

        console.log("checkbox changed");

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

        /*const token =
            localStorage.getItem("access_token");

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

            alert("Deleted successfully");

            selectedMonsterIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

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

            const monster = monsters.find(
                (item) => item.id === monsterId
            );

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

            const token =
                localStorage.getItem("access_token");

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

                const monstersResponse =
                    await fetchMonsters();

                const updatedMonsters =
                    Array.isArray(monstersResponse)
                        ? monstersResponse
                        : monstersResponse?.data || [];

                renderMonsters(
                    updatedMonsters,
                    monstersTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    monsterForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

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
            const monstersResponse =
                await fetchMonsters();

            monsters = Array.isArray(monstersResponse)
                ? monstersResponse
                : monstersResponse?.data || [];

            renderMonsters(
                monsters,
                monstersTableBody
            );

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