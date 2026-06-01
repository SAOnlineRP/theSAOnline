let selectedRecipients = [];

async function initSharePage() {
    $(document).ready(function () {
        $('#type-b-catalog-eq').select2({
            placeholder: "Select an equipment",
            allowClear: true
        });
    });

    $(document).ready(function () {
        $('#type-b-catalog-partner').select2({
            placeholder: "Select a partner",
            allowClear: true
        });
    });

    $(document).ready(function () {
        $('#type-c-catalog').select2({
            placeholder: "Select an item",
            allowClear: true
        });
    });

    $(document).ready(function () {
        $('#gift-b-catalog-eq').select2({
            placeholder: "Select an equipment",
            allowClear: true
        });
    });

    $(document).ready(function () {
        $('#gift-b-catalog-partner').select2({
            placeholder: "Select an partner",
            allowClear: true
        });
    });

    $(document).ready(function () {
        $('#gift-c-catalog').select2({
            placeholder: "Select an item",
            allowClear: true
        });
    });

    const detailLoading =
      document.getElementById(
        "shareOverlayLoading"
      );

    function setDetailLoading(isLoading) {

      detailLoading.classList.toggle(
        "hidden",
        !isLoading
      );
    }

    let listplayers = [];
    
    document.getElementById('user-list').innerHTML = '';
    try {
        setDetailLoading(true);
        listplayers =
        await fetchListPlayers();
        console.log("list players ", listplayers);
        await getAllCatalog();

        // fetch catalog equipment 

        // fetch catalog 


    } catch (err) {
        console.log("Error fetch list");
    } finally {
        setDetailLoading(false);
        console.log("current catalog equipments", currentCatalogEquipments);
    }

    listplayers.forEach(recipient => {
        const label = document.createElement('label');
        label.classList.add('user-item');

        label.innerHTML = `
            <input
                type="checkbox"
                class="recipient"
                value="${recipient.id}"
                data-name="${recipient.username}"
            >
            ${recipient.username}
        `;

        document
            .getElementById('user-list')
            .appendChild(label);
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

    const selectTableEq = document.getElementById('type-b-table');
    selectTableEq.addEventListener('change', function () {
        const value = this.value;
        console.log("milih catalog");

        document.querySelectorAll('#type-b-catalog-eq, #type-b-catalog-partner')
        .forEach(el => {
            el.parentElement.classList.add('hidden');
        });

        // tampilkan yang dipilih
        if (this.value) {
            if(value == "player_equipments"){
                document.getElementById("type-b-catalog-eq").parentElement.classList.remove("hidden");
                document.getElementById("type-b-catalog-eq").classList.remove("hidden");
            } else if(value == "player_partners"){
                document.getElementById('type-b-catalog-partner').parentElement.classList.remove('hidden');
                document.getElementById("type-b-catalog-partner").classList.remove("hidden");
            }
            
        }
    });

    const selectTableGift = document.getElementById('gift-b-table');
    selectTableGift.addEventListener('change', function () {
        const value = this.value;
        console.log("milih catalog");

        document.querySelectorAll('#gift-b-catalog-eq, #gift-b-catalog-partner')
        .forEach(el => {
            el.parentElement.classList.add('hidden');
        });

        // tampilkan yang dipilih
        if (this.value) {
            if(value == "player_equipments"){
                document.getElementById("gift-b-catalog-eq").parentElement.classList.remove("hidden");
                document.getElementById("gift-b-catalog-eq").classList.remove("hidden");
            } else if(value == "player_partners"){
                document.getElementById('gift-b-catalog-partner').parentElement.classList.remove('hidden');
                document.getElementById("gift-b-catalog-partner").classList.remove("hidden");
            }
            
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

            selected.push({
                id: Number(item.value),
                name: item.dataset.name
            });

        });

    const summary =
        document.getElementById(
            'recepientSelectedSummary'
        );

    if (selected.length === 0) {

        summary.textContent =
            'Pilih penerima';

    }
    else if (selected.length <= 3) {

        summary.textContent =
            selected
                .map(x => x.name)
                .join(', ');

    }
    else {

        summary.textContent =
            selected
                .slice(0, 3)
                .map(x => x.name)
                .join(', ')
            + ' +' +
            (selected.length - 3)
            + ' lainnya';

    }
};  

window.saveRecipients = async function() {

    selectedRecipients = [];

    document
        .querySelectorAll('.recipient:checked')
        .forEach(checkbox => {

            selectedRecipients.push({
                id: checkbox.value,
                name: checkbox.dataset.name
            });

        });

    console.log(
        "Selected Recipients:",
        selectedRecipients
    );

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

// =====
// UPDATE SELECTED 
// =====
window.updateSelected = async function() {
    const recipientIds =
    selectedRecipients.map(x => x.id);

    const type = document.getElementById("shareType").value;

    const tableLoading =
            document.getElementById(
            "bulkOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableLoading.classList.toggle(
        "hidden",
        !isLoading
        );
    }

    console.log("Player Selected ", selectedRecipients);
    console.log(recipientIds);
    let payload = [];
    if(type == "type-a"){
        const column = document.getElementById("type-a-data").value;
        const amount = Number(document.getElementById('type-a-amount').value);

        console.log("column ", column);
        console.log(amount);


        try {
            setTableLoading(true);
            await apiRequest({
                table: "player_profiles",
                action: "updateSelectedData",
                column: column,
                ids: recipientIds,
                amount: amount
            });
        } catch (err) {

            console.error(
            "Update Selected Error:",
            err
            );

        } finally {

            setTableLoading(false);
        }
    } else if(type == "type-b"){
        const table = document.getElementById("type-b-table").value;

        let catalog_id = "";
        let catalogField = "equipment_id";

        if (table === "player_equipments") {
            catalog_id = document.getElementById("type-b-catalog-eq").value;
            catalogField = "equipment_id";
        } else if (table === "player_partners") {
            catalog_id = document.getElementById("type-b-catalog-partner").value;
            catalogField = "partner_id";
        }

        const level = Number(document.getElementById("type-b-level").value);
        const star = Number(document.getElementById("type-b-star").value);

        let data = [];

        for (let i = 0; i < recipientIds.length; i++) {
            data.push({
                player_id: recipientIds[i],
                [catalogField]: catalog_id,
                level,
                star
            });
        }

        console.log(data);

        payload = {
            data: data
        }

        await apiRequest({
            action: "insertNewData",
            table: table,
            ...payload
        });


    } else if(type == "type-c"){
        const catalog_id = document.getElementById('type-c-catalog').value;
        const amount = Number(document.getElementById('type-c-qty').value);

        console.log("catalog_id ", catalog_id);
        console.log("amount ", amount);

        let data = [];
        for (let i = 0; i < recipientIds.length; i++) {
            data.push({player_id: recipientIds[i], item_id: catalog_id, quantity: amount});
        };
        console.log(data);

        payload = {
            data: data
        }

        await apiRequest({
            action: "insertNewData",
            table: "player_items",
            ...payload
        });
    } else if(type == "type-d"){
        const catalog_id = document.getElementById('type-d-catalog').value;

        console.log("catalog_id ", catalog_id);
    }
}

// =====
// SEND GIFTS TO SELECTED 
// =====
window.sendSelected = async function() {
    const recipientIds =
    selectedRecipients.map(x => x.id);

    const type = document.getElementById("giftType").value;

    const tableLoading =
            document.getElementById(
            "giftOverlayLoading"
        );

    function setTableLoading(isLoading) {

        tableLoading.classList.toggle(
        "hidden",
        !isLoading
        );
    }

    if(type == "gift-a"){
        const column = document.getElementById("gift-a-column").value;
        const amount = Number(document.getElementById('gift-a-amount').value);

        console.log("Player Selected ", selectedRecipients);
        console.log(recipientIds);
        console.log("column ", column);
        console.log(amount);

        let data = [];
        for (let i = 0; i < recipientIds.length; i++) {
            data.push({player_id: recipientIds[i], type: "col/gems", data: {column: column, amount: amount}});
        };
        console.log(data);
        payload = {
            data: data
        }

        await apiRequest({
            action: "insertNewData",
            table: "player_gifts",
            ...payload
        });
        
    } else if(type == "gift-b"){
        const table = document.getElementById("gift-b-table").value;
        const catalog_id = document.getElementById('gift-b-catalog').value;
        const level = Number(document.getElementById('gift-b-level').value);
        const star = Number(document.getElementById('gift-b-star').value);

        console.log("table ", table);
        console.log("catalog_id ", catalog_id);
        console.log("level ", level);
        console.log("star ", star);

        let data = [];
        for (let i = 0; i < recipientIds.length; i++) {
            data.push({player_id: recipientIds[i], type: "eq/partners", data: {table: table, catalog_id: catalog_id, level: level, star: star}});
        };
        console.log(data);
        payload = {
            data: data
        }

        await apiRequest({
            action: "insertNewData",
            table: "player_gifts",
            ...payload
        });
    } else if(type == "gift-c"){
        const catalog_id = document.getElementById('gift-c-catalog').value;
        const amount = Number(document.getElementById('gift-c-qty').value);

        console.log("catalog_id ", catalog_id);
        console.log("amount ", amount);

        let data = [];
        for (let i = 0; i < recipientIds.length; i++) {
            data.push({player_id: recipientIds[i], type: "eq/partners", data: {catalog_id: catalog_id, quantity: amount}});
        };
        console.log(data);
        payload = {
            data: data
        }

        await apiRequest({
            action: "insertNewData",
            table: "player_gifts",
            ...payload
        });
    } else if(type == "gift-d"){
        const catalog_id = document.getElementById('gift-d-catalog').value;

        console.log("catalog_id ", catalog_id);
    }

    //console.log("payload ", payload);
}

window.getAllCatalog = async function() {
    try {
        //setModalLoading(true);

        // catalog equipments
        var responseEq = await apiCatalogRequest({
            table: "catalog_equipments",
            action: "getAll",
        });
        

        currentCatalogEquipments = responseEq || [];

        const selectEqTypeB = $("#type-b-catalog-eq");
        const selectEqGiftB = $("#gift-b-catalog-eq");

        selectEqTypeB.empty();
        selectEqGiftB.empty();
        
        selectEqTypeB.append(new Option('', ''));
        selectEqGiftB.append(new Option('', ''));

        currentCatalogEquipments.forEach(eq => {
            selectEqTypeB.append(
                new Option(
                eq.name,
                eq.id
                )
            );

            selectEqGiftB.append(
                new Option(
                eq.name,
                eq.id
                )
            );
        });

        selectEqTypeB.trigger("change");
        selectEqGiftB.trigger("change");

        // catalog partner
        var responsePartner = await apiCatalogRequest({
            table: "catalog_partners",
            action: "getAll",
        });
        

        currentCatalogPartners = responsePartner || [];

        const selectPartnerTypeB = $("#type-b-catalog-partner");
        const selectPartnrGiftB = $("#gift-b-catalog-partner");

        selectPartnerTypeB.empty();
        selectPartnrGiftB.empty();
        
        selectPartnerTypeB.append(new Option('', ''));
        selectPartnrGiftB.append(new Option('', ''));

        currentCatalogPartners.forEach(eq => {
            selectPartnerTypeB.append(
                new Option(
                eq.name,
                eq.id
                )
            );

            selectPartnrGiftB.append(
                new Option(
                eq.name,
                eq.id
                )
            );
        });

        selectPartnerTypeB.trigger("change");
        selectPartnrGiftB.trigger("change");

        var responseItems = await apiCatalogRequest({
            table: "catalog_items",
            action: "getAll",
        });

        currentCatalogItems = responseItems || [];

        const selectItemTypeC = $("#type-c-catalog");
        const selectItemGiftC = $("#gift-c-catalog");

        selectItemTypeC.empty();
        selectItemGiftC.empty();

        selectItemTypeC.append(new Option('', ''));
        selectItemGiftC.append(new Option('', ''));

        currentCatalogItems.forEach(eq => {
            selectItemTypeC.append(
                new Option(
                eq.name,
                eq.id
                )
            );

            selectItemGiftC.append(
                new Option(
                eq.name,
                eq.id
                )
            );
        });

        selectItemTypeC.trigger("change");
        selectItemGiftC.trigger("change");
    } catch (err) {
        console.error(
        "get Catalog Error:",
        err
        );
    } finally {
        //setModalLoading(false);
    }
}