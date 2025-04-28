// linechart.js
document.addEventListener('DOMContentLoaded', function() {
    // === Global State ===
    let currentMode = "day"; // 'day' or 'hour'
    let selectedDay = null;
    const eventsByDay = {}; // Aggregated events per day

    const searchInput = document.getElementById('filterSystemInput');
    const resetBtn = document.getElementById('resetBtn');

    // === Aggregate events by day ===
    Object.entries(eventsByHour).forEach(([label, count]) => {
        const day = label.slice(0, 10); // Extract 'YYYY-MM-DD'
        if (!eventsByDay[day]) {
            eventsByDay[day] = 0;
        }
        eventsByDay[day] += count;
    });

    function rebuildEventsByDay() {
        console.log('[DEBUG] rebuildEventsByDay() called');
        Object.keys(eventsByDay).forEach(key => delete eventsByDay[key]); // Clear
        Object.entries(eventsByHour).forEach(([label, count]) => {
            const day = label.slice(0, 10); // 'YYYY-MM-DD'
            if (!eventsByDay[day]) {
                eventsByDay[day] = 0;
            }
            eventsByDay[day] += count;
        });
    }
    

    const eventsTimeLabels = Object.keys(eventsByDay);
    const eventsTimeData = Object.values(eventsByDay);

    const eventsTimeCtx = document.getElementById('eventsTimeChart').getContext('2d');
    let eventsTimeChart;

    // === Display 'No Data' Message if Needed ===
    if (eventsTimeData.every(val => val === 0)) {
        document.getElementById('eventsTimeChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        eventsTimeChart = new Chart(eventsTimeCtx, {
            type: 'line',
            data: {
                labels: eventsTimeLabels,
                datasets: [{
                    label: 'Audit Events (Past Days)',
                    data: eventsTimeData,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Events'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const date = tooltipItems[0].label;
                                return `📅 ${date}`;
                            },
                            label: function(tooltipItem) {
                                return `🔢 Events: ${tooltipItem.formattedValue}`;
                            }
                        }
                    }
                }
            }
        });
    }



    // === Click Handler for Drill-Down and Search Update ===
    document.getElementById('eventsTimeChart').addEventListener('click', function(evt) {
        if (!eventsTimeChart) return;
        const points = eventsTimeChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const dateLabel = eventsTimeChart.data.labels[firstPoint.index];

            if (currentMode === "day") {
                selectedDay = dateLabel;
                drillDownToHours(selectedDay);
                updateSearchInput(selectedDay);
            } else if (currentMode === "hour") {
                updateSearchInput(selectedDay + ' ' + dateLabel.slice(0, 2));
            }
        }
    });

    // === Drill-Down Function to Hour View ===
    function drillDownToHours(day) {
        currentMode = "hour";

        const hourlyLabels = [];
        const hourlyData = [];

        for (let hour = 0; hour < 24; hour++) {
            const formattedHour = hour.toString().padStart(2, '0');
            const label = `${day} ${formattedHour}`; // "YYYY-MM-DD HH"

            hourlyLabels.push(`${formattedHour}:00`);
            hourlyData.push(eventsByHour[label] || 0);
        }

        eventsTimeChart.data.labels = hourlyLabels;
        eventsTimeChart.data.datasets[0].data = hourlyData;
        eventsTimeChart.data.datasets[0].label = `Audit Events for ${day}`;
        eventsTimeChart.options.scales.x.title.text = "Hour of Day";
        eventsTimeChart.update();
    }
// === Return to Daily View ===
function backToDailyView() {
    console.log('[DEBUG] backToDailyView() called');
    if (!eventsTimeChart) {
        console.log('[DEBUG] No chart available');
        return;
    }
    currentMode = "day";

    eventsTimeChart.data.labels = Object.keys(eventsByDay);
    eventsTimeChart.data.datasets[0].data = Object.values(eventsByDay);
    eventsTimeChart.data.datasets[0].label = "Audit Events (Past Days)";
    eventsTimeChart.options.scales.x.title.text = "Date";
    
    eventsTimeChart.update({
        duration: 800,     // <-- NEU: Sanfte Animation
        easing: 'easeOutCubic' // <-- NEU: Schöne Kurve
    });
}

    // === Update Search Input ===
    function updateSearchInput(value) {
        if (searchInput) {
            searchInput.value = value;
            const inputEvent = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(inputEvent);
        }
    }

// === Clear Search Input Handler ===
function handleClearSearch() {
    console.log('[DEBUG] handleClearSearch() triggered');
    if (searchInput) {
        console.log('[DEBUG] Current searchInput value:', searchInput.value.trim());
    }
    if (searchInput && searchInput.value.trim() === "") {
        console.log('[DEBUG] Search input is empty, calling backToDailyView()');
        backToDailyView();
    }
}

    // Listen to manual clearing
    if (searchInput) {
        searchInput.addEventListener('input', handleClearSearch);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(inputEvent);
                e.preventDefault();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('[DEBUG] Reset-Button wurde geklickt!');
            
            resetBtn.disabled = true; // Deaktivieren
            
            if (searchInput) {
                console.log('[DEBUG] Clearing searchInput via Reset Button');
                searchInput.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(inputEvent);
            }
    
            rebuildEventsByDay();
            backToDailyView();
    
            setTimeout(() => {
                resetBtn.disabled = false; // Nach 1 Sekunde wieder aktivieren
            }, 1000);
        });
    }
    
    

    // === Toggle Button Logic for Line Chart (Expand/Collapse) ===
    const toggleButton = document.getElementById('toggleLineChart');
    const lineChartContainer = document.getElementById('lineChartContainer');
    let isCollapsed = false;

    function applyLineChartState() {
        if (isCollapsed) {
            lineChartContainer.style.display = 'none';
            toggleButton.querySelector('span').textContent = '[+]';
        } else {
            lineChartContainer.style.display = 'block';
            toggleButton.querySelector('span').textContent = '[-]';
        }
    }

    // Fetch saved state from session via AJAX
    const xhrFetchState = new XMLHttpRequest();
    xhrFetchState.open('GET', 'fetch_session.php?linechart', true);
    xhrFetchState.onload = function() {
        if (xhrFetchState.status === 200) {
            isCollapsed = xhrFetchState.responseText === 'true';
            applyLineChartState();
        }
    };
    xhrFetchState.send();

    // Event listener for the toggle button
    toggleButton.addEventListener('click', function() {
        isCollapsed = !isCollapsed;
        applyLineChartState();

        // Save the state in PHP session via AJAX
        const xhrSaveState = new XMLHttpRequest();
        xhrSaveState.open('POST', 'save_session.php', true);
        xhrSaveState.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhrSaveState.send('linechart_collapsed=' + (isCollapsed ? '1' : '0'));
    });
});
