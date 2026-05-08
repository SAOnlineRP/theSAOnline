const mainContent =
  document.getElementById("mainContent");

const menuItems =
  document.querySelectorAll(".menu-item");

// ======================
// LOAD PAGE
// ======================

async function loadPage(page) {

  const response =
    await fetch(`/pages/${page}.html`);

  const html =
    await response.text();

  mainContent.innerHTML = html;
}

// ======================
// MENU CLICK
// ======================

menuItems.forEach((item) => {

  item.addEventListener("click", () => {

    // active state
    menuItems.forEach(btn =>
      btn.classList.remove("active")
    );

    item.classList.add("active");

    // load page
    const page =
      item.dataset.page;

    loadPage(page);
  });

});

// ======================
// DEFAULT PAGE
// ======================

loadPage("overview");