// Globale Variablen für Filter- und Spaltenzustand
window.filterSystem = {
    currentFilter: JSON.parse(localStorage.getItem('lastActiveFilter')) || {
      searchTerm: "",
      exactMatch: false,
      combinedFilters: []
    },
    savedFilters: JSON.parse(localStorage.getItem('savedFilters')) || {},
    columnVisibility: JSON.parse(localStorage.getItem('columnVisibility')) || {},
    columnKeys: [
      'EVENT_TIMESTAMP', 'OS_USERNAME', 'USERHOST', 'DBUSERNAME',
      'ACTION_NAME', 'RETURN_CODE', 'CLIENT_PROGRAM_NAME', 'OS_PROCESS',
      'SYSTEM_PRIVILEGE_USED', 'CURRENT_USER', 'UNIFIED_AUDIT_POLICIES', 'SOURCE_DATABASE'
    ],
    columnTitles: {
      'EVENT_TIMESTAMP': 'Event Timestamp',
      'OS_USERNAME': 'OS User',
      'USERHOST': 'Host',
      'DBUSERNAME': 'DB User',
      'ACTION_NAME': 'Action',
      'RETURN_CODE': 'Return Code',
      'CLIENT_PROGRAM_NAME': 'Client Program',
      'OS_PROCESS': 'OS Process',
      'SYSTEM_PRIVILEGE_USED': 'Privilege',
      'CURRENT_USER': 'Current User',
      'UNIFIED_AUDIT_POLICIES': 'Audit Policies',
      'SOURCE_DATABASE': 'Source Database'
    }
  };
  
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Filter- und Spaltensystem wird initialisiert");
  
    // 1. UI erstellen
    createFilterUI();
  
    // 2. Spaltenvisibility initialisieren
    initializeColumnVisibility();
  
    // 3. Event-Listener für Tabellenänderungen
    setupTableObserver();
  
    // 4. Gespeicherte Filter anzeigen
    updateUI();
  
    // 5. Tabellenupdate-Funktion anpassen
    patchTableUpdateFunction();

    setupKeyboardListener();
  
    console.log("System initialisierung abgeschlossen");
  });
  
  /* ========== UI ERSTELLUNG ========== */
  function createFilterUI() {
    const container = document.createElement("div");
    container.className = "unified-filter-system";
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
  
    // Filter-Sektion
    container.appendChild(createSearchSection());
    
    // Spalten-Sektion
    container.appendChild(createColumnsSection());
  
    // Container einfügen
    const tableContainer = document.getElementById("table-container");
    if (tableContainer?.parentNode) {
      tableContainer.parentNode.insertBefore(container, tableContainer);
    }
  }
  
  function createSearchSection() {
    const section = document.createElement("div");
    section.style.borderBottom = "1px solid #eee";
    section.style.paddingBottom = "15px";
  
    // Suchzeile
    const searchRow = document.createElement("div");
    searchRow.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 10px;
    `;
  
    // Suchinput
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "filterSystemInput";
    searchInput.className = "form-control";
    searchInput.placeholder = "Search...";
    searchInput.style.flex = "1 1 300px";
    searchInput.value = window.filterSystem.currentFilter.searchTerm;
  
    // Exakte Suche Checkbox
    const exactMatchCheckbox = document.createElement("input");
    exactMatchCheckbox.type = "checkbox";
    exactMatchCheckbox.id = "exactMatchCheckbox";
    exactMatchCheckbox.checked = window.filterSystem.currentFilter.exactMatch;
    
    const exactMatchLabel = document.createElement("label");
    exactMatchLabel.htmlFor = "exactMatchCheckbox";
    exactMatchLabel.textContent = "Exact";
    exactMatchLabel.style.marginRight = "10px";
  
    const exactMatchContainer = document.createElement("div");
    exactMatchContainer.style.display = "flex";
    exactMatchContainer.style.alignItems = "center";
    exactMatchContainer.style.gap = "5px";
    exactMatchContainer.appendChild(exactMatchCheckbox);
    exactMatchContainer.appendChild(exactMatchLabel);
  
    // Buttons
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-secondary";
    saveBtn.textContent = "Save";
    saveBtn.onclick = saveCurrentFilter;
  
    const resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-danger";
    resetBtn.textContent = "Clear";
    resetBtn.style.backgroundColor = "red";
    resetBtn.onclick = resetFilter;
  
    // 1. Erweitere die Button-Initialisierung in createSearchSection()
    const combineBtn = document.createElement("button");
    combineBtn.className = "btn btn-info";
    combineBtn.textContent = "+ Combine";
    combineBtn.style.backgroundColor = "#0d6efd";
    combineBtn.onclick = addCombinedFilter;
    //combineBtn.setAttribute('data-tooltip', 'Tipp: Drücken Sie + im Eingabefeld');
    combineBtn.setAttribute('aria-label', 'Filter kombinieren');
  
    combineBtn.onclick = addCombinedFilter;

  
    searchRow.append(searchInput, exactMatchContainer, saveBtn, resetBtn, combineBtn);
  
    // Aktiver Filter Anzeige
    const activeFilterDisplay = document.createElement("div");
    activeFilterDisplay.id = "activeFilterDisplay";
    activeFilterDisplay.style.cssText = `
      padding: 8px 12px;
      background: #e9ecef;
      border-radius: 4px;
      font-size: 14px;
      min-height: 36px;
      margin-top: 10px;
    `;
  
    // Gespeicherte Filter
    const savedFiltersHeader = document.createElement("h5");
    savedFiltersHeader.textContent = "Saved filters:";
    savedFiltersHeader.style.margin = "15px 0 5px 0";
  
    const savedFiltersContainer = document.createElement("div");
    savedFiltersContainer.id = "savedFiltersContainer";
    savedFiltersContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;
  
    section.append(searchRow, activeFilterDisplay, savedFiltersHeader, savedFiltersContainer);
  
    // Event-Listener
    searchInput.addEventListener("input", (e) => {
      window.filterSystem.currentFilter.searchTerm = e.target.value;
      applyCurrentFilter();
    });
  
    exactMatchCheckbox.addEventListener("change", (e) => {
      window.filterSystem.currentFilter.exactMatch = e.target.checked;
      applyCurrentFilter();
    });
  
    return section;
  }
  
  function createColumnsSection() {
    const section = document.createElement("div");
    section.style.paddingTop = "15px";
  
    const header = document.createElement("h5");
    header.textContent = "Show columns:";
    header.style.marginBottom = "10px";
  
    // Header-Container für Titel + Reset-Link
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.alignItems = "center";
    headerContainer.style.justifyContent = "space-between";
    
    // Reset-Link erstellen
    const resetLink = document.createElement("a");
    resetLink.href = "#";
    resetLink.style.cssText = `
      cursor: pointer;
      color: #007bff;
      font-size: 0.8em;
      text-decoration: none;
      margin-left: 10px;
    `;
    resetLink.textContent = "Show all";
    resetLink.onclick = function(e) {
      e.preventDefault();
      // Alle Spalten aktivieren
      window.filterSystem.columnKeys.forEach(key => {
        window.filterSystem.columnVisibility[key] = true;
      });
      
      // Checkboxen aktualisieren
      document.querySelectorAll('#columnsContainer input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
      });
      
      // Zustand speichern und anwenden
      localStorage.setItem('columnVisibility', JSON.stringify(window.filterSystem.columnVisibility));
      applyColumnVisibility();
    };
  
    headerContainer.appendChild(header);
    headerContainer.appendChild(resetLink);
  
    const columnsContainer = document.createElement("div");
    columnsContainer.id = "columnsContainer";
    columnsContainer.style.cssText = `
      display: flex;
      gap: 10px;
    `;
  
    // Checkboxen für alle Spalten erstellen
    window.filterSystem.columnKeys.forEach(columnKey => {
      const checkboxId = `colToggle_${columnKey}`;
      const isChecked = window.filterSystem.columnVisibility[columnKey] !== false;
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = isChecked;
      checkbox.onchange = () => toggleColumnVisibility(columnKey);
  
      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.textContent = window.filterSystem.columnTitles[columnKey] || columnKey;
  
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "5px";
      container.style.flex = "1 1 200px";
      container.appendChild(checkbox);
      container.appendChild(label);
  
      columnsContainer.appendChild(container);
    });
  
    section.append(headerContainer, columnsContainer);
    return section;
  }
  
  /* ========== SPALTEN-VISIBILITY ========== */
  function initializeColumnVisibility() {
    // Setze Standardwerte für nicht gespeicherte Spalten
    let needsSave = false;
    window.filterSystem.columnKeys.forEach(key => {
      if (window.filterSystem.columnVisibility[key] === undefined) {
        window.filterSystem.columnVisibility[key] = true;
        needsSave = true;
      }
    });
    
    if (needsSave) {
      localStorage.setItem('columnVisibility', JSON.stringify(window.filterSystem.columnVisibility));
    }
  }
  
  function toggleColumnVisibility(columnKey) {
    window.filterSystem.columnVisibility[columnKey] = 
      !window.filterSystem.columnVisibility[columnKey];
    
    localStorage.setItem('columnVisibility', JSON.stringify(window.filterSystem.columnVisibility));
    applyColumnVisibility();
  }
  
  function applyColumnVisibility() {
    const table = document.querySelector("#table-container table");
    if (!table) return;
  
    const headers = table.querySelectorAll("thead th");
    const rows = table.querySelectorAll("tbody tr");
  
    window.filterSystem.columnKeys.forEach((columnKey, index) => {
      const isVisible = window.filterSystem.columnVisibility[columnKey] !== false;
      
      if (headers[index]) {
        headers[index].style.display = isVisible ? "" : "none";
      }
      
      rows.forEach(row => {
        if (row.cells[index]) {
          row.cells[index].style.display = isVisible ? "" : "none";
        }
      });
    });
  }

/* ========== ENHANCED KEYBOARD CONTROL ========== */
function setupKeyboardListener() {
    const filterInput = document.getElementById("filterSystemInput");
    
    filterInput.addEventListener('keydown', function(e) {
      // + Taste als Kombinieren-Shortcut
      if (e.key === '+' && !e.shiftKey) {
        e.preventDefault();
        triggerFilterAnimation(); // Pulsierender Effekt nach Abschluss der Filterung
        addCombinedFilter();
      }
      
      // Enter für schnelle Filterung
      // not necessary because live filtering is active, so ..who cares //k0lp4tzki 25.03.2025
      if (e.key === 'Enter') {
        applyCurrentFilter();
      }
      
      // Escape zum Zurücksetzen
      if (e.key === 'Escape') {
        resetFilter();
      }
    });
  }
  
  
/* ========== KOMBINIERTE FILTER (angepasst) ========== */
// 2. Erweiterte addCombinedFilter()-Funktion mit automatischem Hinweis
function addCombinedFilter() {
    const filterInput = document.getElementById("filterSystemInput");
    let currentTerm = filterInput.value.trim();
        // Nur beim ersten Mal kombinieren Hinweis zeigen
        if (!localStorage.getItem('combineHintShown')) {
            showFirstFilterHint();
            localStorage.setItem('combineHintShown', 'true');
          }
  
    // +-Zeichen am Ende automatisch verarbeiten
    if (currentTerm.endsWith('+')) {
      currentTerm = currentTerm.slice(0, -1).trim();
      filterInput.value = currentTerm;
    }
  
    if (!currentTerm) {
      showQuickToast("❌ Missing Keyword", 'error');
      return;
    }
  
    // Filter hinzufügen
    window.filterSystem.currentFilter.combinedFilters.push({
      term: currentTerm,
      exact: document.getElementById("exactMatchCheckbox").checked
    });
  
    // UI zurücksetzen
    filterInput.value = "";
    filterInput.focus();
    triggerButtonPulse(combineBtn);
    applyCurrentFilter();

  }

// 3. Automatischer Einmal-Hinweis
function showFirstFilterHint() {
    const hint = document.createElement('div');
    hint.className = 'first-filter-hint';
    hint.innerHTML = `
      <span>Tipp: Press + to combine filter</span>
      <button class="close-hint">&times;</button>
    `;
    
    document.querySelector('.unified-filter-system').appendChild(hint);
    
    document.querySelector('.close-hint').addEventListener('click', () => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 300);
    });
  }

  /* ========== VISUAL FEEDBACK ========== */
function triggerFilterAnimation() {
    const btn = document.querySelector("button.btn-info");
    btn.classList.add('btn-pulse');
    setTimeout(() => btn.classList.remove('btn-pulse'), 300);
  }
  
// 4. Mini-Toast für Feedback (optimiert)
function showQuickToast(message, type = 'info') {
    const toast = document.createElement("div");
    toast.className = `quick-toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
  
  function clearCombinedFilters() {
    window.filterSystem.currentFilter.combinedFilters = [];
    applyCurrentFilter();
  }
  
  window.removeCombinedFilter = function(index) {
    window.filterSystem.currentFilter.combinedFilters.splice(index, 1);
    applyCurrentFilter();
  };
  
/* ========== FILTER LOGIK ========== */
function applyCurrentFilter() {
  const { searchTerm, exactMatch, combinedFilters } = window.filterSystem.currentFilter;
  let filtered = window.recentEntries; // Nur "recentEntries" verwenden, ohne den "History"-Teil

  // Hauptfilter anwenden
  if (searchTerm.trim()) {
      filtered = applySingleFilter(filtered, searchTerm, exactMatch);
  }

  // Kombinierte Filter anwenden (UND-Verknüpfung)
  if (combinedFilters.length > 0) {
      combinedFilters.forEach(filter => {
          filtered = applySingleFilter(filtered, filter.term, filter.exact);
      });
  }

  // Status speichern und UI aktualisieren
  localStorage.setItem('lastActiveFilter', JSON.stringify(window.filterSystem.currentFilter));
  updateUI();
  window.filteredEntries = filtered;
  window.updateTableData(filtered, 1);
}

  
  function applySingleFilter(data, term, exact) {
    if (!term) return data;
    
    return data.filter(entry => 
      window.filterSystem.columnKeys.some(key => {
        if (window.filterSystem.columnVisibility[key] === false) return false;
        
        let value = String(entry[key] || "");
        if (key === 'RETURN_CODE') value = value.replace(/^ORA-/, '');
        value = value.toLowerCase();
        const searchTerm = term.toLowerCase().trim();
        return exact 
          ? value === searchTerm
          : value.includes(searchTerm);
      })
    );
  }
  
  function resetFilter() {
    window.filterSystem.currentFilter = { 
      searchTerm: "", 
      exactMatch: false,
      combinedFilters: []
    };
    document.getElementById("filterSystemInput").value = "";
    document.getElementById("exactMatchCheckbox").checked = false;
    applyCurrentFilter();
  }
  
  function saveCurrentFilter() {
    const filterName = prompt("Enter name for filter:");
    if (!filterName) return;
  
    if (window.filterSystem.savedFilters[filterName] && 
        !confirm(`Filter "${filterName}" already exists. Overwrite?`)) {
      return;
    }
  
    window.filterSystem.savedFilters[filterName] = {...window.filterSystem.currentFilter};
    localStorage.setItem('savedFilters', JSON.stringify(window.filterSystem.savedFilters));
    updateUI();
  }
  
  /* ========== UI AKTUALISIERUNG ========== */
  function updateUI() {
    updateActiveFilterDisplay();
    updateSavedFiltersDisplay();
  }
  
  function updateActiveFilterDisplay() {
    const display = document.getElementById("activeFilterDisplay");
    const { searchTerm, exactMatch, combinedFilters } = window.filterSystem.currentFilter;
    
    let html = "";
    
    // Hauptfilter
    if (searchTerm) {
      html += `<div style="margin-bottom: 5px">
        <strong>Primärfilter:</strong> 
        <span style="color: #007bff">${escapeHtml(searchTerm)}</span>
        <span class="badge ${exactMatch ? 'bg-primary' : 'bg-secondary'}">${exactMatch ? 'exact' : 'contains'}</span>
      </div>`;
    }
  
    // Kombinierte Filter
    if (combinedFilters.length > 0) {
      html += `<div><strong>Combined filter:</strong></div>`;
      combinedFilters.forEach((filter, index) => {
        html += `<div style="margin: 3px 0 3px 10px">
          ${index + 1}. ${escapeHtml(filter.term)}
          <span class="badge ${filter.exact ? 'bg-primary' : 'bg-secondary'}">${filter.exact ? 'exact' : 'contains'}</span>
          <a href="#" onclick="removeCombinedFilter(${index})" style="color: #dc3545; margin-left: 5px">×</a>
        </div>`;
      });
      html += `<a href="#" onclick="clearCombinedFilters()" style="font-size: 0.8em">Alle entfernen</a>`;
    }
  
    display.innerHTML = html || "<em>No active filter</em>";
  }
  
  function updateSavedFiltersDisplay() {
    const container = document.getElementById("savedFiltersContainer");
    container.innerHTML = "";
  
    if (Object.keys(window.filterSystem.savedFilters).length === 0) {
      container.innerHTML = '<div style="color: #6c757d">No saved filters yet</div>';
      return;
    }
  
    Object.entries(window.filterSystem.savedFilters).forEach(([name, filter]) => {
      const filterItem = document.createElement("div");
      filterItem.className = "saved-filter-item";
      filterItem.style.cssText = `
        padding: 5px 10px;
        background: #e9ecef;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      filterItem.onmouseover = () => filterItem.style.background = "#dee2e6";
      filterItem.onmouseout = () => filterItem.style.background = "#e9ecef";
  
      const nameSpan = document.createElement("span");
      nameSpan.textContent = name;
      nameSpan.style.flex = "1";
      nameSpan.onclick = () => loadSavedFilter(name);
  
      const badge = document.createElement("span");
      badge.className = "badge " + (filter.exactMatch ? "bg-primary" : "bg-secondary");
      badge.textContent = filter.exactMatch ? "exakt" : "containts";
      badge.style.fontSize = "0.75em";
  
      const deleteBtn = document.createElement("span");
      deleteBtn.innerHTML = "&times;";
      deleteBtn.style.cssText = `
        color: #dc3545;
        cursor: pointer;
        font-weight: bold;
        font-size: 1.2em;
        margin-left: 5px;
      `;
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteSavedFilter(name);
      };
  
      filterItem.append(nameSpan, badge, deleteBtn);
      container.append(filterItem);
    });
  }
  
  function loadSavedFilter(name) {
    const filter = window.filterSystem.savedFilters[name];
    if (!filter) return;
  
    window.filterSystem.currentFilter = {...filter};
    document.getElementById("filterSystemInput").value = filter.searchTerm;
    document.getElementById("exactMatchCheckbox").checked = filter.exactMatch;
    applyCurrentFilter();
  }
  
  function deleteSavedFilter(name) {
    if (confirm(`Filter "${name}" wirklich löschen?`)) {
      delete window.filterSystem.savedFilters[name];
      localStorage.setItem('savedFilters', JSON.stringify(window.filterSystem.savedFilters));
      updateUI();
    }
  }
  
  /* ========== HELPER FUNKTIONEN ========== */
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  function setupTableObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          applyColumnVisibility();
          bindCellClickEvents();
        }
      });
    });
  
    observer.observe(document.getElementById("table-container"), {
      childList: true,
      subtree: true
    });
  }
  
  function patchTableUpdateFunction() {
    const originalUpdateTableData = window.updateTableData;
    window.updateTableData = function(data, page) {
      originalUpdateTableData(data, page);
      setTimeout(() => {
        bindCellClickEvents();
        applyColumnVisibility();
      }, 0);
    };
  }
  
  function bindCellClickEvents() {
    document.querySelectorAll('.clickable-cell').forEach(cell => {
      cell.onclick = function() {
        const columnIndex = cell.cellIndex;
        const columnKey = window.filterSystem.columnKeys[columnIndex];
        let cellValue = cell.textContent.trim();
  
        if (columnKey === 'EVENT_TIMESTAMP') {
          cellValue = cellValue.substring(0, 13);
        } else if (columnKey === 'RETURN_CODE') {
          cellValue = cellValue.replace(/^ORA-/i, '');
        }
  
        window.filterSystem.currentFilter = {
          searchTerm: cellValue,
          exactMatch: columnKey !== 'EVENT_TIMESTAMP' && columnKey !== 'RETURN_CODE',
          combinedFilters: [] // Zurücksetzen beim neuen Zellenfilter
        };
  
        document.getElementById("filterSystemInput").value = cellValue;
        document.getElementById("exactMatchCheckbox").checked = window.filterSystem.currentFilter.exactMatch;
        applyCurrentFilter();
      };
    });
  }
  
  /* ========== GLOBALE FUNKTIONEN ========== */
  window.setFilter = function(cell) {
    const columnIndex = cell.cellIndex;
    const columnKey = window.filterSystem.columnKeys[columnIndex];
    let cellValue = cell.textContent.trim();
  
    if (columnKey === 'EVENT_TIMESTAMP') cellValue = cellValue.substring(0, 13);
    if (columnKey === 'RETURN_CODE') cellValue = cellValue.replace(/^ORA-/, '');
  
    window.filterSystem.currentFilter = {
      searchTerm: cellValue,
      exactMatch: false,
      combinedFilters: []
    };
    
    document.getElementById("filterSystemInput").value = columnKey === 'RETURN_CODE' ? `ORA-${cellValue}` : cellValue;
    document.getElementById("exactMatchCheckbox").checked = false;
    applyCurrentFilter();
  };
  
  window.setFilterByChart = function(filterValue) {
    window.filterSystem.currentFilter = {
      searchTerm: filterValue,
      exactMatch: false,
      combinedFilters: []
    };
    document.getElementById("filterSystemInput").value = filterValue;
    document.getElementById("exactMatchCheckbox").checked = false;
    applyCurrentFilter();
  };
  
  window.toggleColumn = function(columnKey, visible) {
    window.filterSystem.columnVisibility[columnKey] = visible;
    localStorage.setItem('columnVisibility', JSON.stringify(window.filterSystem.columnVisibility));
    applyColumnVisibility();
  };