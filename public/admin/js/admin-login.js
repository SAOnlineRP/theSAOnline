const adminLoginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

adminLoginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    loginMessage.textContent = "Username dan password wajib diisi.";
    return;
  }

  // Dummy login sementara
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("isAdminLoggedIn", "true");
    localStorage.setItem("adminUsername", username);

    loginMessage.style.color = "#86efac";
    loginMessage.textContent = "Login berhasil...";

    setTimeout(() => {
      window.location.href = "/admin/admin-dashboard.html";
    }, 700);
  } else {
    loginMessage.style.color = "#fca5a5";
    loginMessage.textContent = "Username atau password salah.";
  }
});