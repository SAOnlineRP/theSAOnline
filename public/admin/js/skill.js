let editingSkillId = null;
let selectedSkillIds = new Set();

function fillSkillForm(skill) {

    document.getElementById("skillName").value = skill.name || "";
    document.getElementById("mpCost").value = skill.mp_cost || 0;
    document.getElementById("effects").value = JSON.stringify(skill.effects || []);
}

function updateDeleteSkillsButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedSkillsBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedSkillIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedSkillIds.size})`;
}


async function initSkillsPage() {
    let skills = [];

    const modalSkill =
        document.getElementById("skillModal");

    const openBtnSkill =
        document.getElementById("openSkillModal");

    const closeBtnSkill =
        document.getElementById("closeSkillModal");

    const skillsTableBody =
        document.getElementById("skillsTableBody");

    const skillForm =
        document.getElementById("skillForm");

    const modalTitle =
        modalSkill.querySelector("h2");


    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#skillsTable', {
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
                    table: "catalog_skills"
                });
            },

            dataSrc: function (json) {
                return Array.isArray(json)
                    ? json
                    : json?.data || [];
            }
        },

        order: [[1, 'asc']],

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
                data: 'name'
            },

            {
                data: 'mp_cost'
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
                        type="button"
                        class="table-btn delete delete-btn"
                        data-id="${row.id}">
                        Delete
                    </button>
                `
            }
        ]
    });

    document.getElementById('selectAllSkills').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedSkillIds.add(id);
                } else {
                    selectedSkillIds.delete(id);
                }
            }
        });

        updateDeleteSkillsButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedSkillIds.add(id);
        } else {
            selectedSkillIds.delete(id);
        }

        console.log(selectedSkillIds);

        updateDeleteSkillsButton();
    });

    document.getElementById("deleteSelectedSkillsBtn").addEventListener("click", async () => {

        if (selectedSkillIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedSkillIds.size} skill(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedSkillIds);

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
                        table: "catalog_skills",
                        ids: [...selectedSkillIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedSkillIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });

    // buka modal
    openBtnSkill.addEventListener("click", () => {
        editingSkillId = null;

        modalTitle.textContent = "Add New Skill";

        skillForm.reset();

        modalSkill.style.display = "flex";
    });

    // tutup modal
    closeBtnSkill.addEventListener("click", () => {
        modalSkill.style.display = "none";
    });

    skillsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton = e.target.closest(".edit-btn");

        if (editButton) {
            editingSkillId = editButton.dataset.id;
            const row = editButton.closest("tr");

            const skill =
                table.row(row).data();

            if (!skill) {
                console.error(
                    "Skill not found for ID:",
                    editingSkillId
                );

                return;
            }

            modalTitle.textContent = "Edit Skill";
            fillSkillForm(skill);
            modalSkill.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton = e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this skill?");

            if (!confirmed) {
                return;
            }

            const skillId = deleteButton.dataset.id;

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
                            table: "catalog_skills",
                            id: skillId
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

    skillForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            name: document.getElementById("skillName").value,
            mp_cost: parseInt(document.getElementById("mpCost").value) || 0,
            effects: JSON.parse(document.getElementById("effects").value || "[]")
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingSkillId !== null) {

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
                            table: "catalog_skills",
                            id: editingSkillId,
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
                            table: "catalog_skills",
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

            modalSkill.style.display = "none";

            skillForm.reset();

            editingSkillId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalSkill) {
            modalSkill.style.display = "none";
        }
    });

}