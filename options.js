document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('status');
    const themeToggle = document.getElementById('theme-toggle');
    const addTzBtn = document.getElementById('add-tz');
    const tzInput = document.getElementById('tz-input');
    const tzList = document.getElementById('timezone-list');

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

    addTzBtn.addEventListener('click', () => {
        const newTz = tzInput.value.trim();
        if (newTz && moment.tz.names().includes(newTz) && !favoriteTimezones.includes(newTz)) {
            favoriteTimezones.push(newTz);
            renderTimezones();
            tzInput.value = '';
        } else {
            alert('Invalid or duplicate timezone!');
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
    restoreOptions();
});