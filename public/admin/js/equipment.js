let editingEquipmentId = null;
let selectedEqIds = new Set();

async function fetchEquipments() {

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
                body: JSON.stringify({ table: "catalog_equipments", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const equipments =
            await response.json();

        return equipments;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderEquipments(equipments, tableBody) {

    tableBody.innerHTML = equipments
        .map((equipment) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${equipment.id}"></td>
                    <td><img src="${equipment.link_photo || 'https://via.placeholder.com/50'}" alt="${equipment.name}" width="50" height="50"></td>
                    <td>${equipment.name}</td>
                    <td>${equipment.position}</td>
                    <td>${equipment.type}</td>
                    <td>ATK : ${equipment.atk || 0}, DEF : ${equipment.def || 0}, MAX_HP : ${equipment.max_hp || 0}</td>
                    <td>
                        <button class="table-btn edit edit-btn" data-id="${equipment.id}">Edit</button>
                        <button class="table-btn delete delete-btn" data-id="${equipment.id}">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillEquipmentForm(equipment) {

    document.getElementById("equipmentName").value =
        equipment.name;

    document.getElementById("equipmentPosition").value =
        equipment.position || "";
    document.getElementById("equipmentType").value =
        equipment.type || "";
    document.getElementById("equipmentATK").value =
        equipment.atk || 0;
    document.getElementById("equipmentDEF").value =
        equipment.def || 0;
    document.getElementById("equipmentMAX_HP").value =
        equipment.max_hp || 0;
}

function updateDeleteButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedEqBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedEqIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedEqIds.size})`;
}

async function initEquipmentsPage() {
    let equipments = [];

    const modalEquipment =
        document.getElementById("equipmentModal");

    const openBtnEquipment =
        document.getElementById("openEquipmentModal");

    const closeBtnEquipment =
        document.getElementById("closeEquipmentModal");

    const equipmentsTableBody =
        document.getElementById("equipmentsTableBody");

    const equipmentForm =
        document.getElementById("equipmentForm");

    const modalTitle =
        modalEquipment.querySelector("h2");

    const tableOverlayLoading =
        document.getElementById(
            "tableEqOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const equipmentsResponse =
            await fetchEquipments();

        equipments = Array.isArray(equipmentsResponse)
            ? equipmentsResponse
            : equipmentsResponse?.data || [];

        renderEquipments(
            equipments,
            equipmentsTableBody
        );
        
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

    let table = new DataTable('#equipmentsTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
            }
        ]
    });
    document.getElementById('selectAllTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedEqIds.add(id);
                } else {
                    selectedEqIds.delete(id);
                }
            }
        });

        updateDeleteButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedEqIds.add(id);
        } else {
            selectedEqIds.delete(id);
        }

        console.log(selectedEqIds);

        updateDeleteButton();
    });

    document.getElementById("deleteSelectedEqBtn").addEventListener("click", async () => {

        if (selectedEqIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedEqIds.size} equipment(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedEqIds);

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
                        table: "catalog_equipments",
                        ids: [...selectedEqIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedEqIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

    });
    // buka modal
    openBtnEquipment.addEventListener("click", () => {

        editingEquipmentId = null;

        modalTitle.textContent = "Add New Equipment";

        equipmentForm.reset();

        modalEquipment.style.display = "flex";
    });

    // tutup modal
    closeBtnEquipment.addEventListener("click", () => {
        modalEquipment.style.display = "none";
    });

    equipmentsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const equipmentId = editButton.dataset.id;

            const equipment = equipments.find(
                (item) => item.id === equipmentId
            );

            if (!equipment) {
                console.error(
                    "Equipment not found for ID:",
                    equipmentId
                );

                return;
            }

            editingEquipmentId = equipmentId;

            modalTitle.textContent =
                "Edit Equipment";

            fillEquipmentForm(equipment);

            modalEquipment.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this equipment?");

            if (!confirmed) {
                return;
            }

            const token =
                localStorage.getItem("access_token");

            const equipmentId = deleteButton.dataset.id;

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
                            table: "catalog_equipments",
                            id: equipmentId
                        }),
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                const equipmentsResponse =
                    await fetchEquipments();

                const updatedEquipments =
                    Array.isArray(equipmentsResponse)
                        ? equipmentsResponse
                        : equipmentsResponse?.data || [];

                renderEquipments(
                    updatedEquipments,
                    equipmentsTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    equipmentForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

        const formData = {
            name: document.getElementById("equipmentName").value,
            position: document.getElementById("equipmentPosition").value,
            type: document.getElementById("equipmentType").value,
            atk: parseFloat(
                document.getElementById("equipmentATK").value
            ) || 0,
            def: parseFloat(
                document.getElementById("equipmentDEF").value
            ) || 0,
            max_hp: parseFloat(
                document.getElementById("equipmentMAX_HP").value
            ) || 0 
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingEquipmentId !== null) {

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
                            table: "catalog_equipments",
                            id: editingEquipmentId,
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
                            table: "catalog_equipments",
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
            const equipmentsResponse =
                await fetchEquipments();

            equipments = Array.isArray(equipmentsResponse)
                ? equipmentsResponse
                : equipmentsResponse?.data || [];

            renderEquipments(
                equipments,
                equipmentsTableBody
            );

            modalEquipment.style.display = "none";

            equipmentForm.reset();

            editingEquipmentId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalEquipment) {
            modalEquipment.style.display = "none";
        }
    });
}