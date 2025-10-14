
document.addEventListener('DOMContentLoaded', () => {
    const utcTimeEl = document.getElementById('utc-time');
    const utcDateEl = document.getElementById('utc-date');
    const localTimeEl = document.getElementById('local-time');
    const localDateEl = document.getElementById('local-date');
    const utcContainerEl = document.getElementById('utc-container');

    const copyIsoBtn = document.getElementById('copy-iso');
    const copyReadableBtn = document.getElementById('copy-readable');
    const copyUnixBtn = document.getElementById('copy-unix');

    let timeFormat = '24h-seconds';

    // Load user-preferred format from storage
    chrome.storage.sync.get(['timeFormat'], (result) => {
        if (result.timeFormat) {
            timeFormat = result.timeFormat;
        }
        updateTime();
    });

    function updateTime() {
        const now = new Date();

        const options = {
            hour12: timeFormat.includes('12h'),
            hour: '2-digit',
            minute: '2-digit',
            ...(timeFormat.includes('seconds') && { second: '2-digit' })
        };

        // UTC Display
        utcTimeEl.textContent = now.toLocaleTimeString('en-US', { ...options, timeZone: 'UTC' });
        utcDateEl.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
        });

        // Local Display
        localTimeEl.textContent = now.toLocaleTimeString('en-US', options);
        localDateEl.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });

        const unixTimestamp = Math.floor(now.getTime() / 1000);
        utcContainerEl.title = `Unix: ${unixTimestamp}\nISO: ${now.toISOString()}`;
    }

    // --- Copy Button ---
    function handleCopy(button, textGenerator) {
        const originalText = button.textContent;
        navigator.clipboard.writeText(textGenerator())
            .then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                button.textContent = 'Error!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            });
    }

    copyIsoBtn.addEventListener('click', () => {
        handleCopy(copyIsoBtn, () => new Date().toISOString());
    });

    copyReadableBtn.addEventListener('click', () => {
        handleCopy(copyReadableBtn, () => new Date().toUTCString());
    });

    copyUnixBtn.addEventListener('click', () => {
        handleCopy(copyUnixBtn, () => Math.floor(new Date().getTime() / 1000).toString());
    });

    setInterval(updateTime, 1000);
});