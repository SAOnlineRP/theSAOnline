//console.log("partner");

const dummySkill = [
    {
        id: 1,
        name: "Dual Blades",
        mpCost: 50,
        effects: "Deals double damage with dual-wielded weapons"
    },
    {
        id: 2,
        name: "Asuna",
        mpCost: 75,
        effects: "Heals all party members"
    },
];

function renderSkills(skills, tableBody) {

    tableBody.innerHTML = skills
        .map((skill) => {
            return `
                <tr>
                    <td>${skill.name}</td>
                    <td>${skill.mpCost}</td>
                    <td>${skill.effects}</td>
                    <td>
                        <button>Edit</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function initSkillsPage() {
    const skillsTableBody =
        document.getElementById("skillsTableBody");

    renderSkills(dummySkill, skillsTableBody);

}