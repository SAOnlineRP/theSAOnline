let editingBadgeId = null;
let selectedBadgeIds = new Set();

async function fetchBadges() {

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
                body: JSON.stringify({ table: "catalog_badges", action: "getAll" })
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const badges =
            await response.json();

        return badges;

    } catch (error) {

        console.error(error);

        return [];
    }
}

function renderBadges(badges, tableBody) {

    tableBody.innerHTML = badges
        .map((badge) => {
            return `
                <tr>
                    <td><input type="checkbox" class="task-checkbox selectTaskCheckbox" data-id="${badge.id}"></td>
                    <td><img src="${badge.link_photo || 'https://via.placeholder.com/50'}" alt="${badge.name}" width="50" height="50"></td>
                    <td>${badge.name}</td>
                    <td>${badge.description}</td>
                    <td>
                        <button class="table-btn edit edit-btn" data-id="${badge.id}">Edit</button>
                        <button class="table-btn delete delete-btn" data-id="${badge.id}">Delete</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function fillBadgeForm(badge) {

    document.getElementById("badgeName").value =
        badge.name;

    document.getElementById("badgeDescription").value =
        badge.description || "";
}

function updateDeleteBadgeButton() {

    const deleteBtn =
        document.getElementById("deleteSelectedBadgesBtn");

    deleteBtn.classList.toggle(
        "hidden",
        selectedBadgeIds.size === 0
    );

    deleteBtn.textContent =
        `Delete Selected (${selectedBadgeIds.size})`;
}

async function initBadgesPage() {
    let badges = [];

    const modalBadge =
        document.getElementById("badgeModal");

    const openBtnBadge =
        document.getElementById("openBadgeModal");

    const closeBtnBadge =
        document.getElementById("closeBadgeModal");

    const badgesTableBody =
        document.getElementById("badgesTableBody");

    const badgeForm =
        document.getElementById("badgeForm");

    const modalTitle =
        modalBadge.querySelector("h2");

    const tableOverlayLoading =
        document.getElementById(
            "tableBadgeOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableOverlayLoading.classList.toggle(
            "hidden",
            !isLoading
        );
    }

    try {

        setTableLoading(true);

        const badgesResponse =
            await fetchBadges();

        badges = Array.isArray(badgesResponse)
            ? badgesResponse
            : badgesResponse?.data || [];

        renderBadges(
            badges,
            badgesTableBody
        );
        
    } catch (error) {

        console.error(error);

    } finally {

        setTableLoading(false);
    }

    let table = new DataTable('#badgesTable', {
        columnDefs: [
            {
                orderable: false,
                targets: 0
            }
        ]
    });
    document.getElementById('selectAllBadgeTasks').addEventListener('change', function () {

        const checked = this.checked;

        table.rows().every(function () {
            const node = this.node();

            const checkbox = node.querySelector('.task-checkbox');

            if (checkbox) {

                checkbox.checked = checked;

                const id = checkbox.dataset.id;

                if (checked) {
                    selectedBadgeIds.add(id);
                } else {
                    selectedBadgeIds.delete(id);
                }
            }
        });

        updateDeleteBadgeButton();   
    });

    document.addEventListener('change', (e) => {

        if (!e.target.classList.contains('task-checkbox')) {
            return;
        }

        console.log("checkbox changed");

        const id = e.target.dataset.id;

        if (e.target.checked) {
            selectedBadgeIds.add(id);
        } else {
            selectedBadgeIds.delete(id);
        }

        console.log(selectedBadgeIds);

        updateDeleteBadgeButton();
    });

    document.getElementById("deleteSelectedBadgesBtn").addEventListener("click", async () => {

        if (selectedBadgeIds.size === 0) {
            return;
        }

        const confirmed = confirm(
            `Delete ${selectedBadgeIds.size} badge(s)?`
        );

        if (!confirmed) {
            return;
        }
        console.log("Deleting IDs:", selectedBadgeIds);

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
                        table: "catalog_badges",
                        ids: [...selectedBadgeIds]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            alert("Deleted successfully");

            selectedBadgeIds.clear();

            location.reload();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }*/

    });
    // buka modal
    openBtnBadge.addEventListener("click", () => {

        editingBadgeId = null;

        modalTitle.textContent = "Add New Badge";

        badgeForm.reset();

        modalBadge.style.display = "flex";
    });

    // tutup modal
    closeBtnBadge.addEventListener("click", () => {
        modalBadge.style.display = "none";
    });

    badgesTableBody.addEventListener("click", async (e) => {

        // =====================
        // EDIT
        // =====================
        const editButton =
            e.target.closest(".edit-btn");

        if (editButton) {

            const badgeId = editButton.dataset.id;

            const badge = badges.find(
                (item) => item.id === badgeId
            );

            if (!badge) {
                console.error(
                    "Badge not found for ID:",
                    badgeId
                );

                return;
            }

            editingBadgeId = badgeId;

            modalTitle.textContent =
                "Edit Badge";

            fillBadgeForm(badge);

            modalBadge.style.display = "flex";
        }

        // =====================
        // DELETE
        // =====================
        const deleteButton =
            e.target.closest(".delete-btn");

        if (deleteButton) {

            const confirmed =
                confirm("Delete this badge?");

            if (!confirmed) {
                return;
            }

            const token =
                localStorage.getItem("access_token");

            const badgeId = deleteButton.dataset.id;

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
                            table: "catalog_badges",
                            id: badgeId
                        }),
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                const badgesResponse =
                    await fetchBadges();

                const updatedBadges =
                    Array.isArray(badgesResponse)
                        ? badgesResponse
                        : badgesResponse?.data || [];

                renderBadges(
                    updatedBadges,
                    badgesTableBody
                );

            } catch (error) {

                console.error(error);

                alert(error.message);
            }
        }
    });

    badgeForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        setSaveLoading(true);

        const token =
            localStorage.getItem("access_token");

        const formData = {
            name: document.getElementById("badgeName").value,
            position: document.getElementById("badgeDescription").value
        };

        try {

            // =====================
            // EDIT
            // =====================
            if (editingBadgeId !== null) {

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
                            table: "catalog_badges",
                            id: editingBadgeId,
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
                            table: "catalog_badges",
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
            const badgesResponse =
                await fetchBadges();

            badges = Array.isArray(badgesResponse)
                ? badgesResponse
                : badgesResponse?.data || [];

            renderBadges(
                badges,
                badgesTableBody
            );

            modalBadge.style.display = "none";

            badgeForm.reset();

            editingBadgeId = null;

        } catch (error) {

            console.error(error);

            alert(error.message);
        } finally {

            setSaveLoading(false);
        }
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modalBadge) {
            modalBadge.style.display = "none";
        }
    });
}