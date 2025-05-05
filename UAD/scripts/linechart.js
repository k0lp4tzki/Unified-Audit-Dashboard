// linechart.js

document.addEventListener('DOMContentLoaded', function() {
    // === Global State ===
    let currentMode = "day"; // 'day' or 'hour'
    let selectedDay = null;
    const eventsByDay = {}; // Aggregated events per day

    const searchInput = document.getElementById('filterSystemInput');
    const resetBtn = document.getElementById('resetBtn');
    const chartCanvas = document.getElementById('eventsTimeChart');
    const chartContainer = chartCanvas.parentNode;
   const filterLabel = document.getElementById('linechartFilterLabel');
    let eventsTimeChart; // Global chart reference

    // === Aggregate original data ===
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

    function backToDailyView() {
        console.log('[DEBUG] backToDailyView() called');
        currentMode = "day";
        eventsTimeChart.data.labels = Object.keys(eventsByDay);
        eventsTimeChart.data.datasets[0].data = Object.values(eventsByDay);
        eventsTimeChart.data.datasets[0].label = "Audit Events (Past Days)";
        eventsTimeChart.options.scales.x.title.text = "Date";
        eventsTimeChart.update({ duration: 800, easing: 'easeOutCubic' });
    }

   function updateSearchInput(value) {
     if (searchInput) {
        searchInput.value = value;
        if (filterLabel) filterLabel.textContent = `🔎 Filter active: ${value}`;
        const e = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(e);
    }
}

    function handleClearSearch() {
        console.log('[DEBUG] handleClearSearch() triggered');
        if (searchInput && searchInput.value.trim() === "") {
            console.log('[DEBUG] Search input is empty, calling backToDailyView()');
            if (filterLabel) filterLabel.textContent = '';
		backToDailyView();
        }
    }

    function updateLineChartBasedOnFilter() {
        const filter = searchInput?.value.trim();
        if (!filter) return;

        if (currentMode === "hour") {
            console.log('[DEBUG] Skip filter update during hourly drilldown');
            return;
        }

        const filtered = window.filteredEntries || [];
        const aggregated = {};

        filtered.forEach(entry => {
            const date = entry.EVENT_TIMESTAMP.slice(0, 10);
            if (!aggregated[date]) {
                aggregated[date] = 0;
            }
            aggregated[date]++;
        });

        const labels = Object.keys(aggregated).sort();
        const data = labels.map(l => aggregated[l]);

        if (labels.length) {
            currentMode = "day";
            eventsTimeChart.data.labels = labels;
            eventsTimeChart.data.datasets[0].data = data;
            eventsTimeChart.data.datasets[0].label = `Audit Events (filtered)`;
            eventsTimeChart.options.scales.x.title.text = "Date";
            eventsTimeChart.update();
        }
    }

    // === Create initial chart ===
    const eventsTimeCtx = chartCanvas.getContext('2d');
    const eventsTimeLabels = Object.keys(eventsByDay);
    const eventsTimeData = Object.values(eventsByDay);

    if (eventsTimeData.every(val => val === 0)) {
        chartContainer.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        eventsTimeChart = new Chart(eventsTimeCtx, {
            type: 'line',
            data: {
                labels: eventsTimeLabels,
                datasets: [{
                    label: 'Audit Events (Past Days)',
                    data: eventsTimeData,
                    borderColor: '#20B2AA',
                    backgroundColor: 'rgba(32, 178, 170, 0.15)',
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
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Events' } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return `📅 ${tooltipItems[0].label}`;
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
    chartCanvas.addEventListener('click', function(evt) {
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

    // === Listen to input clear and ESC key ===
    if (searchInput) {
        searchInput.addEventListener('input', function() {
    handleClearSearch();
    updateLineChartBasedOnFilter();
    if (filterLabel) {
        const val = searchInput.value.trim();
        filterLabel.textContent = val ? `🔎 Filter active: ${val}` : '';
    }
});

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(inputEvent);
                e.preventDefault();
            }
        });
    }

    // === Reset Button support ===
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('[DEBUG] Reset-Button wurde geklickt!');
            resetBtn.disabled = true;
            if (searchInput) {
                console.log('[DEBUG] Clearing searchInput via Reset Button');
                searchInput.value = '';
                const inputEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(inputEvent);
            if (filterLabel) filterLabel.textContent = '';
	    }
            rebuildEventsByDay();
            backToDailyView();
            setTimeout(() => { resetBtn.disabled = false; }, 1000);
        });
    }

    // === Toggle line chart visibility ===
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

    const xhrFetchState = new XMLHttpRequest();
    xhrFetchState.open('GET', 'fetch_session.php?linechart', true);
    xhrFetchState.onload = function() {
        if (xhrFetchState.status === 200) {
            isCollapsed = xhrFetchState.responseText === 'true';
            applyLineChartState();
        }
    };
    xhrFetchState.send();

    toggleButton.addEventListener('click', function() {
        isCollapsed = !isCollapsed;
        applyLineChartState();

        const xhrSaveState = new XMLHttpRequest();
        xhrSaveState.open('POST', 'save_session.php', true);
        xhrSaveState.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhrSaveState.send('linechart_collapsed=' + (isCollapsed ? '1' : '0'));
    });
});

