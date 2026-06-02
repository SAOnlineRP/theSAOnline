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
    item.parentElement.querySelectorAll(".menu-item").forEach((sibling) => {
      sibling.classList.remove("active");
    });
    item.parentElement.querySelectorAll(".submenu-item").forEach((sibling) => {
      sibling.classList.remove("active");
    });
    
    const page = item.dataset.page;

    await loadPage(page);

    if (page === "partners") {
      item.parentElement.querySelector(".menu-click").classList.add('active');
      
      initPartnersPage();
    } else if (page === "skills") {
      initSkillsPage();
    } else if (page === "soul_traits") {
      item.parentElement.querySelector(".menu-click").classList.add('active');
      initSoulTraitsPage();
    } else if (page === "equipments") {
      initEquipmentsPage();
    } else if (page === "items") {
      initItemsPage();
    } else if (page === "users") {
      item.classList.add('active');
      initUserPage();
    } else if (page === "share") {
      item.classList.add('active');
      initSharePage();
    } else if (page === "summon_pools") {
      item.classList.add('active');
    } else if (page === "marketplace") {
      item.classList.add('active');
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
// LOGOUT
// ======================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("access_token");
  window.location.href = "admin-login.html";
});

// ======================
// CHECK LOGIN
// ======================

function checkLogin() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "admin-login.html";
    return false;
  }

  return true;
}

// ======================
// DEFAULT PAGE
// ======================

if (checkLogin()) {
  loadPage("overview");
}