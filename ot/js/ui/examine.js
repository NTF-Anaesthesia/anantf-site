// Examine (DESIGN.md "Screens": the Examine tab — chest, skin, pupils, movement, breath sounds as text). A read-only
// clinical read of the model: it changes nothing, it just reports the findings a trainee would get at the bedside,
// derived from the current state so they always agree with the monitor. Pure, so a unit test can check it.

export function examine(state) {
  const { gas, aw, pd, temp, resp } = state;
  const sao2 = Math.round(gas.sao2);                     // gas.sao2 is already a percentage (what the monitor shows)
  const out = [];

  // chest movement: ventilated, spontaneous, or apnoeic
  let chest;
  if (resp.mode !== 'spont') chest = 'The chest rises symmetrically with each ventilator breath.';
  else if (resp.apnoea) chest = 'No spontaneous breathing — the chest is not moving.';
  else chest = `Spontaneous breathing: the chest rises about ${Math.round(resp.rr)} times a minute.`;
  out.push(['Chest movement', chest]);

  // breath sounds: from the airway (misplaced tube, one lung, obstruction, or little getting through)
  let bs;
  if (aw.device === 'ett' && aw.placement === 'oesophageal') bs = 'No breath sounds in the chest; gurgling is heard over the stomach — the tube is not in the trachea.';
  else if (aw.oneLung) bs = 'Air entry is reduced on one side, much louder on the other — the tube is down one main bronchus.';
  else if (aw.obstruction > 0.3 && aw.device !== 'ett' && aw.device !== 'sad') bs = 'Noisy, obstructed breathing with little air moving — open the airway.';
  else if (aw.toLungs < 0.3) bs = 'Very little air entry — almost nothing is reaching the lungs.';
  else bs = 'Breath sounds are equal on both sides, clear, with no added sounds.';
  out.push(['Breath sounds', bs]);

  // skin: colour (oxygenation), temperature, sweat (sympathetic drive)
  const colour = sao2 < 85 ? 'Centrally cyanosed — blue lips and tongue.' : sao2 < 92 ? 'Dusky, not quite pink.' : 'Pink.';
  const warmth = temp.core < 35 ? `Cold (core ${temp.core.toFixed(1)} °C).` : temp.core < 36 ? `Cool peripheries (core ${temp.core.toFixed(1)} °C).` : 'Warm and well perfused.';
  const sweat = pd.auto > 0.5 ? ' Sweaty — a sympathetic response.' : '';
  out.push(['Skin', `${colour} ${warmth}${sweat}`]);

  // pupils: depth and opioid effect
  out.push(['Pupils', pd.asleep
    ? 'Small to mid-size, reacting sluggishly (anaesthetised; opioids constrict them further).'
    : 'Mid-size and briskly reactive to light; the patient may open the eyes.']);

  // movement and tone: paralysis vs depth
  const t1 = pd.nmb && pd.nmb.t1 != null ? pd.nmb.t1 : 1;
  out.push(['Movement and tone', t1 < 0.1
    ? 'No movement — the patient is paralysed (neuromuscular block).'
    : !pd.asleep ? 'Moving, or will move to voice or touch.'
      : 'Still, but not paralysed — could move to a strong stimulus.']);

  return out;
}
