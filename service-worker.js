'use strict';

const ALARM_NAME_PREFIX = "refresh_tab_id_"
const BADGE_STATE_ON = "on"
const BADGE_STATE_OFF = ""

/**
 * Alarms are named using the format: `$ALARM_NAME_PREFIX$tabId`
 */
function alarmNameForTabId(tabId) {
  return ALARM_NAME_PREFIX + tabId
}

/**
 * Updates the extension's icon to reflect the current state.
 */
async function updateIcon(tabId, isRefreshing) {
  return chrome.action.setBadgeText({
    tabId: tabId,
    text: isRefreshing ? BADGE_STATE_ON : BADGE_STATE_OFF
  }).then(
    chrome.action.setTitle({
      tabId: tabId,
      title: isRefreshing 
        ? "Refreshing every 5 minutes. Click to stop refreshing."
        : "Click to refresh this tab every 5 minutes." 
    })
  );
}

// Handles turning on/off the refreshing
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check the current state of the extension
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const isRefreshing = prevState === BADGE_STATE_OFF
  
  updateIcon(tab.id, isRefreshing)

  if (isRefreshing) {
    chrome.alarms.create(
      alarmNameForTabId(tab.id),
      { periodInMinutes: 5 },
    );
  } else {
    chrome.alarms.clear(
      alarmNameForTabId(tab.id)
    );
  }
});

// Does the refreshing when the alarms fire
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(ALARM_NAME_PREFIX)) {
    return
  }
  const stripped = alarm.name.slice(ALARM_NAME_PREFIX.length)
  const tabId = Number(stripped) 
  chrome.tabs.reload(tabId)
});

// Keeps the extension's badge state up-to-date
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _tab) => {
  if (changeInfo.status == 'complete') {
    const alarm = await chrome.alarms.get(alarmNameForTabId(tabId))
    updateIcon(tabId, alarm !== undefined)
  }
});
