document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContainer');
    const toggleButton = document.getElementById('toggleSidebar');

    // Sidebar unsichtbar machen, um Flackern zu vermeiden
    sidebar.style.visibility = 'hidden';

    function applySidebarState(isCollapsed) {
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.style.marginLeft = '10%';
            toggleButton.textContent = '»';
            toggleButton.style.left = '0';
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '28%';
            toggleButton.textContent = '«';
            toggleButton.style.left = '25%';
        }

        // Show sidebar after load
        sidebar.style.visibility = 'visible';
    }

    function toggleSidebar() {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        
        // Save state in localstorage
        localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');

        // Save state in session
        fetch('save_session.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'sidebar_collapsed=' + (isCollapsed ? '1' : '0')
        });

        applySidebarState(isCollapsed);
    }

    toggleButton.addEventListener('click', toggleSidebar);

    // 1. Get statea from localstorage
    let storedState = localStorage.getItem('sidebarCollapsed');

    if (storedState !== null) {
        applySidebarState(storedState === '1');
    } else {
        // 2. Fallback from session
        fetch('fetch_session.php?sidebar')
            .then(response => response.text())
            .then(state => {
                let isCollapsed = state.trim() === '1';
                localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
                applySidebarState(isCollapsed);
            })
            .catch(() => {
                // last fallback use default
                applySidebarState(false);
            });
    }
});
