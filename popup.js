function updateTime() {
    const utcString = (new Date()).toUTCString();
    const [weekday, day, month, year, timeString] = utcString.split(' ');

    document.getElementById('utc-time').textContent = timeString;
    document.getElementById('utc-date').textContent = `${weekday} ${day} ${month} ${year}`;
}

updateTime();
setInterval(updateTime, 1000);

