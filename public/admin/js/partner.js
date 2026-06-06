let editingPartnerId = null;
let selectedPartnerIds = new Set();

async function fetchPartners() {

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
                body: JSON.stringify({ table: "catalog_partners", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const partners =
            await response.json();

        return partners;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderListPartners(partners, tableBody) {

    tableBody.innerHTML = partners
        .map((partner) => {

            const skills = partner.catalog_partner_skills
                .map(item => item.catalog_skills.name);

            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${partner.id}"></td>
                    <td><img src="${partner.link_ava || 'https://via.placeholder.com/50'}" alt="${partner.name}" width="50" height="50"></td>
                    <td>${partner.name}</td>
                    <td>ATK : ${partner.atk || 0}, DEF : ${partner.def || 0}, MAX_HP : ${partner.max_hp || 0}, MAX_MP : ${partner.max_mp || 0}</td>
                    <td>${JSON.stringify(skills)}</td>
                    <td>
                        <button type="button"
                            class="table-btn edit edit-btn"
                            data-id="${partner.id}">
                            Edit
                        </button>
                        <button 
                            class="table-btn delete delete-btn"
                            data-id="${partner.id}"
                        >
                            Delete
                        </button>
                    </td>
                    
                </tr>
            `;
        })
        .join("");
}

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

    const tableOverlayLoading =
        document.getElementById(
            "tablePartnerOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }
    
    try {

        setTableLoading(true);
        // fetch data API
        const partnersResponse =
            await fetchPartners();
        
        partners = Array.isArray(partnersResponse)
            ? partnersResponse
            : partnersResponse?.data || [];

        renderListPartners(
            partners,
            partnersTableBody
        );
        
    } catch (error) {

        console.error(error);
    } finally {

        setTableLoading(false);
        
    }

    let table = new DataTable('#partnersTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
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
                        table: "catalog_partners",
                        ids: [...selectedPartnerIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedPartnerIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

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
             const partner = partners.find(
                (item) => item.id === editingPartnerId
            );

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

            const token =
                localStorage.getItem("access_token");

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

                const partnersResponse =
                    await fetchPartners();

                const updatedPartners =
                    Array.isArray(partnersResponse)
                        ? partnersResponse
                        : partnersResponse?.data || [];

                renderListPartners(
                    updatedPartners,
                    partnersTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    

    partnerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

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
            const partnersResponse =
                await fetchPartners();

            partners = Array.isArray(partnersResponse)
                ? partnersResponse
                : partnersResponse?.data || [];

            renderListPartners(
                partners,
                partnersTableBody
            );

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