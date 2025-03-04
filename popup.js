function updateTime() {
    const now = new Date();
    const timeString = now.toUTCString().split(' ')[4];
    const dateString = now.toUTCString().split(' ').slice(0, 4).join(' ');

    document.getElementById('utc-time').textContent = timeString;
    document.getElementById('utc-date').textContent = dateString;
}


updateTime();
setInterval(updateTime, 1000);