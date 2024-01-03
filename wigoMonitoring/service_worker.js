importScripts(
    './plugin.js'
);

chrome.alarms.onAlarm.addListener(() => {
    updateMonitoring();
});

async function start() {
    loading();
    updateMonitoring();
    let alarm = await chrome.alarms.get();
    if(!alarm)  {
        chrome.alarms.create({ periodInMinutes: 0.5 });
    }
}
start();

chrome.runtime.onMessage.addListener(msg => {
    if ('updateMonitoring' in msg) {
        start();
    }
});

chrome.runtime.onStartup.addListener(() => {
    start();
});