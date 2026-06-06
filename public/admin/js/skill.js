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

function fillSkillForm(skill) {

    document.getElementById("skillName").value = skill.name || "";
    document.getElementById("mpCost").value = skill.mp_cost || 0;
    document.getElementById("effects").value = JSON.stringify(skill.effects || []);
}

async function initSkillsPage() {
    let skills = [];

    const modalSkill =
        document.getElementById("skillModal");

    const openBtnSkill =
        document.getElementById("openSkillModal");

    const closeBtnSkill =
        document.getElementById("closeSkillModal");

    const skillsTableBody =
        document.getElementById("skillsTableBody");

    const skillForm =
        document.getElementById("skillForm");

    const modalTitle =
        modalSkill.querySelector("h2");

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

    // buka modal
    openBtnSkill.addEventListener("click", () => {
        editingSkillId = null;

        modalTitle.textContent = "Add New Skill";

        skillForm.reset();

        modalSkill.style.display = "flex";
    });

    // tutup modal
    closeBtnSkill.addEventListener("click", () => {
        modalSkill.style.display = "none";
    });

    skillsTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton = e.target.closest(".edit-btn");

        if (editButton) {
            editingSkillId = editButton.dataset.id;
             const skill = skills.find(
                (item) => item.id === editingSkillId
            );

            if (!skill) {
                console.error(
                    "Skill not found for ID:",
                    editingSkillId
                );

                return;
            }

            modalTitle.textContent = "Edit Skill";
            fillSkillForm(skill);
            modalSkill.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton = e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this skill?");

            if (!confirmed) {
                return;
            }

            const token =
                localStorage.getItem("access_token");

            const skillId = deleteButton.dataset.id;

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
                            table: "catalog_skills",
                            id: skillId
                        }),
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                const skillsResponse =
                    await fetchSkills();

                const updatedSkills =
                    Array.isArray(skillsResponse)
                        ? skillsResponse
                        : skillsResponse?.data || [];

                renderSkills(
                    updatedSkills,
                    skillsTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    skillForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

        const formData = {
            name: document.getElementById("skillName").value,
            mp_cost: parseInt(document.getElementById("mpCost").value) || 0,
            effects: JSON.parse(document.getElementById("effects").value || "[]")
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingSkillId !== null) {

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
                            table: "catalog_skills",
                            id: editingSkillId,
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
                            table: "catalog_skills",
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
            const skillsResponse =
                await fetchSkills();

            skills = Array.isArray(skillsResponse)
                ? skillsResponse
                : skillsResponse?.data || [];

            renderSkills(
                skills,
                skillsTableBody
            );

            modalSkill.style.display = "none";

            skillForm.reset();

            editingSkillId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalSkill) {
            modalSkill.style.display = "none";
        }
    });

}