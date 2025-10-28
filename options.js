document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('status');
    const themeToggle = document.getElementById('theme-toggle');
    const addTzBtn = document.getElementById('add-tz');
    const tzList = document.getElementById('timezone-list');

    const tzSelectEl = document.getElementById('tz-select');

    let favoriteTimezones = [];

    // --- Timezone Management ---
    function renderTimezones() {
        tzList.innerHTML = '';
        favoriteTimezones.forEach((tz, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${tz}</span><span class="remove-tz" data-index="${index}">&times;</span>`;
            tzList.appendChild(li);
        });
        document.querySelectorAll('.remove-tz').forEach(btn => {
            btn.addEventListener('click', (e) => {
                favoriteTimezones.splice(e.target.dataset.index, 1);
                renderTimezones();
            });
        });
    }

    function populateTimezoneSelect() {
        const allTimezones = moment.tz.names();
        tzSelectEl.innerHTML = ''; // Clear "Loading..."
        allTimezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz;
            option.textContent = tz.replace(/_/g, ' '); // Make it readable
            tzSelectEl.appendChild(option);
        });
    }

    addTzBtn.addEventListener('click', () => {
        const newTz = tzSelectEl.value;

        if (newTz && !favoriteTimezones.includes(newTz)) {
            favoriteTimezones.push(newTz);
            renderTimezones();
        } else {
            alert('Timezone is already in your favorites!');
        }
    });

    // --- Save and Restore ---
    function saveOptions() {
        const theme = themeToggle.checked ? 'dark' : 'light';
        const format = document.querySelector('input[name="format"]:checked').value;

        chrome.storage.sync.set({
            theme: theme,
            timezones: favoriteTimezones,
            timeFormat: format
        }, () => {
            statusEl.textContent = 'Options saved!';
            setTimeout(() => { statusEl.textContent = ''; }, 1500);
        });
    }

    function restoreOptions() {
        chrome.storage.sync.get({
            theme: 'light',
            timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
            timeFormat: '24h-seconds'
        }, (items) => {
            themeToggle.checked = items.theme === 'dark';
            favoriteTimezones = items.timezones;
            document.querySelector(`input[name="format"][value="${items.timeFormat}"]`).checked = true;
            renderTimezones();
        });
    }

    saveBtn.addEventListener('click', saveOptions);
    populateTimezoneSelect();
    restoreOptions();
});