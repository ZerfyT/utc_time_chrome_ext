function updateBadge() {
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const badgeText = `${hours}:${minutes}`;

    chrome.action.setTitle({ title: `UTC: ${badgeText}` });
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#4682B4' });
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("UTC Viewer installed. Setting up alarm.");
    chrome.alarms.create('updateTimeBadge', {
        periodInMinutes: 1
    });
    updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateTimeBadge') {
        updateBadge();
    }
});