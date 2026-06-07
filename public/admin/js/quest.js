let editingQuestId = null;
let selectedQuestIds = new Set();

async function fetchQuests() {

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
                body: JSON.stringify({ table: "catalog_quests", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const quests =
            await response.json();

        return quests;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderQuests(quests, tableBody) {

    tableBody.innerHTML = quests
        .map((quest) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${quest.id}"></td>
                    <td><img src="${quest.link_photo || 'https://via.placeholder.com/50'}" alt="${quest.name}" width="50" height="50"></td>
                    <td>${quest.name}</td>
                    <td>${quest.description || 'N/A'}</td>
                    <td>COL : ${quest.reward_col || 'N/A'}, GEMS : ${quest.reward_gems || 'N/A'}, Vouchers : ${quest.reward_vouchers || 'N/A'}</td>
                    <td>
                        <button class="table-btn edit edit-btn" data-id="${quest.id}">Edit</button>
                        <button class="table-btn delete delete-btn" data-id="${quest.id}">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillQuestForm(quest) {

    document.getElementById("questName").value =
        quest.name;

    document.getElementById("questDescription").value =
        quest.description || "";
}

function updateDeleteQuestButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedQuestsBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedQuestIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedQuestIds.size})`;
}

async function initQuestsPage() {
    let quests = [];

    const modalQuest =
        document.getElementById("questModal");

    const openBtnQuest =
        document.getElementById("openQuestModal");

    const closeBtnQuest =
        document.getElementById("closeQuestModal");

    const questsTableBody =
        document.getElementById("questsTableBody");

    const questForm =
        document.getElementById("questForm");

    const modalTitle =
        modalQuest.querySelector("h2");

    const tableOverlayLoading =
        document.getElementById(
            "tableQuestOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const questsResponse =
            await fetchQuests();

        quests = Array.isArray(questsResponse)
            ? questsResponse
            : questsResponse?.data || [];

        renderQuests(
            quests,
            questsTableBody
        );
        
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

    let table = new DataTable('#questsTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
            }
        ]
    });
    document.getElementById('selectAllQuestTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedQuestIds.add(id);
                } else {
                    selectedQuestIds.delete(id);
                }
            }
        });

        updateDeleteQuestButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedQuestIds.add(id);
        } else {
            selectedQuestIds.delete(id);
        }

        console.log(selectedQuestIds);

        updateDeleteQuestButton();
    });

    document.getElementById("deleteSelectedQuestsBtn").addEventListener("click", async () => {

        if (selectedQuestIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedQuestIds.size} quest(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedQuestIds);

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
                        table: "catalog_quests",
                        ids: [...selectedQuestIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedQuestIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

    });
    // buka modal
    openBtnQuest.addEventListener("click", () => {

        editingQuestId = null;

        modalTitle.textContent = "Add New Quest";

        questForm.reset();

        modalQuest.style.display = "flex";
    });

    // tutup modal
    closeBtnQuest.addEventListener("click", () => {
        modalQuest.style.display = "none";
    });

    questsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const questId = editButton.dataset.id;

            const quest = quests.find(
                (item) => item.id === questId
            );

            if (!quest) {
                console.error(
                    "Quest not found for ID:",
                    questId
                );

                return;
            }

            editingQuestId = questId;

            modalTitle.textContent =
                "Edit Quest";

            fillQuestForm(quest);

            modalQuest.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this quest?");

            if (!confirmed) {
                return;
            }

            const token =
                localStorage.getItem("access_token");

            const questId = deleteButton.dataset.id;

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
                            table: "catalog_quests",
                            id: questId
                        }),
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                const questsResponse =
                    await fetchQuests();

                const updatedQuests =
                    Array.isArray(questsResponse)
                        ? questsResponse
                        : questsResponse?.data || [];

                renderQuests(
                    updatedQuests,
                    questsTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    questForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

        const formData = {
            name: document.getElementById("questName").value,
            description: document.getElementById("questDescription").value,
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingQuestId !== null) {

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
                            table: "catalog_quests",
                            id: editingQuestId,
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
                            table: "catalog_quests",
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
            const questsResponse =
                await fetchQuests();

            quests = Array.isArray(questsResponse)
                ? questsResponse
                : questsResponse?.data || [];

            renderQuests(
                quests,
                questsTableBody
            );

            modalQuest.style.display = "none";

            questForm.reset();

            editingQuestId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalQuest) {
            modalQuest.style.display = "none";
        }
    });
}