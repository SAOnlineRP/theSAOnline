let selectedRecipients = [];

let allRecipients = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Heidi",
    "Ivan",
    "Judy",
    "Karl",
    "Leo",
    "Mallory",
    "Nina",
    "Oscar",
    "Peggy",
    "Quentin",
    "Rupert",
    "Sybil",
    "Trent",
    "Uma",
    "Victor",
    "Walter",
    "Xavier",
    "Yvonne",
    "Zara"
];

function initSharePage() {
    document.getElementById('user-list').innerHTML = '';

    allRecipients.forEach(recipient => {
        const label = document.createElement('label');
        label.classList.add('user-item');
        label.innerHTML = `
            <input type="checkbox" class="recipient" value="${recipient}">
            ${recipient}
        `;
        document.getElementById('user-list').appendChild(label);
    });
    const clearBtn =
    document.getElementById('clearSearch');

    document.getElementById('searchInput').addEventListener('input', function() {

        const keyword =
            this.value.toLowerCase().trim();

        document.querySelectorAll('.user-item').forEach(item => {

            const text =
                item.textContent.toLowerCase();

            item.style.display =
                text.includes(keyword)
                ? ''
                : 'none';

        });

        clearBtn.style.display = this.value.length > 0
            ? 'block'
            : 'none';
    });


    clearBtn.addEventListener('click', function(){

        searchInput.value = '';

        searchInput.dispatchEvent(
            new Event('input')
        );

        searchInput.focus();

    });

    const select = document.getElementById('shareType');
    select.addEventListener('change', function () {
        const value = this.value;

        document.querySelectorAll('#type-a, #type-b, #type-c, #type-d').forEach(el => {
            el.classList.add('hidden');
        });

        // tampilkan yang dipilih
        if (this.value) {
            document.getElementById(this.value).classList.remove('hidden');
        }
    });

    const selectGift = document.getElementById('giftType');
    selectGift.addEventListener('change', function () {
        const value = this.value;

        document.querySelectorAll('#gift-a, #gift-b, #gift-c, #gift-d').forEach(el => {
            el.classList.add('hidden');
        });

        // tampilkan yang dipilih
        if (this.value) {
            document.getElementById(this.value).classList.remove('hidden');
        }
    });
}

window.switchShareTab =
    function(event, tabName) {

    document
        .querySelectorAll(".share-tab")
        .forEach((tab) => {
        tab.classList.remove(
            "active"
        );
        });

    document
        .querySelectorAll(
        ".share-tab-content"
        )
        .forEach((content) => {
        content.classList.remove(
            "active"
        );
        });

    event.target.classList.add(
        "active"
    );

    document
        .getElementById(
        `tab-${tabName}`
        )
        .classList.add("active");
};

window.openRecipientModal =
    function() {

    document
    .getElementById(
        "recipientModal"
    )
    .style.display = "flex";
};

window.closeRecipientModal = function() {

    document
      .getElementById(
        "recipientModal"
      )
      .style.display = "none";
};

window.updateSummary = function() {
    const selected = [];

    document
    .querySelectorAll('.recipient:checked')
    .forEach(item => {
        selected.push(item.value);
    });

    const summary =
        document.getElementById('selectedSummary');

    if(selected.length === 0){
        summary.textContent =
            'Pilih penerima';
    }
    else if(selected.length <= 3){
        summary.textContent =
            selected.join(', ');
    }
    else{
        summary.textContent =
            selected.slice(0,3).join(', ')
            + ' +' +
            (selected.length - 3)
            + ' lainnya';
    }
};  

window.saveRecipients = async function(type) {
    const checkboxes = document.querySelectorAll('.recipient:checked');

    checkboxes.forEach(checkbox => {
        selectedRecipients.push(checkbox.value);
    });

    console.log("Selected Recipients:", selectedRecipients);
    updateSummary();
    closeRecipientModal();
};

window.toggleAllRecipients = async function() {

    const visibleCheckboxes = [];

    document
        .querySelectorAll('.user-item')
        .forEach(item => {

            if (item.style.display !== 'none') {
                visibleCheckboxes.push(
                    item.querySelector('.recipient')
                );
            }

        });

    const allChecked =
        visibleCheckboxes.every(cb => cb.checked);

    visibleCheckboxes.forEach(cb => {
        cb.checked = !allChecked;
    });

    updateSelectAllButton();
}

window.updateSelectAllButton = function() {

    const visibleCheckboxes = [];

    document
        .querySelectorAll('.user-item')
        .forEach(item => {

            if (item.style.display !== 'none') {
                visibleCheckboxes.push(
                    item.querySelector('.recipient')
                );
            }

        });

    const btn =
        document.getElementById('selectAllBtn');

    if (visibleCheckboxes.length === 0) {
        btn.textContent = 'Tidak ada hasil';
        btn.disabled = true;
        return;
    }

    btn.disabled = false;

    const allChecked =
        visibleCheckboxes.every(cb => cb.checked);

    btn.textContent = allChecked
        ? `Batalkan Semua Hasil (${visibleCheckboxes.length})`
        : `Pilih Semua Hasil (${visibleCheckboxes.length})`;
}

window.uploadCSV = function() {
    document
    .getElementById(
        "uploadCSVmodal"
    )
    .style.display = "flex";
}

window.closeUploadCSVModal = function() {

    document
      .getElementById(
        "uploadCSVmodal"
      )
      .style.display = "none";
};
