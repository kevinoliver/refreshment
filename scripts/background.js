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
    chrome.alarms.create({
      name: tab.id,
      alarmInfo: { periodInMinutes: 5 },
      callback: () => {
        // todo: refresh the tab
      }
    });
  } else {
    // turn off existing timer
    chrome.alarms.clear({
      name: tab.id
    });
  }
});
