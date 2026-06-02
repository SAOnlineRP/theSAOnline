async function fetchPartners() {

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
                    <td>${partner.name}</td>
                    <td>ATK : ${partner.atk || 0}, DEF : ${partner.def || 0}, MAX_HP : ${partner.max_hp || 0}, MAX_MP : ${partner.max_mp || 0}, CRIT_DMG : ${partner.crit_dmg || 0}, CRIT_RATE : ${partner.crit_pct || 0}%</td>
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

async function initPartnersPage() {

    const modal =
        document.getElementById("myModal");

    const openBtn =
        document.getElementById("openModal");

    const closeBtn =
        document.getElementById("closeModal");

    const partnersTableBody =
        document.getElementById("partnersTableBody");

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
        const partners =
            await fetchPartners();
        
        console.log(partners['data']);

        renderListPartners(partners['data'], partnersTableBody);
    } catch (error) {

        console.error(error);
    } finally {

        setTableLoading(false);
    }

    // buka modal
    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // tutup modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // klik luar modal
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}