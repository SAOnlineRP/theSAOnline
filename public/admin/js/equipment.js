async function fetchEquipments() {

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
                    <td>${equipment.name}</td>
                    <td>${equipment.position}</td>
                    <td>${equipment.type}</td>
                    <td>ATK : ${equipment.atk || 0}, DEF : ${equipment.def || 0}, MAX_HP : ${equipment.max_hp || 0}</td>
                    <td>
                        <button class="table-btn edit">Edit</button>
                        <button class="table-btn delete">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function initEquipmentsPage() {
    const equipmentsTableBody =
        document.getElementById("equipmentsTableBody");

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

}