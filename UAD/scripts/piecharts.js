document.addEventListener('DOMContentLoaded', function () {
    let activeFilter = null; // Speichert den aktuell gesetzten Filter

    // Audit Types Pie Chart
    const auditTypesCtx = document.getElementById('auditTypesChart').getContext('2d');
    if (actionData.length === 0) {
        document.getElementById('auditTypesChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        new Chart(auditTypesCtx, {
            type: 'pie',
            data: {
                labels: actionLabels,
                datasets: [{
                    data: actionData,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                maintainAspectRatio: false,
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedLabel = actionLabels[clickedIndex];
                        handleChartClick(clickedLabel);
                    }
                }
            }
        });
    }

    // DB Users Pie Chart
    const dbUsersCtx = document.getElementById('dbUsersChart').getContext('2d');
    if (dbUserData.length === 0) {
        document.getElementById('dbUsersChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        new Chart(dbUsersCtx, {
            type: 'pie',
            data: {
                labels: dbUserLabels,
                datasets: [{
                    data: dbUserData,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                maintainAspectRatio: false,
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedLabel = dbUserLabels[clickedIndex];
                        handleChartClick(clickedLabel);
                    }
                }
            }
        });
    }

    // Source Databases Pie Chart
    const sourceDatabaseCtx = document.getElementById('sourceDatabaseChart').getContext('2d');
    if (sourceDatabaseData.length === 0) {
        document.getElementById('sourceDatabaseChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        new Chart(sourceDatabaseCtx, {
            type: 'pie',
            data: {
                labels: sourceDatabaseLabels,
                datasets: [{
                    data: sourceDatabaseData,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                maintainAspectRatio: false,
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedLabel = sourceDatabaseLabels[clickedIndex];
                        handleChartClick(clickedLabel);
                    }
                }
            }
        });
    }

    // Userhosts Pie Chart
    const userhostCtx = document.getElementById('userhostChart').getContext('2d');
    if (userhostData.length === 0) {
        document.getElementById('userhostChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        new Chart(userhostCtx, {
            type: 'pie',
            data: {
                labels: userhostLabels,
                datasets: [{
                    data: userhostData,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                maintainAspectRatio: false,
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedLabel = userhostLabels[clickedIndex];
                        handleChartClick(clickedLabel);
                    }
                }
            }
        });
    }

    // Funktion zur Handhabung von Klicks auf die Charts
    function handleChartClick(clickedLabel) {
        // Wenn der Filter schon gesetzt ist und auf das gleiche Element geklickt wird, filter zurücksetzen
        if (activeFilter === clickedLabel) {
            resetAllFilters(); // Deine Funktion zum Zurücksetzen der Tabelle und Filter
            activeFilter = null; // Filter zurücksetzen
        } else {
            // Anderen Filter setzen
            setFilterByChart(clickedLabel);
            activeFilter = clickedLabel; // Neuen Filter setzen
        }
    }

    // Funktion zum Setzen des Filters bei einem Chart-Klick
    function setFilterByChart(filterValue) {
        const searchInput = document.getElementById('filterSystemInput');
        searchInput.value = filterValue;

        // Trigger the input event to apply the filter
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }

    // Funktion zum Zurücksetzen aller Filter
    function resetAllFilters() {
        const searchInput = document.getElementById('filterSystemInput');
        searchInput.value = ''; // Setzt den Filter Input zurück

        // Trigger the input event to reset the filter
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }
});