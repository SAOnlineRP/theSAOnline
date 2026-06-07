let editingPartnerId = null;
let selectedPartnerIds = new Set();

function fillPartnerForm(partner) {

    document.getElementById("partnerName").value = partner.name || "";
    document.getElementById("statAtk").value = partner.atk || 0;
    document.getElementById("statDef").value = partner.def || 0;
    document.getElementById("statMaxHP").value = partner.max_hp || 0;
    document.getElementById("statMaxMP").value = partner.max_mp || 0;
    document.getElementById("statShard").value = partner.reward_shard || 0;
}

function updateDeletePartnersButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedPartnersBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedPartnerIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedPartnerIds.size})`;
}


async function initPartnersPage() {
    let partners = [];

    const modalPartner =
        document.getElementById("partnerModal");

    const openBtnPartner =
        document.getElementById("openPartnerModal");

    const closeBtnPartner =
        document.getElementById("closePartnerModal");

    const partnersTableBody =
        document.getElementById("partnersTableBody");

    const partnerForm =
        document.getElementById("partnerForm");

    const modalTitle =
        modalPartner.querySelector("h2");

    const token =
    localStorage.getItem("access_token");

    let table = new DataTable('#partnersTable', {
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
                    table: "catalog_partners"
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
                        src="${row.link_ava || 'https://via.placeholder.com/50'}"
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
                data: null,
                render: (data, type, row) =>
                    `ATK : ${row.atk || 0},
                    DEF : ${row.def || 0},
                    MAX_HP : ${row.max_hp || 0},
                    MAX_MP : ${row.max_mp || 0}`
            },

            {
                data: null,
                render: (data, type, row) => {

                    const skills =
                        row.catalog_partner_skills
                            ?.map(skill =>
                                skill.catalog_skills.name
                            ) || [];

                    return JSON.stringify(skills);
                }
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

    document.getElementById('selectAllPartnerTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedPartnerIds.add(id);
                } else {
                    selectedPartnerIds.delete(id);
                }
            }
        });

        updateDeletePartnersButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedPartnerIds.add(id);
        } else {
            selectedPartnerIds.delete(id);
        }

        console.log(selectedPartnerIds);

        updateDeletePartnersButton();
    });

    document.getElementById("deleteSelectedPartnersBtn").addEventListener("click", async () => {

        if (selectedPartnerIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedPartnerIds.size} partner(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedPartnerIds);

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
                        table: "catalog_partners",
                        ids: [...selectedPartnerIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            selectedPartnerIds.clear();

            table.ajax.reload(null, false);

        } catch (error) {

            console.error(error);

            alert(error.message);
        }

    });

    // buka modal
    openBtnPartner.addEventListener("click", () => {
        editingPartnerId = null;

        modalTitle.textContent = "Add New Partner";

        partnerForm.reset();

        modalPartner.style.display = "flex";
    });

    // tutup modal
    closeBtnPartner.addEventListener("click", () => {
        modalPartner.style.display = "none";
    });

    partnersTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton = e.target.closest(".edit-btn");

        if (editButton) {
            editingPartnerId = editButton.dataset.id;
            const row = editButton.closest("tr");

            const partner =
                table.row(row).data();

            if (!partner) {
                console.error(
                    "Partner not found for ID:",
                    editingPartnerId
                );

                return;
            }

            modalTitle.textContent = "Edit Partner";
            fillPartnerForm(partner);
            modalPartner.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton = e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this partner?");

            if (!confirmed) {
                return;
            }

            const partnerId = deleteButton.dataset.id;

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
                            table: "catalog_partners",
                            id: partnerId
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

    

    partnerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const formData = {
            name: document.getElementById("partnerName").value,
            atk: parseInt(document.getElementById("partnerAtk").value) || 0,
            def: parseInt(document.getElementById("partnerDef").value) || 0,
            max_hp: parseInt(document.getElementById("partnerMaxHp").value) || 0,
            max_mp: parseInt(document.getElementById("partnerMaxMp").value) || 0,
            reward_shard: parseInt(document.getElementById("partnerShard").value) || 0,
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingPartnerId !== null) {

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
                            table: "catalog_partners",
                            id: editingPartnerId,
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
                            table: "catalog_partners",
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

            modalPartner.style.display = "none";

            partnerForm.reset();

            editingPartnerId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalPartner) {
            modalPartner.style.display = "none";
        }
    });
}