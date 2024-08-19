import { loadData } from 'src/web/js/loadData.js';
import { initializeDataTables } from 'src/web/js/dataTablesInit.js';

document.addEventListener("DOMContentLoaded", function() {
    const loadingBar = document.getElementById('loading-bar');
    const dataTable = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'block';

    // Call the loadData function
    loadData();
});