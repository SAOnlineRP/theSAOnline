// ======================
// DUMMY USER DATA
// ======================

const usersData = [
  {
    id: 1,
    username: "player1",
    level: 25,
    gold: 5000,
    gems: 1200,

    weapons: [
      "Elucidator",
      "Dark Repulser"
    ],

    items: [
      "Potion",
      "Crystal"
    ],

    gachaHistory: [
      "Kirito ★5",
      "Asuna ★4"
    ]
  },
  {
    id: 2,
    username: "player2",
    level: 25,
    gold: 5000,
    gems: 1200,

    weapons: [
      "Elucidator",
      "Dark Repulser"
    ],

    items: [
      "Potion",
      "Crystal"
    ],

    gachaHistory: [
      "Kirito ★5",
      "Asuna ★4"
    ]
  }
];

let selectedUser = null;

async function fetchListPlayers() {
  const token =
            localStorage.getItem("access_token");

  try {
    const response = await fetch(
            "http://localhost:3000/api/cms_player",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ table: "players", action: "getListPlayer" })
            }
        );

    const listPlayers = await response.json();

    if (listPlayers.success) {
      console.log("List of Players:", listPlayers.data);
      return listPlayers;
    } else {
      console.error("Failed to fetch list of players:", listPlayers.error);
    }
  } catch (err) {
    console.error("Error fetching list of players:", err);
  }
}

function renderListPlayers(players, tableBody) {
  players.forEach((player) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.username}</td>
      <td>${player.email}</td>
      <td>Admin</td>
      <td>
          <button 
            class="table-btn edit" 
            onclick="viewUser('${player.id}')">
            View
          </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function fetchUserProfile(userId) {
  const token =
            localStorage.getItem("access_token");
  try {
    const response = await fetch(
            "http://localhost:3000/api/cms_player",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ table: "player_profiles", action: "getProfilePlayer", player_id: userId })
            }
        );
    const userProfile = await response.json();
    if (userProfile.success) {
      console.log("User Profile:", userProfile.data);
      return userProfile.data;
    } else {
      console.error("Failed to fetch user profile:", userProfile.error);
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
}

async function fetchUserInventory(userId) {
  const token =
            localStorage.getItem("access_token");
  try {
    const response = await fetch(
            "http://localhost:3000/api/cms_player",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ table: "player_equipments", action: "getEquipmentPlayer", player_id: userId })
            }
        );
    const userEquipment = await response.json();
    if (userEquipment.success) {
      console.log("User Equipment:", userEquipment.data);
      return userEquipment.data;
    } else {
      console.error("Failed to fetch user equipment:", userEquipment.error);
    }
  } catch (err) {
    console.error("Error fetching user equipment:", err);
  }
}

async function initUserPage() {
  const listPlayersBody =
    document.getElementById("listPlayersBody");
  
  const tableOverlayLoading =
        document.getElementById(
            "tableUserOverlayLoading"
        );

  function setTableLoading(isLoading) {

      tableOverlayLoading.classList.toggle(
          "hidden",
          !isLoading
      );
  }
  let listPlayers = [];
  try {
    setTableLoading(true);
    const listPlayersResponse =
      await fetchListPlayers();
    
    listPlayers = Array.isArray(listPlayersResponse)
            ? listPlayersResponse
            : listPlayersResponse?.data || [];

    renderListPlayers(
        listPlayers,
        listPlayersBody
    );
  } catch (err) {
    console.error("Error initializing user page:", err);
  } finally {
    setTableLoading(false);
  }


  // ======================
  // VIEW USER
  // ======================

  window.viewUser = async function(userId) {
    console.log("View user with ID:", userId);
    let userProfile = null;
    try {
      userProfile =
        await fetchUserProfile(userId);

    } catch (err) {
      console.error("Error initializing user page:", err);
    } finally {
      
    }

    // hide list
    document.getElementById("usersListView").style.display = "none";

    // show detail
    document.getElementById("userDetailView").style.display = "block";

    // set data
    document.getElementById("detailUsername").textContent =
      userProfile.name;

    document.getElementById("userLevel").textContent =
      userProfile.level;

    document.getElementById("userGold").textContent =
      userProfile.col;

    document.getElementById("userGems").textContent =
      userProfile.arcana_gems;

    await renderUserInventory(userId);
  }

  // ======================
  // RENDER INVENTORY
  // ======================

  async function renderUserInventory(userId) {
    const weaponList = document.getElementById("weaponList");
    // const itemList = document.getElementById("itemList");

    weaponList.innerHTML = "";
    // itemList.innerHTML = "";

    let userEquipment = null;
    try {
      userEquipment =
        await fetchUserInventory(userId);
        console.log("User Equipment:", userEquipment);
        
    } catch (err) {
      console.error("Error initializing user page:", err);
    } finally {
      
    }
    userEquipment.forEach((eq, index) => {
      weaponList.innerHTML += `
        <li>
          ${eq.catalog.name} (Lvl ${eq.level}, ${eq.star}★)
          <button onclick="removeWeapon(${index})">
            Remove
          </button>
        </li>
      `;
    });

    // selectedUser.items.forEach((item, index) => {
    //   itemList.innerHTML += `
    //     <li>
    //       ${item}
    //       <button onclick="removeItem(${index})">
    //         Remove
    //      </button>
    //    </li>
    //  `;
    //});
  }

  // ======================
  // ADD WEAPON
  // ======================

  function addWeapon() {
    const input = document.getElementById("newWeapon");

    const value = input.value.trim();

    if (!value) return;

    selectedUser.weapons.push(value);

    input.value = "";

    renderUserInventory();
  }

  // ======================
  // ADD ITEM
  // ======================

  function addItem() {
    const input = document.getElementById("newItem");

    const value = input.value.trim();

    if (!value) return;

    selectedUser.items.push(value);

    input.value = "";

    renderUserInventory();
  }

  // ======================
  // REMOVE WEAPON
  // ======================

  function removeWeapon(index) {
    selectedUser.weapons.splice(index, 1);

    renderUserInventory();
  }

  // ======================
  // REMOVE ITEM
  // ======================

  function removeItem(index) {
    selectedUser.items.splice(index, 1);

    renderUserInventory();
  }


  function closeUserDetail() {
    document.getElementById("usersListView").style.display = "block";

    document.getElementById("userDetailView").style.display = "none";
  }
}

