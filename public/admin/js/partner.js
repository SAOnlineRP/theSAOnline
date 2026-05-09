const modal =
    document.getElementById("myModal");

const openBtn =
    document.getElementById("openModal");

const closeBtn =
    document.getElementById("closeModal");

// buka modal
openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// tutup modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// klik area luar modal
window.addEventListener("click", (e) => {

    if (e.target === modal) {
    modal.style.display = "none";
    }

});