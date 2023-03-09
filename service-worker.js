'use strict';

const REFRESH_PREFIX = "refresh_tab_id_"

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "off",
  });
});

function refreshment() {
  location.reload()
}

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
    chrome.alarms.create(
      REFRESH_PREFIX + tab.id,
      { periodInMinutes: 1 }, // todo: set this to 5 
    );
  } else {
    // turn off existing timer
    console.log("Turning off refresh for tab " + tab.id)
    chrome.alarms.clear(
      REFRESH_PREFIX + tab.id
    );
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(REFRESH_PREFIX)) {
    return
  }
  const stripped = alarm.name.slice(REFRESH_PREFIX.length)
  const tabId = Number(stripped) 
  chrome.scripting.executeScript({
    target: { tabId : tabId },
    func: refreshment,
  });
});
