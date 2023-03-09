'use strict';

const ALARM_NAME_PREFIX = "refresh_tab_id_"
const BADGE_STATE_ON = "on"
const BADGE_STATE_OFF = ""

/**
 * Alarms are encoded using the format: `$ALARM_NAME_PREFIX$tabId`.
 *
 * See `tabIdFromAlarmName` for decoding.
 */
function alarmNameForTabId(tabId) {
  return ALARM_NAME_PREFIX + tabId
}

/**
 * Returns the tabId as a number from the given alarm name.
 * If the alarm name is not a valid encoding, returns undefined.
 *
 * See `alarmNameForTabId` for encoding a tabId into an alarm name.
 */
function tabIdFromAlarmName(alarmName) {
  if (!alarmName.startsWith(ALARM_NAME_PREFIX)) {
    return undefined
  }
  const stripped = alarmName.slice(ALARM_NAME_PREFIX.length)
  return Number(stripped)
}

async function removeAlarm(tabId) {
  return chrome.alarms.clear(
    alarmNameForTabId(tabId)
  ).then(
    updateIcon(tabId, false)
  )
}

async function createAlarm(tabId) {
  chrome.alarms.create(
    alarmNameForTabId(tabId),
    { periodInMinutes: 0.1 }, // todo: set to 5 minutes
  )
  return updateIcon(tabId, true)
}

/**
 * Updates the extension's icon to reflect the current state.
 */
async function updateIcon(tabId, isRefreshing) {
  try {
    await chrome.action.setBadgeText({
      tabId: tabId,
      text: isRefreshing ? BADGE_STATE_ON : BADGE_STATE_OFF
    })
    await chrome.action.setTitle({
      tabId: tabId,
      title: isRefreshing 
        ? "Refreshing every 5 minutes. Click to stop refreshing."
        : "Click to refresh this tab every 5 minutes." 
    })
  } catch (error) {
    // These calls can fail if the tab no longer exists. The alarm is not
    // removed here as this function will be called when a tab is closed and
    // that would trigger an infinite loop.
    console.debug("updateIcon failed for tabId=" + tabId + " " + error)
  }
}

// Handles turning on/off the refreshing
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check the current state of the extension
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const isRefreshing = prevState === BADGE_STATE_OFF
  
  console.debug("onClicked for tabId=" + tab.id + ", isRefreshing=" +  isRefreshing)
  if (isRefreshing) {
    createAlarm(tab.id)
  } else {
    removeAlarm(tab.id)
  }
});

// Does the refreshing when the alarms fire
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const tabId = tabIdFromAlarmName(alarm.name)
  if (tabId === undefined) {
    return
  }
  console.debug("Reloading tabId=" + tabId)
  try {
    await chrome.tabs.get(tabId)
    await chrome.tabs.reload(tabId)
  } catch (error) {
    console.debug("Reload failed for tabId=" + tabId + " " + error)
    removeAlarm(tabId)
  }
});

// Keeps the extension's badge state up-to-date
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _tab) => {
  if (changeInfo.status == 'complete') {
    const alarm = await chrome.alarms.get(alarmNameForTabId(tabId))
    updateIcon(tabId, alarm !== undefined)
  }
});

// Remove any alarms when a tab is closed
chrome.tabs.onRemoved.addListener(async (tabId, _removeInfo) => {
  const alarm = await chrome.alarms.get(alarmNameForTabId(tabId))
  if (alarm !== undefined) {
    removeAlarm(tabId)
  }
});
