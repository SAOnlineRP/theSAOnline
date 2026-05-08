console.log("masuk js")
const mainContent =
  document.getElementById("mainContent");

const menuItems =
  document.querySelectorAll(".menu-item");

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
  item.addEventListener("click", () => {

    // ambil nama page dari data-page
    const page = item.dataset.page;

    // load page
    loadPage(page);

  });
});

// ======================
// DEFAULT PAGE
// ======================

loadPage("overview");