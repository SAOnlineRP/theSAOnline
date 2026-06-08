let editingMerchantId = null;
let selectedMerchantIds = new Set();

function fillMerchantForm(merchant) {
    document.getElementById("rewardType").value =
        merchant.reward_type || "";
    document.getElementById("rewardName").value =
        merchant.reward_name || "";
    document.getElementById("quantity").value =
        merchant.quantity || 0;
    document.getElementById("price").value =
        merchant.price || 0;
    
}

function updateDeleteMerchantButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedMerchantBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedMerchantIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedMerchantIds.size})`;
}

async function initMerchantPage() {
    let merchantItems = [];

    const modalMerchant =
        document.getElementById("merchantModal");

    const openBtnMerchant =
        document.getElementById("openMerchantModal");

    const closeBtnMerchant =
        document.getElementById("closeMerchantModal");

    const merchantTableBody =
        document.getElementById("merchantTableBody");

    const merchantForm =
        document.getElementById("merchantForm");

    const modalTitle =
        modalMerchant.querySelector("h2");


    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#merchantsTable', {
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
                    table: "merchant_items"
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
                data: 'goods_type'
            },
            {
                data: 'goods_name'
            },
            {
                data: 'quantity'
            },
            {
                data: 'price'
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
    document.getElementById('selectAllItems').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedMerchantIds.add(id);
                } else {
                    selectedMerchantIds.delete(id);
                }
            }
        });

        updateDeleteMerchantButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedMerchantIds.add(id);
        } else {
            selectedMerchantIds.delete(id);
        }

        console.log(selectedMerchantIds);

        updateDeleteMerchantButton();
    });

    document.getElementById("deleteSelectedMerchantBtn").addEventListener("click", async () => {

        if (selectedMerchantIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedMerchantIds.size} pool(s)?`
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
                        action: "deleteBulk",
                        table: "merchant_items",
                        ids: [...selectedMerchantIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedMerchantIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        };

    });
    async function loadGoods() {

        const goodsType =
            document.getElementById("goodsType").value;

        const goodsSelect =
            document.getElementById("goodsName");

        goodsSelect.innerHTML = "";

        let table;

        if (goodsType === "item") {
            table = "catalog_items";
        } else if (goodsType === "equipment") {
            table = "catalog_equipments";
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

        const goods = await response.json();
        let data = goods.data;

        data.forEach(good => {

            const option =
                document.createElement("option");

            option.value = good.id;
            option.textContent = good.name;

            goodsSelect.appendChild(option);
        });
    }

    const goodsType =
        document.getElementById("goodsType");

    goodsType.addEventListener("change", loadGoods);
    // buka modal
    openBtnMerchant.addEventListener("click", () => {

        editingMerchantId = null;

        modalTitle.textContent = "Add New Item";

        merchantForm.reset();

        modalMerchant.style.display = "flex";
    });

    // tutup modal
    closeBtnMerchant.addEventListener("click", () => {
        modalMerchant.style.display = "none";
    });

    merchantTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const merchantId = editButton.dataset.id;

            const row = editButton.closest("tr");

            const merchantItem =
                table.row(row).data();

            if (!merchantItem) {
                console.error(
                    "Item Merchant not found for ID:",
                    merchantId
                );

                return;
            }

            editingMerchantId = merchantId;

            modalTitle.textContent =
                "Edit Item";

            fillMerchantForm(merchantItem);

            modalMerchant.style.display = "flex";
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

            const merchantId = deleteButton.dataset.id;

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
                            table: "merchant_item",
                            id: merchantId
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

    merchantForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            goods_type: document.getElementById("goodsType").value,
            goods_id: document.getElementById("goodsName").value,
            quantity: parseFloat(
                document.getElementById("quantity").value
            ) || 0,
            price: parseFloat(
                document.getElementById("probability").value
            ) || 0,
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingMerchantId !== null) {

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
                            table: "merchant_items",
                            id: editingMerchantId,
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
                            table: "merchant_items",
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

            modalMerchant.style.display = "none";

            merchantForm.reset();

            editingMerchantId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalMerchant) {
            modalMerchant.style.display = "none";
        }
    });
}