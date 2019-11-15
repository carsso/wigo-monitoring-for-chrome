function loading() {
    renderPluginError('...');
}

var myAudio = new Audio();
var wigoUrl = null;
var defaultSoundUrl = 'alarm.mp3';
var soundUrl = defaultSoundUrl;
var soundVolume = 1;
var downHosts = [];
var hostsStatuses = {};
chrome.browserAction.setPopup({'popup': 'popup.html'});

function updateMontioring() {
    downHosts = [];
    hostsStatuses = {
        'ok': [],
        'info': [],
        'warn': [],
        'crit': [],
        'err': []
    };
    chrome.storage.sync.get(null, function(options) {
        if(options.hasOwnProperty('soundVolume')){
            soundVolume = options.soundVolume;
        }
        if(options.hasOwnProperty('soundUrl')){
            soundUrl = options.soundUrl;
        }
        if(options.hasOwnProperty('wigoUrl')){
            wigoUrl = options.wigoUrl; 
            loadGroups();
        } else {
            renderPluginError('CONF');
        }
    });
}

function loadGroups() {
    jQuery.getJSON(wigoUrl+"/api/groups").done(function(data) {
        $.each(data, function(i, group) {
            loadHostsInGroup(group);
        });
    }).fail(function() {
        renderPluginError('ERR');
    });
}

function loadHostsInGroup(group) {
    jQuery.getJSON(wigoUrl+"/api/groups/"+group).done(function(data) {
        $.each(data.Hosts, function(i, host) {
            handleHost(host);
        });
        updateDisplay();
    }).fail(function() {
        renderPluginError('ERR');
    });
}

function handleHost(host) {
    if(!host.IsAlive) {
        downHosts.push(host.Name);
    }
    if(host.Status > 100 && host.Status < 200) {
        hostsStatuses['info'].push(host.Name);
    } else if(host.Status >= 200 && host.Status < 300) {
        hostsStatuses['warn'].push(host.Name);
    } else if(host.Status >= 300 && host.Status < 500) {
        hostsStatuses['crit'].push(host.Name);
    } else if(host.Status >= 500) {
        hostsStatuses['err'].push(host.Name);
    } else {
        hostsStatuses['ok'].push(host.Name);
    }
}

function updateDisplay() {
    var currentStatus = 'ok';
    var currentNb = 0;
    if(hostsStatuses['err'].length) {
        currentStatus = 'err';
        currentNb = hostsStatuses['err'].length;
    } else if(hostsStatuses['crit'].length) {
        currentStatus = 'crit';
        currentNb = hostsStatuses['crit'].length;
    } else if(hostsStatuses['warn'].length) {
        currentStatus = 'warn';
        currentNb = hostsStatuses['warn'].length;
    } else if(hostsStatuses['info'].length) {
        currentStatus = 'info';
        currentNb = hostsStatuses['info'].length;
    } else if(hostsStatuses['ok'].length) {
        currentStatus = 'ok';
        currentNb = hostsStatuses['ok'].length;
    }

    if(downHosts.length) {
        if(soundVolume || soundUrl){
            myAudio.pause();
            myAudio.currentTime = 0.0;
            myAudio.src = soundUrl;
            myAudio.volume = soundVolume;
            myAudio.play();
        }
        renderWigoError(downHosts.length+" KO", currentStatus);
    } else {
        renderWigoOk(currentNb+"", currentStatus);
    }
}

function renderWigoOk(text, level) {
    chrome.browserAction.setIcon({path:"wigo-green.png"});
    if(level == 'crit') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#ed5565'});
    } else if(level == 'info') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#4fc1e9'});
    } else if(level == 'warn') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#ffce54'});
    } else if(level == 'err') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#535B67'});
    } else if(level == 'ok') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#a0d468'});
    } else {
        chrome.browserAction.setBadgeBackgroundColor({color: '#aab2bd'});
    }
    chrome.browserAction.setBadgeText({text: text});
}

function renderWigoError(text, level) {
    chrome.browserAction.setIcon({path:"wigo-red.png"});
    if(level == 'crit') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#ed5565'});
    } else if(level == 'info') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#4fc1e9'});
    } else if(level == 'warn') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#ffce54'});
    } else if(level == 'err') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#535B67'});
    } else if(level == 'ok') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#a0d468'});
    } else {
        chrome.browserAction.setBadgeBackgroundColor({color: '#aab2bd'});
    }
    chrome.browserAction.setBadgeText({text: text});
}

function renderPluginError(text) {
    chrome.browserAction.setIcon({path:"wigo-blue.png"});
    chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 255, 255]});
    chrome.browserAction.setBadgeText({text: text});
}

