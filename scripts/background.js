'use strict';

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: "off",
    });
  });

chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check the current statge of the extension
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'off' ? 'on' : 'off'
  
  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === 'on') {
    console.log("Turning on refresh for tab " + tab.id)
    chrome.alarms.create({
      name: tab.id,
      alarmInfo: { periodInMinutes: 5 },
      callback: () => {
        // todo: refresh the tab
        console.log("Refreshing tab " + tab.id)
      }
    });
  } else {
    // turn off existing timer
    console.log("Turning off refresh for tab " + tab.id)
    chrome.alarms.clear({
      name: tab.id
    });
  }
});
