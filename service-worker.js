'use strict';

const REFRESH_PREFIX = "refresh_tab_id_"

function alarmNameForTabId(tabId) {
  return REFRESH_PREFIX + tabId
}

async function setBadgeText(tabId, isRefreshing) {
  // console.log("setting badge text to " + isRefreshing)
  return chrome.action.setBadgeText({
    tabId: tabId,
    text: isRefreshing ? "on" : ""
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check the current state of the extension
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const isRefreshing = prevState === ""
  
  setBadgeText(tab.id, isRefreshing)

  if (isRefreshing) {
    chrome.alarms.create(
      alarmNameForTabId(tab.id),
      { periodInMinutes: 1 }, // todo: set this to 5 
    );
  } else {
    chrome.alarms.clear(
      alarmNameForTabId(tab.id)
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete') {
    const alarm = await chrome.alarms.get(alarmNameForTabId(tabId))
    setBadgeText(tabId, alarm !== undefined)
  }
});