const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
const logoutBtn = document.getElementById("logoutBtn");
const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("pageTitle");

if (isAdminLoggedIn !== "true") {
  window.location.href = "/admin-login.html";
}

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.section;

    menuItems.forEach((btn) => btn.classList.remove("active"));
    item.classList.add("active");

    sections.forEach((section) => {
      section.classList.remove("active");
    });

    const activeSection = document.getElementById(target);
    if (activeSection) {
      activeSection.classList.add("active");
      pageTitle.textContent = item.textContent;
    }
  });
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.removeItem("adminUsername");
  window.location.href = "/admin-login.html";
});