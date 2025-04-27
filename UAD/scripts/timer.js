document.addEventListener('DOMContentLoaded', function () {
    let countdownInterval;

    // Funktion für den Countdown zur nächsten Viertelstunde
    function startCountdown() {
        const now = new Date();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        // Berechne die Minuten zur nächsten Viertelstunde
        let nextQuarter = 15 - (minutes % 15);
        if (nextQuarter === 15) nextQuarter = 0;  // Falls genau auf der Viertelstunde, direkt ab jetzt zählen

        // Berechne die verbleibenden Sekunden bis zur nächsten Viertelstunde
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

    // Funktion, um Daten neu zu laden (Hier deine Datenaktualisierungslogik)
    function refreshData() {
        // Deine Logik zum Neuladen der Daten
        console.log("Reload data..");
        // Beispiel: Neuladen der Charts oder der Tabelle
        // Du kannst hier einen API-Aufruf oder eine AJAX-Anfrage hinzufügen
    }

    // Starte den Countdown, wenn die Seite geladen ist
    startCountdown();
});
