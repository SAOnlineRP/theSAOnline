async function fetchSkills() {

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
                body: JSON.stringify({ table: "catalog_skills", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const skills =
            await response.json();

        return skills;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderSkills(skills, tableBody) {

    tableBody.innerHTML = skills
        .map((skill) => {
            return `
                <tr>
                    <td>${skill.name}</td>
                    <td>${skill.mp_cost}</td>
                    <td>${JSON.stringify(skill.effects)}</td>
                    <td>
                        <button type="button"
                            class="table-btn edit edit-btn"
                            data-id="${skill.id}">
                            Edit
                        </button>
                        <button 
                            class="table-btn delete delete-btn"
                            data-id="${skill.id}"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function initSkillsPage() {
    const skillsTableBody =
        document.getElementById("skillsTableBody");

    const tableOverlayLoading =
        document.getElementById(
            "tableSkillOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const skillsResponse =
            await fetchSkills();

        skills = Array.isArray(skillsResponse)
            ? skillsResponse
            : skillsResponse?.data || [];

        renderSkills(
            skills,
            skillsTableBody
        );

    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }
}