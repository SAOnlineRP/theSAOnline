function useSkill(user, target, skill) {
  const mpCost = getActualMpCost(user, skill);

  if (user.mp < mpCost) {
    console.log(`${user.name} tidak punya cukup MP!`);
    return;
  }

  user.mp -= mpCost;

  switch (skill.effect) {
    case "damage": {
      const dmg = Math.floor((skill.damage + user.atk) * (skill.multiplier || 1));
      applyDamage(target, dmg);
      console.log(`${user.name} menggunakan ${skill.name} dan memberi ${dmg} damage ke ${target.name}`);
      break;
    }

    case "heal": {
      const healAmount = skill.heal;
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      console.log(`${user.name} menggunakan ${skill.name} dan memulihkan ${healAmount} HP ke ${target.name}`);
      break;
    }

    case "buff": {
      target.buffs ||= [];
      target.buffs.push({
        type: skill.buffType,
        value: skill.buffValue,
        turns: skill.buffTurns
      });
      console.log(`${target.name} mendapat buff ${skill.buffType} +${skill.buffValue}%`);
      break;
    }

    case "shield": {
      target.shield = (target.shield || 0) + skill.shieldValue;
      console.log(`${target.name} mendapat shield ${skill.shieldValue}`);
      break;
    }

    case "debuff": {
      target.debuffs ||= [];
      target.debuffs.push({
        type: skill.debuffType,
        value: skill.debuffValue || 0,
        turns: skill.debuffTurns
      });
      console.log(`${target.name} terkena debuff ${skill.debuffType}`);
      break;
    }

    case "dot": {
      if (skill.damage) {
        const dmg = Math.floor((skill.damage + user.atk) * (skill.multiplier || 1));
        applyDamage(target, dmg);
      }

      target.dots ||= [];
      target.dots.push({
        value: skill.dotValue,
        turns: skill.dotTurns
      });

      console.log(`${target.name} terkena DOT ${skill.dotValue} selama ${skill.dotTurns} turn`);
      break;
    }

    case "breaker": {
      target.debuffs ||= [];
      target.debuffs.push({
        type: skill.breakType,
        value: skill.breakValue,
        turns: skill.breakTurns
      });
      console.log(`${target.name} armor/def turun ${skill.breakValue}%`);
      break;
    }

    case "cc": {
      target.cc = {
        type: skill.ccType,
        turns: skill.ccTurns
      };
      console.log(`${target.name} terkena ${skill.ccType}`);
      break;
    }

    case "cost_control": {
      target.buffs ||= [];
      target.buffs.push({
        type: "cost_reduction",
        value: skill.costReduce,
        turns: skill.costTurns
      });
      console.log(`${target.name} mendapat pengurangan MP cost ${skill.costReduce}%`);
      break;
    }

    case "utility": {
      console.log(`${user.name} menggunakan ${skill.name} dengan efek utility ${skill.utilityType}`);
      break;
    }
  }
}