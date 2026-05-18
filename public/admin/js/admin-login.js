import { supabase } from "/js/supabaseClient.js";

const loginForm = document.getElementById("adminLoginForm");
loginForm.addEventListener("submit", handleLogin);
const loginMessage = document.getElementById("loginMessage");

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    loginMessage.textContent = "Username dan password wajib diisi.";
    return;
  }

  const email = `${username}@game.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginMessage.style.color = "#fca5a5";
    loginMessage.textContent = "Username atau password salah.";
    return;
  }

  localStorage.setItem("isAdminLoggedIn", "true");
  localStorage.setItem("adminUsername", username);

  // simpan access token juga
  localStorage.setItem(
    "access_token",
    data.session.access_token
  );

  loginMessage.style.color = "#86efac";
  loginMessage.textContent = "Login berhasil...";

  setTimeout(() => {
    window.location.href = "/admin/admin-dashboard.html";
  }, 700);
};