function loading() {
    renderPluginError('...');
}

async function playSound(source, volume) {
    try {
        await createOffscreen();
        await chrome.runtime.sendMessage({ play: { source, volume } });
    } catch (e) {
        console.log(e);
    }
}

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing audio notifications'
    });
}

var wigoUrl = null;
var defaultSoundUrl = 'alarm.mp3';
var soundUrl = defaultSoundUrl;
var soundVolume = 1;
var downHosts = [];
var hostsStatuses = {};
chrome.action.setPopup({ 'popup': 'popup.html' });

function updateMonitoring() {
    downHosts = [];
    hostsStatuses = {
        'ok': [],
        'info': [],
        'warn': [],
        'crit': [],
        'err': []
    };
    chrome.storage.sync.get(null, function (options) {
        if (options.hasOwnProperty('soundVolume')) {
            soundVolume = options.soundVolume;
        }
        if (options.hasOwnProperty('soundUrl')) {
            soundUrl = options.soundUrl;
        }
        if (options.hasOwnProperty('wigoUrl')) {
            wigoUrl = options.wigoUrl;
            loadGroups();
        } else {
            renderPluginError('CONF');
        }
    });
}

function loadGroups() {
    fetch(wigoUrl + "/api/groups")
        .then(res => res.json())
        .then(function (data) {
            data.forEach((group, i) => {
                loadHostsInGroup(group);
            });
        })
        .catch(function (err) {
            renderPluginError('ERR');
            throw err;
        });
}

function loadHostsInGroup(group) {
    fetch(wigoUrl + "/api/groups/" + group)
        .then(res => res.json())
        .then(function (data) {
            data.Hosts.forEach((host, i) => {
                handleHost(host);
            });
            updateDisplay();
        })
        .catch(function (err) {
            renderPluginError('ERR');
            throw err;
        });
}

function handleHost(host) {
    if (!host.IsAlive) {
        downHosts.push(host.Name);
    }
    if (host.Status > 100 && host.Status < 200) {
        hostsStatuses['info'].push(host.Name);
    } else if (host.Status >= 200 && host.Status < 300) {
        hostsStatuses['warn'].push(host.Name);
    } else if (host.Status >= 300 && host.Status < 500) {
        hostsStatuses['crit'].push(host.Name);
    } else if (host.Status >= 500) {
        hostsStatuses['err'].push(host.Name);
    } else {
        hostsStatuses['ok'].push(host.Name);
    }
}

function updateDisplay() {
    var currentStatus = 'ok';
    var currentNb = 0;
    if (hostsStatuses['err'].length) {
        currentStatus = 'err';
        currentNb = hostsStatuses['err'].length;
    } else if (hostsStatuses['crit'].length) {
        currentStatus = 'crit';
        currentNb = hostsStatuses['crit'].length;
    } else if (hostsStatuses['warn'].length) {
        currentStatus = 'warn';
        currentNb = hostsStatuses['warn'].length;
    } else if (hostsStatuses['info'].length) {
        currentStatus = 'info';
        currentNb = hostsStatuses['info'].length;
    } else if (hostsStatuses['ok'].length) {
        currentStatus = 'ok';
        currentNb = hostsStatuses['ok'].length;
    }

    if (downHosts.length) {
        if (soundVolume || soundUrl) {
            playSound(soundUrl, soundVolume)
        }
        renderWigoError(downHosts.length + " KO", currentStatus);
    } else {
        renderWigoOk(currentNb + "", currentStatus);
    }
}



function renderWigoOk(text, level) {
    chrome.action.setIcon({ path: "wigo-green.png" });
    if (level == 'crit') {
        chrome.action.setBadgeBackgroundColor({ color: '#ed5565' });
    } else if (level == 'info') {
        chrome.action.setBadgeBackgroundColor({ color: '#4fc1e9' });
    } else if (level == 'warn') {
        chrome.action.setBadgeBackgroundColor({ color: '#ffce54' });
    } else if (level == 'err') {
        chrome.action.setBadgeBackgroundColor({ color: '#535B67' });
    } else if (level == 'ok') {
        chrome.action.setBadgeBackgroundColor({ color: '#a0d468' });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: '#aab2bd' });
    }
    chrome.action.setBadgeText({ text: text });
}

function renderWigoError(text, level) {
    chrome.action.setIcon({ path: "wigo-red.png" });
    if (level == 'crit') {
        chrome.action.setBadgeBackgroundColor({ color: '#ed5565' });
    } else if (level == 'info') {
        chrome.action.setBadgeBackgroundColor({ color: '#4fc1e9' });
    } else if (level == 'warn') {
        chrome.action.setBadgeBackgroundColor({ color: '#ffce54' });
    } else if (level == 'err') {
        chrome.action.setBadgeBackgroundColor({ color: '#535B67' });
    } else if (level == 'ok') {
        chrome.action.setBadgeBackgroundColor({ color: '#a0d468' });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: '#aab2bd' });
    }
    chrome.action.setBadgeText({ text: text });
}

function renderPluginError(text) {
    chrome.action.setIcon({ path: "wigo-blue.png" });
    chrome.action.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.action.setBadgeText({ text: text });
}

