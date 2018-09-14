import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';

// Example Log: https://www.warcraftlogs.com/reports/Lv28aNzMQJhqx9H1#fight=1&type=healing
class PermeatingGlow extends Analyzer {
  permiatingGlowBuffs = {};
  permiatingGlowProcAmount = 0;
  permiatingGlowTotalHealAmount = 0;
  permiatingGlowTotalOverHealAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PERMEATING_GLOW_TALENT.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.PERMEATING_GLOW_TALENT.id) || [];

    this.permiatingGlowProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PERMEATING_GLOW_TALENT.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FLASH_HEAL.id) {
      if (this.permiatingGlowBuffs[event.targetID.toString()]) {
        let eventHealing = this.permiatingGlowProcAmount;
        let eventOverhealing = 0;

        if (event.overheal) {
          eventOverhealing = Math.min(this.permiatingGlowProcAmount, event.overheal);
          eventHealing -= eventOverhealing;
        }

        this.permiatingGlowTotalHealAmount += eventHealing;
        this.permiatingGlowTotalOverHealAmount += eventOverhealing;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PERMEATING_GLOW_BUFF.id) {
      this.permiatingGlowBuffs[event.targetID.toString()] = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PERMEATING_GLOW_BUFF.id) {
      delete(this.permiatingGlowBuffs[event.targetID.toString()]);
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PERMEATING_GLOW_TALENT.id}
        value={(
          <React.Fragment>
            {formatThousands(this.permiatingGlowTotalHealAmount)} Bonus Healing.<br />
            {formatPercentage(this.permiatingGlowTotalOverHealAmount / (this.permiatingGlowTotalOverHealAmount + this.permiatingGlowTotalHealAmount))}% Overhealing.<br />
          </React.Fragment>
        )}
      />
    );
  }
}

export default PermeatingGlow;
