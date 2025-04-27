document.addEventListener('DOMContentLoaded', function() {
    // Aggregate events by day
    const eventsByDay = {};


    // Populate `eventsByDay` with aggregated data for each day
    Object.entries(eventsByHour).forEach(([label, count]) => {
        const day = label.slice(0, 10); // Extracts 'YYYY-MM-DD'
        if (!eventsByDay[day]) {
            eventsByDay[day] = 0;
        }
        eventsByDay[day] += count;
    });

    // Generate labels and data arrays from the aggregated daily data
    const eventsTimeLabels = Object.keys(eventsByDay);
    const eventsTimeData = Object.values(eventsByDay);
    

    const eventsTimeCtx = document.getElementById('eventsTimeChart').getContext('2d');
    let eventsTimeChart;

    // Display 'No data' message if no events in the week
    if (eventsTimeData.every(val => val === 0)) {
        document.getElementById('eventsTimeChart').parentNode.innerHTML = '<p style="text-align: center;">Currently no data to display!</p>';
    } else {
        eventsTimeChart = new Chart(eventsTimeCtx, {
            type: 'line',
            data: {
                labels: eventsTimeLabels,
                datasets: [
                    {
                        label: 'Audit Events (Past Week)',
                        data: eventsTimeData,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',        
                        fill: false,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        borderWidth: 2
        
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            callback: function(value, index, values) {
				    // Show each unique day
                                return eventsTimeLabels[index];
                            }
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
                                // Show full date and total events for the day
                                const date = tooltipItems[0].label;
                                return `${date}: ${eventsByDay[date]} events`;
                            }
                        }
                    }
                }
            }
        });
    }

    document.getElementById('eventsTimeChart').addEventListener('click', function(evt) {
        const points = eventsTimeChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const dateLabel = eventsTimeChart.data.labels[firstPoint.index];
    
            // Set the label as the filter value in the input field
            const searchInput = document.getElementById('filterSystemInput');
            searchInput.value = `${dateLabel} `;
    
            // Trigger the input event to apply the filter
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        }
    });

    // Toggle Button Logic for Line Chart
    const toggleButton = document.getElementById('toggleLineChart');
    const lineChartContainer = document.getElementById('lineChartContainer');
    let isCollapsed = false;

    // Function to apply the state (expand/collapse)
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
            applyLineChartState();  // Apply the state after fetching
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
