// Help (DESIGN.md "Screens": the Help tab — call for help, tell the surgeon, get the trolley or kit, activate the
// major haemorrhage protocol). Each is a real logged action ({ type: 'help', do }), so it shows in the events feed
// and is there for the debrief (M5); in M3.2 it has no physiological effect (the scenarios, M4, give it meaning).

export const HELP = [
  { do: 'callHelp', label: 'Call for help', ack: 'Help is on the way — another anaesthetist and an assistant are coming.' },
  { do: 'tellSurgeon', label: 'Tell the surgeon', ack: 'The surgeon is told and will pause or stop if you ask.' },
  { do: 'getTrolley', label: 'Get the difficult-airway trolley', ack: 'The difficult-airway trolley is being brought in.' },
  { do: 'majorHaemorrhage', label: 'Activate major haemorrhage protocol', ack: 'Major haemorrhage protocol activated — the lab is preparing blood and products.' },
];

// short past-tense labels for the events feed
export const HELP_EVENT = {
  callHelp: 'Called for help',
  tellSurgeon: 'Told the surgeon',
  getTrolley: 'Called for the difficult-airway trolley',
  majorHaemorrhage: 'Activated the major haemorrhage protocol',
};
