// todo: remove

console.log("refresh.js running")

// Retrieve the action badge to check the current statge of the extension
const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
const nextState = prevState === 'off' ? 'on' : 'off'

if (nextState === 'on') {
  log("Turning on refresh for tab " + tab.id)
  chrome.alarms.create({ });
    // chrome.alarms.create({
    //   name: tab.id,
    //   alarmInfo: { periodInMinutes: 5 },
    //   // callback: () => {
    //   //   // todo: refresh the tab
    //   //   log("Refreshing tab " + tab.id)
    //   // }
    // });
} else {
  // turn off existing timer
  log("Turning off refresh for tab " + tab.id)
  chrome.alarms.clear({
    name: tab.id
  });
}
