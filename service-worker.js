'use strict';

const REFRESH_PREFIX = "refresh_tab_id_"

chrome.runtime.onInstalled.addListener(() => {
  // todo: this isn't working right. 
  // it shows as off after the page reloads
  // not sure where it gets from after the reload as this does not fire again
  // and the other place we set badge text is in an event handler for onClicked.
  // looks like this is set globally and when the page refreshes this is lost.
  console.log("runtime installed. setting badge text to 'off'")
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
    chrome.alarms.create(
      REFRESH_PREFIX + tab.id,
      { periodInMinutes: 1 }, // todo: set this to 5 
    );
  } else {
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
  chrome.tabs.reload(tabId)
});
