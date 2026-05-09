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

// ======================
// VIEW USER
// ======================

function viewUser(userId) {
  const user = usersData.find(u => u.id === userId);

  if (!user) return;

  selectedUser = user;

  // hide list
  document.getElementById("usersListView").style.display = "none";

  // show detail
  document.getElementById("userDetailView").style.display = "block";

  // set data
  document.getElementById("detailUsername").textContent =
    user.username;

  document.getElementById("userLevel").textContent =
    user.level;

  document.getElementById("userGold").textContent =
    user.gold;

  document.getElementById("userGems").textContent =
    user.gems;

  renderUserInventory();
}

// ======================
// RENDER INVENTORY
// ======================

function renderUserInventory() {
  const weaponList = document.getElementById("weaponList");
  const itemList = document.getElementById("itemList");

  weaponList.innerHTML = "";
  itemList.innerHTML = "";

  selectedUser.weapons.forEach((weapon, index) => {
    weaponList.innerHTML += `
      <li>
        ${weapon}
        <button onclick="removeWeapon(${index})">
          Remove
        </button>
      </li>
    `;
  });

  selectedUser.items.forEach((item, index) => {
    itemList.innerHTML += `
      <li>
        ${item}
        <button onclick="removeItem(${index})">
          Remove
        </button>
      </li>
    `;
  });
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