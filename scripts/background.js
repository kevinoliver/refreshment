'use strict';

// todo: remove this
function log(text) {
  // todo: see about message passing to log on the main page 
  //const page = chrome.extension.getBackgroundPage()
  //page.console.log(text)
  console.log(text)
}

console.log("background.js loaded")
console.log("alarms: " + chrome.alarms)

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "off",
  });
});

function refreshment(tab, alarms, nextState) {
  console.log("refreshment for " + tab.id + " with nextState=" + nextState)
  //const alm = chrome.alarms
  console.log("alarms: " + alarms)
  if (nextState === 'on') {
    console.log("Turning on refresh for tab " + tab.id)
    alarms.create();
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
    console.log("Turning off refresh for tab " + tab.id)
    chrome.alarms.clear(
      tab.id
    );
  }
}

// todo: this needs sorting out
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check the current statge of the extension
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'off' ? 'on' : 'off'
  
  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    //files: ['scripts/refresh.js'] // todo: this is failing?
    func: refreshment,
    args: [tab, chrome.alarms, nextState]
  })
  .then(() => log("script injected"));
});

chrome.action.onClicked.addListener(async (tab) => {
  log("extension clicked")

  // // Retrieve the action badge to check the current statge of the extension
  // const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // const nextState = prevState === 'off' ? 'on' : 'off'
  
  // // Set the action badge to the next state
  // await chrome.action.setBadgeText({
  //   tabId: tab.id,
  //   text: nextState,
  // });

  // todo: sort this out
  if (false) {
    if (nextState === 'on') {
    log("Turning on refresh for tab " + tab.id)
    chrome.alarms.create({
    });
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
  }
});
