document.addEventListener('DOMContentLoaded', function () {
    let countdownInterval;
    // while translating this file i realised this was a try to reload the table data dynamically every 15 minutes because the dbms_scheduler sends the data in this frequence. But i never used this code..
    // feel free to complete

    // 15 min countdown
    function startCountdown() {
        const now = new Date();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        // magic
        let nextQuarter = 15 - (minutes % 15);
        if (nextQuarter === 15) nextQuarter = 0;  // exactly 15 min

        // calc remainig seconds
        let timeRemaining = nextQuarter * 60 - seconds;

        countdownInterval = setInterval(function () {
            timeRemaining--;
            const displayMinutes = Math.floor(timeRemaining / 60);
            const displaySeconds = timeRemaining % 60;
            document.getElementById('countdown').textContent = `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                refreshData(); // Daten neu laden
                startCountdown(); // Countdown erneut starten
            }
        }, 1000); // Jede Sekunde aktualisieren
    }

    // Yeah.. missing logic for refreh data
    function refreshData() {
        console.log("Reload data..");
    }

    startCountdown();
});
