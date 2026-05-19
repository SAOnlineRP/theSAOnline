//console.log("partner");

const dummyEquipments = [
    {
        id: 1,
        name: "Elucidator",
        position: "Weapon",
        type: "5★",
        stats: ["ATK: 100", "DEF: 50"]
    },
    {
        id: 2,
        name: "Healing Potion",
        position: "Consumable",
        type: "2★",
        stats: ["HP: 50"]
    }
];

function renderEquipments(equipments, tableBody) {

    tableBody.innerHTML = equipments
        .map((equipment) => {
            return `
                <tr>
                    <td>${equipment.name}</td>
                    <td>${equipment.position}</td>
                    <td>${equipment.type}</td>
                    <td>
                        <ul>
                            ${equipment.stats.map(stat => `<li>${stat}</li>`).join("")}
                        </ul>
                    </td>
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

    renderEquipments(dummyEquipments, equipmentsTableBody);

}