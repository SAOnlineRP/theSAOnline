let editingTaskId = null;
let selectedTaskIds = new Set();

async function fetchTasks() {

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
                body: JSON.stringify({ table: "catalog_tasks", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const tasks =
            await response.json();

        return tasks;

    } catch (error) {

        console.error(error);

        return [];
    }
}

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

    const tableOverlayLoading =
        document.getElementById(
            "tableTaskOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const tasksResponse =
            await fetchTasks();

        tasks = Array.isArray(tasksResponse)
            ? tasksResponse
            : tasksResponse?.data || [];

        renderTasks(
            tasks,
            tasksTableBody
        );
        
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

    let table = new DataTable('#tasksTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
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
                        table: "catalog_tasks",
                        ids: [...selectedTaskIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedTaskIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

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

            const task = tasks.find(
                (item) => item.id === taskId
            );

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

            const token =
                localStorage.getItem("access_token");

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

                const tasksResponse =
                    await fetchTasks();

                const updatedTasks =
                    Array.isArray(tasksResponse)
                        ? tasksResponse
                        : tasksResponse?.data || [];

                renderTasks(
                    updatedTasks,
                    tasksTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    taskForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

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
            const tasksResponse =
                await fetchTasks();

            tasks = Array.isArray(tasksResponse)
                ? tasksResponse
                : tasksResponse?.data || [];

            renderTasks(
                tasks,
                tasksTableBody
            );

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