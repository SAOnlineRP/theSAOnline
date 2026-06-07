let editingTaskId = null;
let selectedTaskIds = new Set();

function renderTasks(tasks, tableBody) {

    tableBody.innerHTML = tasks
        .map((task) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${task.id}"></td>
                    <td>${task.type || 'N/A'}</td>
                    <td>${task.title || 'N/A'}</td>
                    <td>COL : ${task.reward_col || 'N/A'}, GEMS : ${task.reward_gems || 'N/A'}, Vouchers : ${task.reward_vouchers || 'N/A'}</td>
                    <td>
                        <button class="table-btn edit edit-btn" data-id="${task.id}">Edit</button>
                        <button class="table-btn delete delete-btn" data-id="${task.id}">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillTaskForm(task) {

    document.getElementById("taskName").value =
        task.name;

    document.getElementById("taskDescription").value =
        task.description || "";
}

function updateDeleteTaskButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedTasksBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedTaskIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedTaskIds.size})`;
}

async function initTasksPage() {
    let tasks = [];

    const modalTask =
        document.getElementById("taskModal");

    const openBtnTask =
        document.getElementById("openTaskModal");

    const closeBtnTask =
        document.getElementById("closeTaskModal");

    const tasksTableBody =
        document.getElementById("tasksTableBody");

    const taskForm =
        document.getElementById("taskForm");

    const modalTitle =
        modalTask.querySelector("h2");

    const token =
        localStorage.getItem("access_token");

    let table = new DataTable('#tasksTable', {
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
                    table: "catalog_tasks"
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
                data: 'type'
            },
            {
                data: 'title'
            },
            {
                data: 'reward_col'
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
    document.getElementById('selectAllTaskTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedTaskIds.add(id);
                } else {
                    selectedTaskIds.delete(id);
                }
            }
        });

        updateDeleteTaskButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedTaskIds.add(id);
        } else {
            selectedTaskIds.delete(id);
        }

        console.log(selectedTaskIds);

        updateDeleteTaskButton();
    });

    document.getElementById("deleteSelectedTasksBtn").addEventListener("click", async () => {

        if (selectedTaskIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedTaskIds.size} task(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedTaskIds);

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
                        table: "catalog_tasks",
                        ids: [...selectedTaskIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedTaskIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });
    // buka modal
    openBtnTask.addEventListener("click", () => {

        editingTaskId = null;

        modalTitle.textContent = "Add New Task";

        taskForm.reset();

        modalTask.style.display = "flex";
    });

    // tutup modal
    closeBtnTask.addEventListener("click", () => {
        modalTask.style.display = "none";
    });

    tasksTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const taskId = editButton.dataset.id;

            const row =
            editButton.closest("tr");

            const task =
                table.row(row).data();

            if (!task) {
                console.error(
                    "Task not found for ID:",
                    taskId
                );

                return;
            }

            editingTaskId = taskId;

            modalTitle.textContent =
                "Edit Task";

            fillTaskForm(task);

            modalTask.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this task?");

            if (!confirmed) {
                return;
            }

            const taskId = deleteButton.dataset.id;

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
                            table: "catalog_tasks",
                            id: taskId
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

    taskForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            name: document.getElementById("taskName").value,
            description: document.getElementById("taskDescription").value,
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingTaskId !== null) {

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
                            table: "catalog_tasks",
                            id: editingTaskId,
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
                            table: "catalog_tasks",
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

            modalTask.style.display = "none";

            taskForm.reset();

            editingTaskId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalTask) {
            modalTask.style.display = "none";
        }
    });
}