function saveOptions() {
    const format = document.querySelector('input[name="format"]:checked').value;

    chrome.storage.sync.set({ timeFormat: format }, () => {
        console.log(
            format
        );

        const status = document.getElementById('status');
        status.textContent = 'Options saved!';
        setTimeout(() => {
            status.textContent = '';
        }, 1000);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({ timeFormat: '24h-seconds' }, (items) => {
        document.querySelector(`input[name="format"][value="${items.timeFormat}"]`).checked = true;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);