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
    setupContextMenu();

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

    // Countdown Timer Notification
    if (alarm.name.startsWith('countdown_')) {
        const title = alarm.name.replace('countdown_', '');
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Countdown Finished!',
            message: `The countdown for "${title}" has ended.`,
            priority: 2
        });
    }
});


// Context Menu Integration
function setupContextMenu() {
    chrome.contextMenus.create({
        id: "convert-time-selection",
        title: "Convert time with UTC Viewer",
        contexts: ["selection"]
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convert-time-selection" && info.selectionText) {
        chrome.storage.local.set({ 'contextSelection': info.selectionText });
    }
});
