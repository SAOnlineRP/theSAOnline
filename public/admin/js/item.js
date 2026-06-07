let editingItemId = null;
let selectedItemIds = new Set();

function fillItemForm(item) {

    document.getElementById("itemName").value =
        item.name;

    document.getElementById("itemDescription").value =
        item.desc || "";
}

function updateDeleteItemsButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedItemsBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedItemIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedItemIds.size})`;
}

async function initItemsPage() {
    let items = [];

    const modalItem =
        document.getElementById("itemModal");

    const openBtnItem =
        document.getElementById("openItemModal");

    const closeBtnItem =
        document.getElementById("closeItemModal");

    const itemsTableBody =
        document.getElementById("itemsTableBody");

    const itemForm =
        document.getElementById("itemForm");

    const modalTitle =
        modalItem.querySelector("h2");


    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#itemsTable', {
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
                    table: "catalog_items"
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
                data: null,
                orderable: false,
                render: (data, type, row) => `
                    <img
                        src="${row.link_photo || 'https://via.placeholder.com/50'}"
                        alt="${row.name}"
                        width="50"
                        height="50"
                    >
                `
            },

            {
                data: 'name'
            },

            {
                data: 'desc'
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
    document.getElementById('selectAllItemTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedItemIds.add(id);
                } else {
                    selectedItemIds.delete(id);
                }
            }
        });

        updateDeleteItemsButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedItemIds.add(id);
        } else {
            selectedItemIds.delete(id);
        }

        console.log(selectedItemIds);

        updateDeleteItemsButton();
    });

    document.getElementById("deleteSelectedItemsBtn").addEventListener("click", async () => {

        if (selectedItemIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedItemIds.size} item(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedItemIds);

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
                        table: "catalog_items",
                        ids: [...selectedItemIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedItemIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });

    // buka modal
    openBtnItem.addEventListener("click", () => {

        editingItemId = null;

        modalTitle.textContent = "Add New Item";

        itemForm.reset();

        modalItem.style.display = "flex";
    });

    // tutup modal
    closeBtnItem.addEventListener("click", () => {
        modalItem.style.display = "none";
    });

    itemsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const itemId = editButton.dataset.id;

            const row =
                editButton.closest("tr");

            const item =
                table.row(row).data();

            if (!item) {
                console.error(
                    "Item not found for ID:",
                    itemId
                );

                return;
            }

            editingItemId = itemId;

            modalTitle.textContent =
                "Edit Item";

            fillItemForm(item);

            modalItem.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this item?");

            if (!confirmed) {
                return;
            }

            const itemId = deleteButton.dataset.id;

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
                            table: "catalog_items",
                            id: itemId
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

    itemForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            name: document.getElementById("itemName").value,
            description: document.getElementById("itemDescription").value
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingItemId !== null) {

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
                            table: "catalog_items",
                            id: editingItemId,
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
                            table: "catalog_items",
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

            modalItem.style.display = "none";

            itemForm.reset();

            editingItemId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalItem) {
            modalItem.style.display = "none";
        }
    });
}