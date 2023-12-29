importScripts(
    './plugin.js'
);

function start() {
    loading();
    updateMonitoring();
    setInterval(function () {
        updateMonitoring();
    }, 30 * 1000); // 60 * 1000 milsec
}
start();

chrome.runtime.onMessage.addListener(msg => {
    if ('updateMonitoring' in msg) {
        loading();
        updateMonitoring();
    }
});

chrome.runtime.onStartup.addListener( () => {
    console.log(`onStartup()`);
});