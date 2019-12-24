import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import {formatNumber} from 'common/format';
import ItemDamageDone from 'interface/ItemDamageDone';
import Analyzer from 'parser/core/Analyzer';

/**
 * Vigilant's Bloodshaper -
 * Equip: Your damaging spells have a chance to launch an orb of charged blood at your target,
 * dealing 0 shadow damage split among all nearby enemeies.
 *
 * Test Log: /report/cXZyQ39VMgBL4n21/1-LFR+Champion+of+the+Light+-+Kill+(2:32)/Meletya
 */


class VigilantsBloodshaper extends Analyzer {
  damage = 0;
  hits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.VIGILANTS_BLOODSHAPER.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOLATILE_BLOOD_EXPLOSION.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.hits += 1;
    }
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Hit <strong>{this.hits}</strong> targets, causing <strong>{formatNumber(this.damage)}</strong> damage.</>}
      >
        <BoringItemValueText item={ITEMS.VIGILANTS_BLOODSHAPER}>
          <ItemDamageDone amount={this.damage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}


export default VigilantsBloodshaper;
