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
                        <button class="table-btn edit">Edit</button>
                        <button class="table-btn delete">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function initItemsPage() {
    const itemsTableBody =
        document.getElementById("itemsTableBody");

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

    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

}