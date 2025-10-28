document.addEventListener('DOMContentLoaded', () => {
    const utcTimeEl = document.getElementById('utc-time');
    const utcDateEl = document.getElementById('utc-date');
    const localTimeEl = document.getElementById('local-time');
    const localDateEl = document.getElementById('local-date');
    const favTzListEl = document.getElementById('favorite-timezones-list');
    const mainLabelEl = document.getElementById('main-display-label');
    const mainTimezoneSelectEl = document.getElementById('main-timezone-select'); // Get main select


    const copyIsoBtn = document.getElementById('copy-iso');
    const copyReadableBtn = document.getElementById('copy-readable');
    const copyUnixBtn = document.getElementById('copy-unix');

    const humanInput = document.getElementById('human-time-input');
    const unixInput = document.getElementById('unix-time-input');

    const timeSlider = document.getElementById('time-slider');
    const sliderValueEl = document.getElementById('slider-value');

    const countdownTitleEl = document.getElementById('countdown-title');
    const countdownInputEl = document.getElementById('countdown-input');
    const startCountdownBtn = document.getElementById('start-countdown');
    const clearCountdownBtn = document.getElementById('clear-countdown');
    const countdownDisplayEl = document.getElementById('countdown-display');

    let favoriteTimezones = [];
    let intervalID;
    let timeFormatSetting = '24h-seconds';
    let countdownInterval;


    // --- Main Time Update ---
    function updateAllTimes() {
        const sliderOffset = parseInt(document.getElementById('time-slider').value) * 60 * 60 * 1000;
        const now = moment().add(sliderOffset, 'ms');

        let momentTimeFormat;
        switch (timeFormatSetting) {
            case '24h':
                momentTimeFormat = 'HH:mm';
                break;
            case '12h-seconds':
                momentTimeFormat = 'hh:mm:ss A';
                break;
            case '12h':
                momentTimeFormat = 'hh:mm A';
                break;
            case '24h-seconds':
            default:
                momentTimeFormat = 'HH:mm:ss';
                break;
        }

        const dateFormat = 'ddd, D MMM YYYY';

        let mainMoment;
        if (mainDisplayTimezone === 'UTC') {
            mainMoment = now.clone().utc();
            mainLabelEl.textContent = 'UTC';
        } else if (mainDisplayTimezone === 'Local') {
            mainMoment = now.clone();
            mainLabelEl.textContent = 'Local';
        } else {
            mainMoment = now.clone().tz(mainDisplayTimezone);
            mainLabelEl.textContent = mainDisplayTimezone.split('/').pop().replace(/_/g, ' ');
        }

        utcTimeEl.textContent = mainMoment.format(momentTimeFormat);
        utcDateEl.textContent = mainMoment.format(dateFormat);
        localTimeEl.textContent = now.format(momentTimeFormat);
        localDateEl.textContent = now.format(dateFormat);

        favTzListEl.innerHTML = '';
        favoriteTimezones.forEach(tz => {
            const tzTime = now.clone().tz(tz).format(`${momentTimeFormat} (z)`);
            const tzName = tz.split('/').pop().replace(/_/g, ' ');
            const html = `
                <div class="fav-tz">
                    <span class="fav-tz-name">${tzName}</span>
                    <span class="fav-tz-time">${tzTime}</span>
                </div>`;
            favTzListEl.innerHTML += html;
        });
    }

    // --- Theme Loader ---
    function loadTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // --- Populate the main timezone selector ---
    function populateMainTimezoneSelect() {
        mainTimezoneSelectEl.innerHTML = '';

        mainTimezoneSelectEl.appendChild(new Option('UTC', 'UTC'));
        mainTimezoneSelectEl.appendChild(new Option('Local', 'Local'));

        const favGroup = document.createElement('optgroup');
        favGroup.label = 'Favorites';
        favoriteTimezones.forEach(tz => {
            if (tz !== 'UTC' && tz !== 'Local') {
                favGroup.appendChild(new Option(tz.replace(/_/g, ' '), tz));
            }
        });
        mainTimezoneSelectEl.appendChild(favGroup);

        const allGroup = document.createElement('optgroup');
        allGroup.label = 'All Timezones';
        const allTimezones = moment.tz.names();

        allTimezones.forEach(tz => {
            if (!favoriteTimezones.includes(tz) && tz !== 'UTC' && tz !== 'Local') {
                allGroup.appendChild(new Option(tz.replace(/_/g, ' '), tz));
            }
        });

        mainTimezoneSelectEl.appendChild(allGroup);
        mainTimezoneSelectEl.value = mainDisplayTimezone;
    }

    // --- Load Settings From Storage ---
    chrome.storage.sync.get(['theme', 'timezones', 'timeFormat'], (items) => {
        loadTheme(items.theme || 'light');
        favoriteTimezones = items.timezones || ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
        timeFormatSetting = items.timeFormat || '24h-seconds';
        mainDisplayTimezone = items.mainDisplayTimezone || 'UTC';

        populateMainTimezoneSelect();

        updateAllTimes();
        intervalID = setInterval(updateAllTimes, 1000);
    });


    // --- CONVERTERS ---
    humanInput.addEventListener('input', () => {
        const date = moment.utc(humanInput.value, "YYYY-MM-DD HH:mm:ss");
        if (date.isValid()) {
            unixInput.value = date.unix();
        }
    });

    unixInput.addEventListener('input', () => {
        const unixTimestamp = parseInt(unixInput.value);
        if (!isNaN(unixTimestamp)) {
            humanInput.value = moment.unix(unixTimestamp).utc().format("YYYY-MM-DD HH:mm:ss");
        }
    });


    // --- CONTEXT MENU HANDLER ---
    chrome.storage.local.get('contextSelection', (data) => {
        if (data.contextSelection) {
            const selection = data.contextSelection;
            if (!isNaN(parseInt(selection))) {
                unixInput.value = selection;
                unixInput.dispatchEvent(new Event('input'));
            } else {
                humanInput.value = selection;
                humanInput.dispatchEvent(new Event('input'));
            }
            chrome.storage.local.remove('contextSelection');
        }
    });


    // --- VISUAL TIME SLIDER ---
    timeSlider.addEventListener('input', () => {
        const offset = timeSlider.value;
        sliderValueEl.textContent = `${offset}h`;
        if (offset != 0) {
            clearInterval(intervalID);
        } else {
            if (intervalID) clearInterval(intervalID);
            intervalID = setInterval(updateAllTimes, 1000);
        }
        updateAllTimes();
    });

    // --- MAIN TIMEZONE SELECT ---
    mainTimezoneSelectEl.addEventListener('input', (e) => {
        mainDisplayTimezone = e.target.value;
        chrome.storage.sync.set({ mainDisplayTimezone: mainDisplayTimezone });
        updateAllTimes();
    });


    // --- COUNTDOWN TIMER ---
    function renderCountdown(countdownData) {
        if (countdownInterval) clearInterval(countdownInterval);

        const { targetTime, title } = countdownData;

        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownDisplayEl.textContent = `"${title}" has ended!`;
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownDisplayEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }

    startCountdownBtn.addEventListener('click', () => {
        const targetTime = new Date(countdownInputEl.value).getTime();
        const title = countdownTitleEl.value.trim() || 'Untitled Event';
        if (isNaN(targetTime)) {
            alert("Please select a valid date and time.");
            return;
        }

        const countdownData = { targetTime, title };
        chrome.storage.sync.set({ countdown: countdownData });
        chrome.alarms.create(`countdown_${title}`, { when: targetTime });

        renderCountdown(countdownData);
    });

    clearCountdownBtn.addEventListener('click', () => {
        if (countdownInterval) clearInterval(countdownInterval);

        chrome.storage.sync.remove('countdown');
        const title = countdownTitleEl.value.trim() || 'Untitled Event';
        chrome.alarms.clear(`countdown_${title}`);

        countdownDisplayEl.textContent = '';
        countdownTitleEl.value = '';
        countdownInputEl.value = '';
    });

    chrome.storage.sync.get('countdown', (items) => {
        if (items.countdown && items.countdown.targetTime > new Date().getTime()) {
            countdownTitleEl.value = items.countdown.title;
            countdownInputEl.value = new Date(items.countdown.targetTime).toISOString().slice(0, 16);

            renderCountdown(items.countdown);
        }
    });


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
});