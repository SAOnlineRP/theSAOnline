class Character {
  constructor(
    name,
    hp,
    mp,
    atk,
    def,
    attackMultiplier,
    critRate = 0,
    critDamage = 1.5,
    skills = [],
    avatar = ""
  ) {
    this.name = name;

    this.maxHp = hp;
    this.hp = hp;

    this.maxMp = mp;
    this.mp = mp;

    this.baseAtk = atk;
    this.atk = atk;

    this.baseDef = def;
    this.def = def;

    this.attackMultiplier = attackMultiplier;

    this.baseCritRate = critRate;
    this.critRate = critRate;

    this.baseCritDamage = critDamage;
    this.critDamage = critDamage;

    this.shield = 0;
    this.maxShield = 0;

    this.skills = skills;
    this.buffs = [];
    this.avatar = avatar;

    this.recalcStats();
  }

  applyDamage(amount) {
    amount = Math.max(0, amount);

    let absorbed = 0;
    if (this.shield > 0) {
      absorbed = Math.min(amount, this.shield);
      this.shield -= absorbed;
      amount -= absorbed;
    }

    this.hp = Math.max(0, this.hp - amount);
    return { damage: amount + absorbed, absorbed };
  }

  calculateDamage(baseDamage) {
    const isCrit = Math.random() < this.critRate;
    let damage = baseDamage;

    if (isCrit) damage *= this.critDamage;

    return {
      damage: Math.max(0, Math.floor(damage)),
      isCrit
    };
  }

  recalcStats() {
    let atkBonus = 0;
    let defBonus = 0;
    let critRateBonus = 0;
    let critDmgBonus = 0;
    let shieldBonus = 0;

    this.buffs.forEach(buff => {
      if (buff.type === "atk_percent") atkBonus += buff.value;
      else if (buff.type === "def_percent") defBonus += buff.value;
      else if (buff.type === "crit_rate_percent") critRateBonus += buff.value;
      else if (buff.type === "crit_damage_percent") critDmgBonus += buff.value;
      else if (buff.type === "shield") shieldBonus += buff.value;
    });

    this.atk = Math.floor(this.baseAtk * (1 + atkBonus / 100));
    this.def = Math.floor(this.baseDef * (1 + defBonus / 100));
    this.critRate = Math.min(1, this.baseCritRate + critRateBonus / 100);
    this.critDamage = this.baseCritDamage * (1 + critDmgBonus / 100);

    this.maxShield = Math.max(0, Math.floor(shieldBonus));
    this.shield = Math.min(this.shield, this.maxShield);
  }

  attack(target) {
    let baseDamage = (this.atk * this.attackMultiplier) - target.def;
    baseDamage = Math.max(1, Math.floor(baseDamage));

    const { damage, isCrit } = this.calculateDamage(baseDamage);
    const result = target.applyDamage(damage);

    return { ...result, isCrit };
  }

  useSkill(skillIndex, target) {
    const skill = this.skills[skillIndex];
    if (!skill) return null;

    if (this.mp < skill.mpCost) return null;
    this.mp -= skill.mpCost;

    if (skill.effect === "damage") {
      let baseDamage = (skill.damage * (skill.multiplier || 1)) - target.def;
      baseDamage = Math.max(1, Math.floor(baseDamage));

      const { damage, isCrit } = this.calculateDamage(baseDamage);
      const result = target.applyDamage(damage);

      return { ...result, isCrit };
    }

    if (skill.effect === "heal") {
      const before = target.hp;
      target.hp = Math.min(target.maxHp, target.hp + skill.heal);
      const healed = target.hp - before;
      return { heal: healed };
    }

    if (skill.effect === "buff") {
      this.buffs.push({
        type: skill.buffType,
        value: skill.buffValue,
        turns: skill.buffTurns
      });

      if (skill.buffType === "shield") {
        this.shield += skill.buffValue;
      }

      this.recalcStats();
      this.shield = Math.min(this.shield, this.maxShield);

      return { buff: skill.buffValue };
    }

    return null;
  }

  endTurn() {
    this.buffs = this.buffs.filter(buff => {
      buff.turns--;
      return buff.turns > 0;
    });
    this.recalcStats();
  }
}

class Battle {
  constructor(player, enemies) {
    this.player = player;
    this.enemies = enemies;
    this.isPlayerTurn = true;
    this.battleLog = [];
    this.selectedSkill = null;
    this.selectedTarget = 0;
    this.turnCount = 1;
    this.turnOrder = [];
    this.turnIndex = 0;
  }

  startBattle() {
    this.generateTurnOrder();
    this.updateUI();
    this.updateTurnQueueUI();
    this.logMessage("Battle started!");
    }

  playerAction(action) {
    if (!this.isPlayerTurn) return;

    const player = this.player;
    let message = `${player.name} `;

    switch (action) {
      case "attack": {
        const targetEnemy = this.enemies[this.selectedTarget];

        if (targetEnemy && targetEnemy.hp > 0) {
          const result = player.attack(targetEnemy);
          message += `attacks ${targetEnemy.name} for ${result.damage} damage!`;
          if (result.absorbed > 0) message += ` (${result.absorbed} absorbed by shield!)`;
          if (result.isCrit) message += " (Critical!)";

          player.mp = Math.min(player.maxMp, player.mp + 5);
        } else {
          this.logMessage("Target is already defeated.");
          return;
        }
        break;
      }

      case "skill": {
        if (this.selectedSkill === null) return;

        const skill = player.skills[this.selectedSkill];
        if (!skill) return;

        if (player.mp < skill.mpCost) {
          this.logMessage(`${player.name} doesn't have enough MP!`);
          this.updateUI();
          return;
        }

        const target =
          (skill.effect === "heal" || skill.effect === "buff")
            ? player
            : this.enemies[this.selectedTarget];

        if (!target || (skill.effect === "damage" && target.hp <= 0)) {
          this.logMessage("Invalid target.");
          this.updateUI();
          return;
        }

        const result = player.useSkill(this.selectedSkill, target);
        if (!result) {
          this.logMessage(`${player.name} doesn't have enough MP!`);
          this.updateUI();
          return;
        }

        if (skill.effect === "damage") {
          message += `uses ${skill.name} on ${target.name} for ${result.damage} damage!`;
          if (result.absorbed > 0) message += ` (${result.absorbed} absorbed by shield!)`;
          if (result.isCrit) message += " (Critical!)";
        } else if (skill.effect === "heal") {
          message += `uses ${skill.name} and heals for ${result.heal} HP!`;
        } else if (skill.effect === "buff") {
          let buffDesc = skill.buffType;
          if (skill.buffType === "atk_percent") buffDesc = "ATK";
          else if (skill.buffType === "def_percent") buffDesc = "DEF";
          else if (skill.buffType === "crit_rate_percent") buffDesc = "Crit Rate";
          else if (skill.buffType === "crit_damage_percent") buffDesc = "Crit Damage";
          else if (skill.buffType === "shield") buffDesc = "Shield";

          message += `uses ${skill.name} and gains ${buffDesc} of ${result.buff}!`;
        }

        this.selectedSkill = null;
        break;
      }

      default:
        return;
    }

    this.logMessage(message);
    this.checkBattleEnd();

    if (!this.isBattleOver()) {
      this.isPlayerTurn = false;
      this.updateUI();

      setTimeout(() => {
        this.enemyTurn();
      }, 800);
    }
  }

  enemyTurn() {
    this.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        const result = enemy.attack(this.player);
        let msg = `${enemy.name} attacks ${this.player.name} for ${result.damage} damage!`;
        if (result.absorbed > 0) msg += ` (${result.absorbed} absorbed by shield!)`;
        this.logMessage(msg);
      }
    });

    this.player.endTurn();
    this.enemies.forEach(enemy => enemy.endTurn());

    this.turnCount++;
    this.checkBattleEnd();

    if (!this.isBattleOver()) {
      this.isPlayerTurn = true;
      this.updateUI();
    }
  }

  checkBattleEnd() {
    const enemiesAlive = this.enemies.some(enemy => enemy.hp > 0);

    if (this.player.hp <= 0) {
      this.logMessage("You lose!");
      this.endBattle();
      alert("You lose!");
    } else if (!enemiesAlive) {
      this.logMessage("You win!");
      this.endBattle();
      alert("You win!");
    }
  }

  isBattleOver() {
    return this.player.hp <= 0 || this.enemies.every(enemy => enemy.hp <= 0);
  }

  endBattle() {
    document.querySelectorAll(".btn").forEach(btn => {
      btn.disabled = true;
    });
  }

  updateUI() {
    const playerHealthBar = document.querySelector(".player-health-fill");
    const playerManaBar = document.querySelector(".player-mana-fill");
    const playerShieldText = document.querySelector(".player-shield");

    updateHP(this.player.hp, this.player.maxHp, playerHealthBar);
    updateMP(this.player.mp, this.player.maxMp, playerManaBar);

    if (this.player.maxShield > 0) {
      playerShieldText.textContent = `Shield: ${this.player.shield} / ${this.player.maxShield}`;
    } else {
      playerShieldText.textContent = "";
    }

    const targetEnemy = this.enemies[this.selectedTarget];
    if (targetEnemy) {
      document.querySelector(".enemy-card .name").textContent =
        targetEnemy.hp <= 0 ? `DEAD - ${targetEnemy.name}` : targetEnemy.name;

      document.querySelector(".enemy-hp-label").textContent =
        `HP: ${targetEnemy.hp} / ${targetEnemy.maxHp}`;

      document.querySelector(".enemy-atk").textContent =
        `ATK: ${targetEnemy.atk}`;

      document.querySelector(".enemy-def").textContent =
        `DEF: ${targetEnemy.def}`;

      const enemyHealthBar = document.querySelector(".enemy-health-fill");
      updateHP(targetEnemy.hp, targetEnemy.maxHp, enemyHealthBar);

      const enemySection = document.querySelector(".enemy-section");
      enemySection.classList.toggle("dead", targetEnemy.hp <= 0);
    }

    const turnIndicator = document.querySelector(".turn-indicator");
    if (turnIndicator) {
      turnIndicator.textContent = this.isPlayerTurn
        ? `${this.player.name}'s turn`
        : `Enemies' turn`;
    }

    const turnNumber = document.getElementById("turn-number");
    if (turnNumber) {
      turnNumber.textContent = this.turnCount;
    }
    this.updateTurnQueueUI(); 
  }

  logMessage(message) {
    this.battleLog.push(message);
    this.updateBattleLog();
  }

  updateBattleLog() {
    const logElement = document.getElementById("battle-log");
    if (!logElement) return;

    logElement.innerHTML = this.battleLog
        .map(entry => `<div class="log-entry">${entry}</div>`)
        .join("");

    logElement.scrollTop = logElement.scrollHeight;
    }

    generateTurnOrder() {
        const aliveEnemies = this.enemies.filter(enemy => enemy.hp > 0);
        this.turnOrder = [this.player, ...aliveEnemies];
        this.turnIndex = 0;
    }

    updateTurnQueueUI() {
        const currentBox = document.getElementById("current-turn-avatar");
        const nextBox = document.getElementById("next-turn-avatar");
        const queueBox = document.getElementById("turn-queue");
        const turnIndicator = document.querySelector(".turn-indicator");

        const aliveEnemies = this.enemies.filter(enemy => enemy.hp > 0);

        let currentUnit;
        let previewQueue;

        if (this.isPlayerTurn) {
            currentUnit = this.player;
            previewQueue = [...aliveEnemies, this.player];
        } else {
            currentUnit = aliveEnemies[0] || this.player;
            previewQueue = [...aliveEnemies.slice(1), this.player];
        }

        if (currentBox) {
            currentBox.style.backgroundImage = currentUnit?.avatar
            ? `url('${currentUnit.avatar}')`
            : "none";
        }

        if (turnIndicator) {
            turnIndicator.textContent = currentUnit
            ? `${currentUnit.name}'s turn`
            : "-";
        }

        if (nextBox) {
            const nextUnit = previewQueue[0];
            nextBox.style.backgroundImage = nextUnit?.avatar
            ? `url('${nextUnit.avatar}')`
            : "none";
        }

        if (queueBox) {
            queueBox.innerHTML = "";

            previewQueue.slice(1, 6).forEach(unit => {
            const div = document.createElement("div");
            div.className = "turn-avatar-box";
            if (unit?.avatar) {
                div.style.backgroundImage = `url('${unit.avatar}')`;
            }
            queueBox.appendChild(div);
            });

            while (queueBox.children.length < 3) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "turn-avatar-box";
            queueBox.appendChild(emptyDiv);
            }
        }
    }

    advanceTurnOrder() {
        if (this.turnOrder.length > 0) {
            const first = this.turnOrder.shift();
            this.turnOrder.push(first);
        }

        this.turnOrder = this.turnOrder.filter(unit => unit.hp > 0);

        if (!this.turnOrder.includes(this.player) && this.player.hp > 0) {
            this.turnOrder.unshift(this.player);
        }

        this.updateTurnQueueUI();
    }
}

function updateHP(current, max, barFillEl) {
  if (!barFillEl) return;

  const percent = Math.max(0, (current / max) * 100);
  barFillEl.style.width = percent + "%";

  if (percent > 60) {
    barFillEl.style.background = "#4caf50";
  } else if (percent > 30) {
    barFillEl.style.background = "#ffc107";
  } else {
    barFillEl.style.background = "#f44336";
  }

  let text = barFillEl.querySelector(".health-text");
  if (!text) {
    text = document.createElement("span");
    text.className = "health-text";
    barFillEl.appendChild(text);
  }

  text.textContent = `${current} / ${max}`;
}

function updateMP(current, max, barFillEl) {
  if (!barFillEl) return;

  const percent = Math.max(0, (current / max) * 100);
  barFillEl.style.width = percent + "%";
  barFillEl.style.background = "#2196f3";

  let text = barFillEl.querySelector(".mana-text");
  if (!text) {
    text = document.createElement("span");
    text.className = "mana-text";
    barFillEl.appendChild(text);
  }

  text.textContent = `${current} / ${max}`;
}

function goBack() {
  history.back();
}

function goHome() {
  window.location.href = "/";
}

const player = new Character(
  "Hero A",
  200,
  50,
  25,
  15,
  0.8,
  0.2,
  1.5,
  [
    { name: "Fireball", effect: "damage", damage: 40, multiplier: 1.2, mpCost: 10 },
    { name: "Shadow Strike", effect: "heal", heal: 30, mpCost: 12 },
    { name: "Flame Burst", effect: "buff", buffType: "def_percent", buffValue: 10, buffTurns: 2, mpCost: 10 },
    { name: "Critical Boost", effect: "buff", buffType: "crit_rate_percent", buffValue: 20, buffTurns: 2, mpCost: 15 },
    { name: "Protective Barrier", effect: "buff", buffType: "shield", buffValue: 30, buffTurns: 2, mpCost: 12 }
  ],
  "/img/avatar.png"
);
const enemies = [
  new Character("Slime", 100, 0, 10, 5, 1.0, 0, 1.5, [], "/img/slime.png")
];

const battle = new Battle(player, enemies);

document.addEventListener("DOMContentLoaded", () => {
  battle.startBattle();

  const attackBtn = document.querySelector(".attack-btn");
  if (attackBtn) {
    attackBtn.addEventListener("click", () => {
      battle.playerAction("attack");
    });
  }

  document.querySelectorAll(".skill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!battle.isPlayerTurn) return;

      battle.selectedSkill = Number(btn.dataset.skill);
      battle.playerAction("skill");
    });
  });

  const logModal = document.getElementById("log-modal");
  const openLogBtn = document.getElementById("open-log-btn");
  const closeLogBtn = document.getElementById("close-log-btn");

  if (openLogBtn && logModal) {
    openLogBtn.addEventListener("click", () => {
      logModal.classList.add("show");
    });
  }

  if (closeLogBtn && logModal) {
    closeLogBtn.addEventListener("click", () => {
      logModal.classList.remove("show");
    });
  }

  if (logModal) {
    logModal.addEventListener("click", (e) => {
      if (e.target === logModal) {
        logModal.classList.remove("show");
      }
    });
  }
});