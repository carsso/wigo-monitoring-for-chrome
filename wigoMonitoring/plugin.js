function loading() {
    renderPluginError('...');
}

async function playSound(source, volume) {
    console.debug("Playing sound " + source + " with volume " + volume);
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

var defaultSoundUrl = 'alarm.mp3';
var soundUrl = defaultSoundUrl;
var soundVolume = 1;
chrome.action.setPopup({ 'popup': 'popup.html' });

async function updateMonitoring() {
    chrome.storage.sync.get(null, async function (options) {
        if (options.hasOwnProperty('soundVolume') && options.soundVolume) {
            soundVolume = options.soundVolume;
        }
        if (options.hasOwnProperty('soundUrl') && options.soundUrl) {
            soundUrl = options.soundUrl;
        }
        if (options.hasOwnProperty('wigoUrl') && options.wigoUrl) {
            let hostsStatuses = await loadGroups(options.wigoUrl);
            updateDisplay(hostsStatuses);
        } else {
            renderPluginError('CONF');
        }
    });
}

async function loadGroups(wigoUrl) {
    let hostsStatuses = {};
    try {
        console.debug("Listing groups");
        let response = await fetch(wigoUrl + "/api/groups");
        let data = await response.json();
        console.debug("Groups found:", data);
        for (const group of data) {
            let groupHostsStatuses = await loadHostsInGroup(wigoUrl, group);
            Object.entries(groupHostsStatuses).forEach(([hostName, status]) => {
                if (!hostsStatuses.hasOwnProperty(status)) {
                    hostsStatuses[status] = [];
                }
                hostsStatuses[status].push(hostName);
            });
        }
    } catch(error) {
        renderPluginError('ERR');
        console.error(error);
        throw error;
    }
    console.debug("Global status:", hostsStatuses);
    return hostsStatuses;
}

async function loadHostsInGroup(wigoUrl, group) {
    let groupHostsStatuses = {};
    console.debug("Loading group " + group);
    try {
        let response = await fetch(wigoUrl + "/api/groups/" + group);
        let data = await response.json();
        data.Hosts.forEach((host, i) => {
            groupHostsStatuses[host.Name] = getHostStatus(host);
        });
    } catch(error) {
        renderPluginError('ERR');
        console.error(error);
        throw error;
    }
    console.debug("Group status " + group + ":", groupHostsStatuses);
    return groupHostsStatuses;
}

function getHostStatus(host) {
    if (!host.IsAlive) {
        return 'down';
    }
    if (host.Status > 100 && host.Status < 200) {
        return 'info';
    }
    if (host.Status >= 200 && host.Status < 300) {
        return 'warn';
    }
    if (host.Status >= 300 && host.Status < 500) {
        return 'crit';
    }
    if (host.Status >= 500) {
        return 'err';
    }
    return 'ok';
}

function updateDisplay(hostsStatuses) {
    var currentStatus = 'ok';
    var currentNb = 0;
    for (var status of ['down', 'err', 'crit', 'warn', 'info', 'ok']) {
        if (hostsStatuses.hasOwnProperty(status) && hostsStatuses[status].length) {
            currentStatus = status;
            currentNb = hostsStatuses[status].length;
            console.debug("Status " + status + " has " + currentNb + " hosts");
            break;
        }
        console.debug("Status " + status + " is empty");
    }
    console.debug("Updating display with status " + currentStatus + " and nb " + currentNb);

    if(currentStatus == 'down') {
        if (soundVolume && soundUrl) {
            playSound(soundUrl, soundVolume)
        }
    }
    renderWigo(currentNb + "", currentStatus);
}

function renderWigo(text, level) {
    let icon = 'wigo-green.png';
    let color = '#aab2bd';
    if (level == 'down') {
        icon = 'wigo-red.png';
    } else if (level == 'crit') {
        color = '#ed5565';
    } else if (level == 'info') {
        color = '#4fc1e9';
    } else if (level == 'warn') {
        color = '#ffce54';
    } else if (level == 'err') {
        color = '#535B67';
    } else if (level == 'ok') {
        color = '#a0d468';
    }
    console.debug("Rendering icon " + icon + " with color " + color + " and text " + text);
    chrome.action.setBadgeBackgroundColor({ color: color });
    chrome.action.setIcon({ path: icon });
    chrome.action.setBadgeText({ text: text });
}

function renderPluginError(text) {
    console.debug("Rendering error icon with text " + text);
    chrome.action.setIcon({ path: "wigo-blue.png" });
    chrome.action.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.action.setBadgeText({ text: text });
}

