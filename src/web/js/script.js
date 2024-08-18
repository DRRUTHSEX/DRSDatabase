import { loadData } from './loadData.js';
import { createTableHeaders, createTableBody } from './tableManipulation.js';
import { initializeDataTables } from './dataTablesInit.js';

document.addEventListener("DOMContentLoaded", function() {
    const loadingBar = document.getElementById('loading-bar');
    const dataTable = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'block';

    // Call the loadData function
    loadData();

    // Call the table manipulation functions
    createTableHeaders();
    createTableBody();

    // Call the DataTables initialization function
    initializeDataTables();
});