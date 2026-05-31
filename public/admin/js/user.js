const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://the-saonline.vercel.app";

const API_URL = `${BASE_URL}/api/cms_player`;
const API_CATALOG_URL = `${BASE_URL}/api/admin`;
const API_REGISTER_URL = `${BASE_URL}/api/register`;

let currentEditingUserId = null;
let currentPlayerData = null;
let currentCatalogEquipments = [];
let currentCatalogItems = [];
let currentCatalogPartners = [];

// =========================
// API HELPER
// =========================

async function apiRequest(body) {

  const token =
    localStorage.getItem("access_token");

  try {

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    });

    const result =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "API Error"
      );
    }

    return result.data;

  } catch (err) {

    console.error(
      "API Request Error:",
      err
    );

    return null;
  }
}

async function apiCatalogRequest(body) {

  const token =
    localStorage.getItem("access_token");

  try {

    const response = await fetch(API_CATALOG_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    });

    const result =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "API Error"
      );
    }

    return result.data;

  } catch (err) {

    console.error(
      "API Request Error:",
      err
    );

    return null;
  }
}


async function apiRegisterRequest(body) {
  console.log("API Register Request Body:", body);
  try {
    const response = await fetch(API_REGISTER_URL, {
      method: "POST",
      body: JSON.stringify(body)
    });

    const result =
      await response.json();
    if (!response.ok) {
      throw new Error(
        result.error || "Registration failed"
      );
    }
    return result;
  } catch (err) {
    console.error(
      "API Register Request Error:",
      err
    );
    return null;
  }
}
// =========================
// FETCH PLAYERS
// =========================

async function fetchListPlayers() {

  return await apiRequest({
    table: "players",
    action: "getListPlayer",
  });
}

async function fetchFullPlayerData(userId) {

  return await apiRequest({
    action: "getFullPlayerData",
    player_id: userId,
  });
}

// =========================
// RENDER LIST PLAYER
// =========================

function renderListPlayers(
  players,
  tableBody
) {

  tableBody.innerHTML = "";

  players.forEach((player) => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${player.username}</td>
      <td>${player.email}</td>
      <td>Player</td>

      <td>
        <button
          class="table-btn edit"
          onclick="viewUser('${player.id}')"
        >
          View
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// =========================
// INIT PAGE
// =========================

async function initUserPage() {

  $(document).ready(function () {
      $('.addEquipmentSelect').select2({
        dropdownParent: $('#addEquipmentModal')
    });
  });

  const listPlayersBody =
    document.getElementById(
      "listPlayersBody"
    );

  const tableLoading =
    document.getElementById(
      "tableUserOverlayLoading"
    );

  function setTableLoading(isLoading) {

    tableLoading.classList.toggle(
      "hidden",
      !isLoading
    );
  }

  try {

    setTableLoading(true);

    const players =
      await fetchListPlayers();

    renderListPlayers(
      players || [],
      listPlayersBody
    );

  } catch (err) {

    console.error(
      "Init User Page Error:",
      err
    );

  } finally {

    setTableLoading(false);
  }

  // =========================
  // VIEW USER
  // =========================

  window.viewUser =
    async function(userId) {

    const detailLoading =
      document.getElementById(
        "detailUserOverlayLoading"
      );

    function setDetailLoading(isLoading) {

      detailLoading.classList.toggle(
        "hidden",
        !isLoading
      );
    }

    try {

      setDetailLoading(true);

      currentEditingUserId =
        userId;

      currentPlayerData =
        await fetchFullPlayerData(
          userId
        );

      if (!currentPlayerData) {

        alert(
          "Failed to load player data"
        );

        return;
      }

      const {
        profile,
        stats,
        equipments,
        items,
        partners,
      } = currentPlayerData;

      // HIDE LIST
      document.getElementById(
        "usersListView"
      ).style.display = "none";

      // SHOW DETAIL
      document.getElementById(
        "userDetailView"
      ).style.display = "block";

      // PROFILE
      document.getElementById(
        "detailUsername"
      ).textContent =
        profile?.name || "-";

      document.getElementById(
        "userLevel"
      ).textContent =
        profile?.level || 0;

      document.getElementById(
        "userCol"
      ).textContent =
        profile?.col || 0;

      document.getElementById(
        "userGems"
      ).textContent =
        profile?.arcana_gems || 0;

      // RENDER
      renderInventory(
        equipments || [],
        items || []
      );

      renderPartners(
        partners || []
      );

      populateEditForm(
        profile || {},
        stats || {},
        equipments || [],
        items || [],
        partners || []
      );

    } catch (err) {

      console.error(
        "View User Error:",
        err
      );

    } finally {

      setDetailLoading(false);
    }
  };

  // =========================
  // MODAL
  // =========================

  window.openEditPlayerModal =
    function() {

    document
      .getElementById(
        "editPlayerModal"
      )
      .style.display = "flex";
  };

  window.closeEditPlayerModal =
    function() {

    document
      .getElementById(
        "editPlayerModal"
      )
      .style.display = "none";
  };

  // =========================
  // SAVE
  // =========================

  window.savePlayerChanges = async function() {
    const profile = {
      name: document.getElementById("editUsername").value,
      level: Number(document.getElementById("editLevel").value),
      soul_trait: document.getElementById("editSoulTrait").value,
      col: Number(document.getElementById("editCol").value),
      arcana_gems: Number(document.getElementById("editGems").value),
      avatar: document.getElementById("editAvatar").value
    };

    const stats = {
      atk: Number(document.getElementById("editAtk").value),
      def: Number(document.getElementById("editDef").value),
      max_hp: Number(document.getElementById("editHp").value),
      max_mp: Number(document.getElementById("editMp").value),
      crit_pct: Number(document.getElementById("editCritRate").value),
      crit_dmg: Number(document.getElementById("editCritDmg").value)
    };

    const equipments = [];

    document.querySelectorAll("#equipmentContainer .dynamic-row").forEach(row => {

      equipments.push({
        id: row.querySelector("input[type='text']").getAttribute("data-equipment-id"),
        name: row.querySelector("input[type='text']").value,
        level: Number(
          row.querySelector(".equipment-level")
            .value
        ),
        star: Number(
          row.querySelector(".equipment-star")
            .value
        )
      });

    });

    const items = [];

    document
      .querySelectorAll("#itemsContainer .dynamic-row")
      .forEach(row => {

        items.push({
          id: row.querySelector("input[type='text']").getAttribute("data-item-id"),
          name: row.querySelector("input[type='text']").value,
          quantity: Number(
            row.querySelector("input[type='number']")
              .value
          )
        });

      });

    const partners = [];

    document
      .querySelectorAll("#partnersContainer .dynamic-row")
      .forEach(row => {

        partners.push({
          id: row.querySelector("input[type='text']").getAttribute("data-partner-id"),
          name: row.querySelector("input[type='text']").value,
          level: Number(
            row.querySelector(".partner-level").value
          ),
          star: Number(
            row.querySelector(".partner-star").value
          )
        });

      });
    
    const payload = {
      player_id: currentEditingUserId,
      profile,
      stats,
      equipments,
      items,
      partners
    };

    console.log("Save Payload:", payload);

    const confirmSave = confirm(
      "Are you sure you want to save changes?"
    );

    if (!confirmSave) {
      return;
    }

    try {
      await apiRequest({
        action: "updateFullPlayer",
        table: "players",
        ...payload
      });
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes.");
    } finally {
      closeEditPlayerModal();
      viewUser(currentEditingUserId);
    }
  };

  // =========================
  // TAB
  // =========================

  window.switchPlayerTab =
    function(event, tabName) {

    document
  };

  // =========================
  // TAB
  // =========================

  window.switchPlayerTab =
    function(event, tabName) {

    document
      .querySelectorAll(".player-tab")
      .forEach((tab) => {
        tab.classList.remove(
          "active"
        );
      });

    document
      .querySelectorAll(
        ".player-tab-content"
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
}

// =========================
// INVENTORY
// =========================

function renderInventory(
  equipments,
  items
) {

  const weaponList =
    document.getElementById(
      "weaponList"
    );

  const itemList =
    document.getElementById(
      "itemList"
    );

  weaponList.innerHTML = "";
  itemList.innerHTML = "";

  equipments.forEach(
    (eq, index) => {

    weaponList.innerHTML += `
      <li>
        <input type="checkbox" id="${eq.id}" class="equipment-checkbox" />
        ${eq.catalog.name}
        (Lvl ${eq.level},
        ${eq.star}★)
      </li>
    `;
  });

  items.forEach(
    (item, index) => {

    itemList.innerHTML += `
      <li>
        <input type="checkbox" id="${item.id}" class="item-checkbox" />
        ${item.catalog.name}
        (${item.quantity})
      </li>
    `;
  });
}

// =========================
// PARTNERS
// =========================

function renderPartners(partners = []) {

  const partnerList =
    document.getElementById("partnerList");

  partnerList.innerHTML = "";

  partners.forEach((partner, index) => {

    const catalog =
      partner.catalog || {};

    const stats =
      catalog.stats || {};

    partnerList.innerHTML += `
      <li>
        <input type="checkbox" id="${partner.id}" class="partner-checkbox" />
        ${catalog.name || "Unknown"}
        (Lvl ${partner.level || 0},
        ${partner.star || 0}★)

        <div class="tooltip">
          Stats

          <div class="tooltiptext">

            <div>
              ATK:
              ${stats.atk || 0}
            </div>

            <div>
              HP:
              ${stats.hp || 0}
            </div>

            <div>
              DEF:
              ${stats.def || 0}
            </div>

          </div>
        </div>
      </li>
    `;
  });
}

// =========================
// EDIT FORM
// =========================

function populateEditForm(
  profile,
  stats,
  equipments,
  items,
  partners
) {

  // PROFILE

  document.getElementById(
    "editUsername"
  ).value =
    profile.name || "";

  document.getElementById(
    "editLevel"
  ).value =
    profile.level || "";

  document.getElementById(
    "editSoulTrait"
  ).value =
    profile.soul_trait || "";

  document.getElementById(
    "editCol"
  ).value =
    profile.col || "";

  document.getElementById(
    "editGems"
  ).value =
    profile.arcana_gems || "";

  document.getElementById(
    "editAvatar"
  ).value =
    profile.avatar || "";

  // STATS

  document.getElementById(
    "editAtk"
  ).value =
    stats.atk || 0;

  document.getElementById(
    "editDef"
  ).value =
    stats.def || 0;

  document.getElementById("editHp").value =
    stats.max_hp || 0;

  document.getElementById("editMp").value =
    stats.max_mp || 0;

  document.getElementById("editCritRate").value =
    stats.crit_pct || 0;

  document.getElementById(
    "editCritDmg"
  ).value =
    stats.crit_dmg || 0;

  // TABS

  populateEquipmentTab(
    equipments
  );

  populateItemsTab(
    items
  );

  populatePartnersTab(
    partners
  );
}

// =========================
// EQUIPMENT TAB
// =========================

function populateEquipmentTab(
  equipments
) {

  const container =
    document.getElementById(
      "equipmentContainer"
    );

  container.innerHTML = "";

  equipments.forEach((eq) => {
    const div =
      document.createElement("div");

    div.className =
      "dynamic-row";

    div.innerHTML = `
      <input
        type="text"
        value="${eq.catalog.name}"
        data-equipment-id="${eq.id}"
        disabled
      >

      <input
        class="equipment-level"
        type="number"
        value="${eq.level}"
      >

      <input
        class="equipment-star"
        type="number"
        value="${eq.star}"
      >

      <button
        class="admin-btn danger-btn"
        onclick="this.parentElement.remove()"
      >
        X
      </button>
    `;

    container.appendChild(div);
  });
}

// =========================
// ITEMS TAB
// =========================

function populateItemsTab(
  items
) {

  const container =
    document.getElementById(
      "itemsContainer"
    );

  container.innerHTML = "";

  items.forEach((item) => {

    const div =
      document.createElement("div");

    div.className =
      "dynamic-row";

    div.innerHTML = `
      <input
        type="text"
        value="${item.catalog.name}"
        data-item-id="${item.id}"
        disabled
      >

      <input
        type="number"
        value="${item.quantity}"
      >

      <button
        class="admin-btn danger-btn"
        onclick="this.parentElement.remove()"
      >
        X
      </button>
    `;

    container.appendChild(div);
  });
}

// =========================
// PARTNERS TAB
// =========================

function populatePartnersTab(
  partners
) {

  const container =
    document.getElementById(
      "partnersContainer"
    );

  container.innerHTML = "";

  partners.forEach((partner) => {

    const div =
      document.createElement("div");

    div.className =
      "dynamic-row";

    div.innerHTML = `
      <input
        type="text"
        value="${partner.catalog.name}"
        data-partner-id="${partner.id}"
        disabled
      >

      <input
        type="number"
        class="partner-level"
        value="${partner.level}"
      >

      <input
        type="number"
        class="partner-star"
        value="${partner.star}"
        min="0"
        max="5"
      >

      <button
        class="admin-btn danger-btn"
        onclick="this.parentElement.remove()"
      >
        X
      </button>
    `;

    container.appendChild(div);
  });
}

// =========================
// ADD ROWS
// =========================

window.addEquipmentRow =
  function() {

  const container =
    document.getElementById(
      "equipment-new"
    );

  const div =
    document.createElement("div");

  div.className =
    "form-add-grid dynamic-row";

  div.innerHTML = `
    <select class="addEquipmentSelect" style="width:100%;">
    </select>

    <input
      type="number"
      class="equipment-level"
      placeholder="Level"
      min="1"
    >

    <input
      type="number"
      class="equipment-star"
      placeholder="Star"
      min="1"
    >

    <button
      class="admin-btn danger-btn"
      onclick="this.parentElement.remove()"
    >
      X
    </button>
  `;

  container.appendChild(div);

  const selectEqNew = $(div).find(".addEquipmentSelect");

  currentCatalogEquipments.forEach(eq => {
    selectEqNew.append(
      new Option(
        eq.name,
        eq.id
      )
    );
  });

  selectEqNew.select2({
    dropdownParent: $("#addEquipmentModal")
  });
};

window.addItemRow =
  function() {

  const container =
    document.getElementById(
      "items-new"
    );

  const div =
    document.createElement("div");

  div.className =
    "dynamic-row";

  div.innerHTML = `
    <select class="addItemSelect" style="width:100%;">
    </select>

    <input
      type="number"
      class="item-qty"
      placeholder="Amount"
    >

    <button
      class="admin-btn danger-btn"
      onclick="this.parentElement.remove()"
    >
      X
    </button>
  `;

  container.appendChild(div);

  const selectEqNew = $(div).find(".addItemSelect");

  currentCatalogItems.forEach(item => {
    selectEqNew.append(
      new Option(
        item.name,
        item.id
      )
    );
  });

  selectEqNew.select2({
    dropdownParent: $("#addItemModal")
  });
};

window.addPartnerRow =
  function() {

  const container =
    document.getElementById(
      "partners-new"
    );

  const div =
    document.createElement("div");

  div.className =
    "dynamic-row";

  div.innerHTML = `
    <select class="addPartnerSelect" style="width:100%;">
    </select>

    <input
      type="number"
      class="partner-level"
      placeholder="Level"
    >

    <input
      type="number"
      class="partner-star"
      placeholder="Star"
    >

    <button
      class="admin-btn danger-btn"
      onclick="this.parentElement.remove()"
    >
      X
    </button>
  `;

  container.appendChild(div);

  const selectEqNew = $(div).find(".addPartnerSelect");

  currentCatalogPartners.forEach(partner => {
    selectEqNew.append(
      new Option(
        partner.name,
        partner.id
      )
    );
  });

  selectEqNew.select2({
    dropdownParent: $("#addPartnerModal")
  });
};

// =========================
// TOGGLE STATS
// =========================

window.togglePlayerStats =
  function() {

  const popup =
    document.getElementById(
      "playerStatsPopup"
    );

  popup.classList.toggle(
    "hidden"
  );
};

// =========================
// OPEN ADD NEW WEAPON MODAL 
// =========================
window.openAddEquipmentModal = async function() {
  const modal =
    document.getElementById(
      "addEquipmentModal"
    );
  modal.style.display = "flex";

  function setModalLoading(isLoading) {

    document
      .getElementById(
        "overlayModalEquipment"
      )
      .classList.toggle(
        "hidden",
        !isLoading
      );
  }

  if (currentCatalogEquipments.length > 0) {
    console.log("Use cache");
    return;
  }

  try {
    setModalLoading(true);
    var response = await apiCatalogRequest({
      table: "catalog_equipments",
      action: "getAll",
    });
    

    currentCatalogEquipments = response || [];

    const selectEq = $(".addEquipmentSelect");

    selectEq.empty();

    currentCatalogEquipments.forEach(eq => {
      selectEq.append(
        new Option(
          eq.name,
          eq.id
        )
      );
    });

    selectEq.trigger("change");
  } catch (err) {
    console.error(
      "Open Add Equipment Modal Error:",
      err
    );
  } finally {
    setModalLoading(false);
  }
};

window.closeAddEquipmentModal =
  function() {

  document
    .getElementById(
      "addEquipmentModal"
    )
    .style.display = "none";
};


// =========================
// OPEN ADD NEW ITEM MODAL
// =========================
window.openAddItemModal = async function() {
  document
    .getElementById(
      "addItemModal"
    )
    .style.display = "flex";

  function setModalLoading(isLoading) {

    document
      .getElementById(
        "overlayModalItem"
      )
      .classList.toggle(
        "hidden",
        !isLoading
      );
  }

  if (currentCatalogItems.length > 0) {
    console.log("Use cache");
    return;
  }

  try {
    setModalLoading(true);
    var response = await apiCatalogRequest({
      table: "catalog_items",
      action: "getAll",
    });
    

    currentCatalogItems = response || [];

    const selectItem = $(".addItemSelect");

    selectItem.empty();

    currentCatalogItems.forEach(item => {
      selectItem.append(
        new Option(
          item.name,
          item.id
        )
      );
    });

    selectItem.trigger("change");
  } catch (err) {
    console.error(
      "Open Add Item Modal Error:",
      err
    );
  } finally {
    setModalLoading(false);
  }
};

window.closeAddItemModal =
  function() {
  document
    .getElementById(
      "addItemModal"
    )
    .style.display = "none";
};

// =========================
// OPEN ADD NEW PARTNER MODAL
// =========================
window.openAddPartnerModal = async function() {
  document
    .getElementById(
      "addPartnerModal"
    )
    .style.display = "flex";

  function setModalLoading(isLoading) {

    document.getElementById(
        "overlayModalPartner"
      ).classList.toggle(
        "hidden",
        !isLoading
      );
  }

  if (currentCatalogPartners.length > 0) {
    console.log("Use cache");
    return;
  }

  try {
    setModalLoading(true);
    var response = await apiCatalogRequest({
      table: "catalog_partners",
      action: "getAll",
    });

    currentCatalogPartners = response || [];

    const selectPartner = $(".addPartnerSelect");

    selectPartner.empty();

    currentCatalogPartners.forEach(partner => {
      selectPartner.append(
        new Option(
          partner.name,
          partner.id
        )
      );
    });

    selectPartner.trigger("change");
  } catch (err) {
    console.error(
      "Open Add Partner Modal Error:",
      err
    );
  } finally {
    setModalLoading(false);
  }
};

window.closeAddPartnerModal =
  function() {
  document
    .getElementById(
      "addPartnerModal"
    )
    .style.display = "none";
};

// =========================
// SAVE NEW DATA
// =========================
window.saveNewData = async function(type) {
  let playerId = currentEditingUserId;
  let payload = {};
  let equipments = [];
  let items = [];
  let partners = [];

  if (type === "equipment") {

    document.querySelectorAll("#equipment-new .dynamic-row").forEach(row => {

      equipments.push({
        player_id: playerId,
        equipment_id: row.querySelector("select").value,
        level: Number(
          row.querySelector(".equipment-level").value
        ),
        star: Number(
          row.querySelector(".equipment-star").value
        )
      });
    });
    console.log("New Equipments:", equipments);
  } else if (type === "item") {
    document.querySelectorAll("#items-new .dynamic-row").forEach(row => {
      items.push({
        player_id: playerId,
        item_id: row.querySelector("select").value,
        quantity: Number(
          row.querySelector("input[type='number']").value
        )
      });
    });
    console.log("New Items:", items);
  } else if (type === "partner") {
    document.querySelectorAll("#partners-new .dynamic-row").forEach(row => {
      partners.push({
        player_id: playerId,
        partner_id: row.querySelector("select").value,
        level: Number(
          row.querySelector(".partner-level").value
        ),
        star: Number(
          row.querySelector(".partner-star").value
        )
      });
    });
    console.log("New Partners:", partners);
  }

  const tableMap = {
    equipment: "player_equipments",
    item: "player_items",
    partner: "player_partners"
  };

  payload = {
    data:
    type === "equipment"
      ? equipments
      : type === "item"
      ? items
      : partners
  };
    

  console.log("Save New Data Payload:", payload);
  const confirmSave = confirm(
      "Are you sure you want to save these changes?"
  );

  if (!confirmSave) {
    return;
  }

  try {
    await apiRequest({
      action: "insertNewData",
      table: tableMap[type],
      ...payload
    });
    alert("Changes saved successfully!");
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("Failed to save changes.");
  } finally {
    if (type === "equipment") {
      closeAddEquipmentModal();
    } else if (type === "item") {
      closeAddItemModal();
    } else if (type === "partner") {
      closeAddPartnerModal();
    }
    viewUser(currentEditingUserId);
  }
};

// =========================
// DELETE SELECTED DATA
// =========================
window.deleteSelectedData = async function(type) {
  let selectedIds = [];
  if (type === "equipment") {
    document.querySelectorAll(".equipment-checkbox:checked").forEach(checkbox => {
      selectedIds.push(checkbox.id);
    });
  } else if (type === "item") {
    document.querySelectorAll(".item-checkbox:checked").forEach(checkbox => {
      selectedIds.push(checkbox.id);
    });
  } else if (type === "partner") {
    document.querySelectorAll(".partner-checkbox:checked").forEach(checkbox => {
      selectedIds.push(checkbox.id);
    });
  }

  if (selectedIds.length === 0) {
    alert("Please select at least one item to delete.");
    return;
  }
  console.log("Selected IDs for Deletion:", selectedIds);

  const tableMap = {
    equipment: "player_equipments",
    item: "player_items",
    partner: "player_partners"
  };

  const confirmDelete = confirm(
    `Are you sure you want to delete ${selectedIds.length} selected ${
      type === "equipment"
        ? "equipments"
        : type === "item"
        ? "items"
        : "partners"
    }?`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest({
      action: "deleteData",
      table: tableMap[type],
      ids: selectedIds
    });
    alert("Selected data deleted successfully!");
  } catch (error) {
    console.error("Error deleting data:", error);
    alert("Failed to delete selected data.");
  } finally {
    viewUser(currentEditingUserId);
  }
}

// =========================
// ADD NEW USER
// =========================
window.openAddUserModal = async function() {
  document
    .getElementById(
      "addUserModal"
    )
    .style.display = "flex";
};

window.closeAddUserModal =
  function() {
  document
    .getElementById(
      "addUserModal"
    )
    .style.display = "none";
};

window.saveNewUser = async function() {
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;
  const soulTrait = document.getElementById("newSoulTrait").value;
  if (!username || !password) {
    alert("All fields are required.");
    return;
  }
  
  
  try {
    // 1. register thru API
    let registerResponse = await apiRegisterRequest({
      username,
      password
    });

    let newUserId = registerResponse.userId;
    // 2. add to player profile with default values
    const payload = {
      data: {
      player_id: newUserId,
      name: username,
      level: 1,
      col: 0,
      arcana_gems: 0,
      soul_trait: soulTrait,
      avatar: ""
      }
    };

    await apiRequest({
      action: "insertNewData",
      table: "player_profiles",
      ...payload
    });

    // search for stat with soultrait
    

    await apiRequest({
      action: "insertNewData",
      table: "player_stats",
      data: {
        player_id: newUserId,
        atk: 0,
        def: 0,
        max_hp: 100,
        max_mp: 50,
        crit_pct: 0,
        crit_dmg: 0
      }
    });
    
  } catch (error) {
    console.error("Error registering new user:", error);
    alert("Failed to register new user.");
    return;
  } finally {
    closeAddUserModal();
    initUserPage();
  }
};