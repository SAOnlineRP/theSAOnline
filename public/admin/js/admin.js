console.log("masuk js")
const mainContent =
  document.getElementById("mainContent");

const menuItems =
  document.querySelectorAll(".menu-click");

// ======================
// LOAD PAGE
// ======================

async function loadPage(page) {

  const response =
    await fetch(`pages/${page}.html`);

  const html =
    await response.text();

  mainContent.innerHTML = html;

  document.getElementById(page).classList.add('active');
}

// ======================
// MENU CLICK
// ======================

menuItems.forEach((item) => {

  item.addEventListener("click", async () => {

    const page = item.dataset.page;

    await loadPage(page);

    if (page === "partners") {
      initPartnersPage();
    }

  });

});

// =====================
// 

const expandButtons = document.querySelectorAll('.expand-btn');

expandButtons.forEach(btn => {
  btn.addEventListener('click', () => {

    const submenu = btn.nextElementSibling;

    submenu.style.display =
      submenu.style.display === 'flex'
        ? 'none'
        : 'flex';

  });
});

// ======================
// DEFAULT PAGE
// ======================

loadPage("overview");