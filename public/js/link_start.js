import { supabase } from "/js/supabaseClient.js";

const linkStartBtn = document.getElementById("linkStartBtn");
const startContainer = document.getElementById("startContainer");
const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const saoText = document.getElementById("saoText");
const loginStatus = document.getElementById("loginStatus");
const loginPanel = document.getElementById("loginPanel");
const saoOverlay = document.getElementById("saoOverlay");

function startGame() {
    startContainer.classList.add("hide-start");

    setTimeout(() => {
    loginModal.classList.add("show");
    usernameInput.focus();
    }, 250);
}

function closeLoginModal() {
    loginModal.classList.remove("show");
    startContainer.classList.remove("hide-start");
    resetLoginUI();
}

function resetLoginUI() {
    loginForm.reset();
    saoText.textContent = "SYSTEM READY";
    loginStatus.textContent = "";
    loginStatus.className = "login-status";
    loginPanel.classList.remove("sao-success", "shake");
    saoOverlay.classList.remove("active");
}

async function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  loginStatus.textContent = "";
  loginStatus.className = "login-status";
  loginPanel.classList.remove("shake");

  const email = `${username}@game.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    saoText.textContent = "ACCESS DENIED";
    loginStatus.textContent = "USERNAME / PASSWORD INVALID";
    loginStatus.classList.add("error");
    loginPanel.classList.add("shake");

    setTimeout(() => {
      loginPanel.classList.remove("shake");
    }, 450);

    return;
  }

  // Kalau sukses, Supabase otomatis simpan session di browser
  saoOverlay.classList.add("active");
  saoText.textContent = "LINK START";

  await wait(700);
  saoText.textContent = "AUTHENTICATING";

  await wait(900);
  saoText.textContent = "ACCESS GRANTED";
  loginStatus.textContent = "LOGIN SUCCESS";
  loginStatus.classList.add("success");
  loginPanel.classList.add("sao-success");

  await wait(800);
  saoText.textContent = "WELCOME, PLAYER";

  await wait(900);
  document.body.style.transition = "opacity 0.8s ease";
  document.body.style.opacity = "0";

  setTimeout(() => {
    window.location.href = "menu.html";
  }, 800);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

linkStartBtn.addEventListener("click", startGame);
closeModalBtn.addEventListener("click", closeLoginModal);
loginForm.addEventListener("submit", handleLogin);

loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
    closeLoginModal();
    }
});