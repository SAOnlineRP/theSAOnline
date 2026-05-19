//console.log("partner");

/*const dummyPartners = [
    {
        id: 1,
        name: "Kirito",
        role: "Attacker",
        rarity: "5★",
    },
    {
        id: 2,
        name: "Asuna",
        role: "Support",
        rarity: "5★",
    },
];*/

async function fetchPartners() {

    try {

        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            "http://localhost:3000/api/catalog_partners",
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,
                },
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

function renderPartners(partners, tableBody) {

    tableBody.innerHTML = partners
        .map((partner) => {

            const skills = partner.catalog_partner_skills
                .map(item => item.catalog_skills.name);

            return `
                <tr>
                    <td>${partner.name}</td>
                    <td>${JSON.stringify(skills)}</td>
                    <td>
                        <button>Edit</button>
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
    
    // fetch data API
    const partners =
        await fetchPartners();
    
    console.log(partners['data']);

    renderPartners(partners['data'], partnersTableBody);

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