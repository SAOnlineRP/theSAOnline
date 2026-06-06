let editingItemId = null;

async function fetchItems() {

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
                body: JSON.stringify({ table: "catalog_items", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const items =
            await response.json();

        return items;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderItems(items, tableBody) {

    tableBody.innerHTML = items
        .map((item) => {
            return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.desc}</td>
                    <td>
                        <button type="button"
                            class="table-btn edit edit-btn"
                            data-id="${item.id}">
                            Edit
                        </button>
                        <button 
                            class="table-btn delete delete-btn"
                            data-id="${item.id}"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillItemForm(item) {

    document.getElementById("itemName").value =
        item.name;

    document.getElementById("itemDescription").value =
        item.desc || "";
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

    const tableOverlayLoading =
        document.getElementById(
            "tableItemsOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const itemsResponse =
            await fetchItems();

        items = Array.isArray(itemsResponse)
            ? itemsResponse
            : itemsResponse?.data || [];

        renderItems(
            items,
            itemsTableBody
        );
        let table = new DataTable('#itemsTable');
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

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

            const item = items.find(
                (i) => i.id === itemId
            );

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

            const token =
                localStorage.getItem("access_token");

            const itemId = deleteButton.dataset.id;

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

                const itemsResponse =
                    await fetchItems();

                const updatedItems =
                    Array.isArray(itemsResponse)
                        ? itemsResponse
                        : itemsResponse?.data || [];

                renderItems(
                    updatedItems,
                    itemsTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    itemForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

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
                    "http://localhost:3000/api/admin",
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
                    "http://localhost:3000/api/admin",
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
            const itemsResponse =
                await fetchItems();

            items = Array.isArray(itemsResponse)
                ? itemsResponse
                : itemsResponse?.data || [];

            renderItems(
                items,
                itemsTableBody
            );

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