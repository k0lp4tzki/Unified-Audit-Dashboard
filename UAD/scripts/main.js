document.addEventListener("DOMContentLoaded", function () {
    console.log("main.js initialized");

    // 1. Elementreferenzen
    const tableBody = document.getElementById("auditTableBody");
    const paginationContainer = document.querySelector(".pagination");
    const resetBtn = document.getElementById("resetBtn"); // Reset-Button hinzufügen

    // 2. Globale Konfiguration
    window.rowsPerPage = 25;
    window.totalPages= 10;
    window.currentPage = 1;
    window.currentPageRecent = 1;
    window.filteredEntries = [];

    // 3. Hauptfunktionen
    window.updateTableData = function (entries, currentPage) {
        console.log("Refresh table with", entries.length, "Entries, Page", currentPage);

        // Fade-Out-Effekt
        tableBody.style.opacity = "0";

        setTimeout(() => {
            tableBody.innerHTML = "";

            const start = (currentPage - 1) * window.rowsPerPage;
            const end = start + window.rowsPerPage;
            const rowsToShow = entries.slice(start, end);

            if (rowsToShow.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="12" class="text-center">Keine Daten verfügbar</td></tr>`;
            } else {
                rowsToShow.forEach(entry => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="clickable-cell event-timestamp">${entry.EVENT_TIMESTAMP}</td>
                        <td class="clickable-cell">${entry.OS_USERNAME}</td>
                        <td class="clickable-cell">${entry.USERHOST}</td>
                        <td class="clickable-cell">${entry.DBUSERNAME}</td>
                        <td class="clickable-cell">${entry.ACTION_NAME}</td>
                        <td class="return-code">${entry.RETURN_CODE}</td>
                        <td class="clickable-cell">${entry.CLIENT_PROGRAM_NAME}</td>
                        <td class="clickable-cell">${entry.OS_PROCESS}</td>
                        <td class="clickable-cell">${entry.SYSTEM_PRIVILEGE_USED || "N/A"}</td>
                        <td class="clickable-cell username">${entry.CURRENT_USER}</td>
                        <td class="clickable-cell">${entry.UNIFIED_AUDIT_POLICIES}</td>
                        <td class="clickable-cell source-database">${entry.SOURCE_DATABASE}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            bindCellClickEvents();
            tableBody.style.opacity = "1";
            updatePagination(entries.length, currentPage);
            
            if (typeof linkReturnCodes === 'function') linkReturnCodes();
            if (typeof linkUsername === 'function') linkUsername();
            if (typeof linkSourceDatabase === 'function') linkSourceDatabase();
        }, 300);
    };

    
      paginationContainer.innerHTML = "";
       if (totalPages > 1) {
           if (currentPage > 1) {
               const prevLink = createPageLink(currentPage - 1, "&laquo;");
               paginationContainer.appendChild(prevLink);
           }

           let startPage = Math.max(1, currentPage - 2);
           let endPage = Math.min(totalPages, startPage + 4);

           
           if (endPage - startPage < 4) {
               startPage = Math.max(1, endPage - (totalPages < 5 ? endPage - 1 : 4));
           }
   
           if (startPage > 1) {
               paginationContainer.appendChild(createPageLink(1));
               if (startPage > 2) {
                   paginationContainer.appendChild(createEllipsis());
               }
           }
           
           for (let i = startPage; i <= endPage; i++) {
               paginationContainer.appendChild(createPageLink(i, i === currentPage ? i : null));
           }
   
           if (endPage < totalPages) {
               if (endPage < totalPages - 1) {
                   paginationContainer.appendChild(createEllipsis());
               }
               paginationContainer.appendChild(createPageLink(totalPages));
           }
   
           if (currentPage < totalPages) {
               const nextLink = createPageLink(currentPage + 1, "&raquo;");
               paginationContainer.appendChild(nextLink);
           }

           paginationContainer.querySelectorAll('.pagination-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.dataset.page);
                const dataSource = window.filteredEntries.length > 0 
                    ? window.filteredEntries 
                    : window.recentEntries; // Hier haben wir den History-Teil entfernt
        
                window.currentPageRecent = page; // Es wird nur die Seite für die "recentEntries" aktualisiert
        
                window.updateTableData(dataSource, page);
            });
        });
        
       }

       function updatePagination(totalEntries, currentPage) {
        console.log("Refresh pagination for", totalEntries, "entries");
    
        // Erstmal Pagination Container leeren
        paginationContainer.innerHTML = "";
    
        const totalPages = Math.ceil(totalEntries / window.rowsPerPage);
    
        // Nur wenn überhaupt Einträge vorhanden sind, bauen wir Pagination auf
        if (totalPages > 1) {
            if (currentPage > 1) {
                const prevLink = createPageLink(currentPage - 1, "&laquo;");
                paginationContainer.appendChild(prevLink);
            }
    
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
    
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - (totalPages < 5 ? endPage - 1 : 4));
            }
    
            if (startPage > 1) {
                paginationContainer.appendChild(createPageLink(1));
                if (startPage > 2) {
                    paginationContainer.appendChild(createEllipsis());
                }
            }
    
            for (let i = startPage; i <= endPage; i++) {
                paginationContainer.appendChild(createPageLink(i, i === currentPage ? i : null));
            }
    
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationContainer.appendChild(createEllipsis());
                }
                paginationContainer.appendChild(createPageLink(totalPages));
            }
    
            if (currentPage < totalPages) {
                const nextLink = createPageLink(currentPage + 1, "&raquo;");
                paginationContainer.appendChild(nextLink);
            }
    
            // Event Listener für neue Links binden
            paginationContainer.querySelectorAll('.pagination-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const page = parseInt(this.dataset.page);
                    const dataSource = window.filteredEntries.length > 0 
                        ? window.filteredEntries 
                        : window.recentEntries;
                    window.currentPageRecent = page;
                    window.updateTableData(dataSource, page);
                });
            });
        }
    }
    

    function createEllipsis() {
        const span = document.createElement("span");
        span.className = "pagination-ellipsis";
        span.textContent = "...";
        return span;
    }

    function createPageLink(page, text = null) {
        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.className = "pagination-link";
        pageLink.dataset.page = page;
        pageLink.innerHTML = text || page;
        return pageLink;
    }

    // Reset-Funktion
    function handleReset() {
        console.log("Reset done");
        window.filteredEntries = [];
        window.currentPageRecent = 1; // Wir setzen nur die Seite für die "recentEntries" zurück
        window.updateTableData(window.recentEntries, window.currentPageRecent); // Nur die "recentEntries" werden verwendet
    }
    

    // Event Listener für Reset-Button
    if (resetBtn) {
        resetBtn.addEventListener("click", handleReset);
    }

    // Initialisierung beim Laden
    function initialize() {
        console.log("Initializing table...");
        if (window.recentEntries) {
            window.updateTableData(window.recentEntries, window.currentPageRecent);
        }
    }

    // Verzögerte Initialisierung für den Fall, dass die Daten später geladen werden
    const initInterval = setInterval(() => {
        if (window.recentEntries) {
            clearInterval(initInterval);
            initialize();
        }
    }, 100);

    // Timeout nach 5 Sekunden
    setTimeout(() => {
        clearInterval(initInterval);
        if (!window.recentEntries) {
            console.error("Couldn't fetch data");
        }
    }, 5000);
});