// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // Get references to the loading overlay and data table elements
    const loadingOverlay = document.getElementById('loading-overlay');
    const dataTableElement = document.getElementById('data-table');

    // Display the loading overlay
    loadingOverlay.style.display = 'flex';

    // Define the default visible columns by their indices
    const defaultVisibleColumns = [0, 1, 2, 3, 8, 9];

    // Function to load data from the JSON file and initialize the DataTable
    function loadData() {
        // Fetch data from the JSON file
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                // Extract headers from the first data object
                const headers = Object.keys(data[0]);

                // Map headers to DataTables column definitions
                const columns = headers.map((header, index) => ({
                    data: header, // Data property for the column
                    title: header.replace(/([A-Z])/g, ' $1').trim(), // Format header title
                    visible: defaultVisibleColumns.includes(index) // Set column visibility
                }));

                // Initialize the DataTable once the document is ready
                $(document).ready(function () {
                    var table = $('#data-table').DataTable({
                        data: data, // Set the data for the table
                        columns: columns, // Set the column definitions
                        dom: '<"top"Bf>rt<"bottom"lip><"clear">', // Define the table control elements
                        buttons: [
                            {
                                extend: 'colvis', // Column visibility button
                                text: 'Select Columns', // Button text
                                columns: ':not(:first-child)', // Exclude the first column
                                className: 'colvis-button', // Add a custom class to apply specific styling
                            },
                            {
                                text: 'Reset Columns', // Button to reset column visibility
                                action: function (e, dt, node, config) {
                                    // Clear any saved state
                                    dt.state.clear();

                                    // Hide all columns
                                    dt.columns().visible(false);

                                    // Show default columns
                                    defaultVisibleColumns.forEach(function (colIndex) {
                                        dt.column(colIndex).visible(true);
                                    });

                                    // Adjust columns and redraw the table
                                    dt.columns.adjust().draw(false);

                                    // Save the new state
                                    dt.state.save();

                                    // Ensure the styles are correctly updated after reset
                                    updateButtonStyles(node);
                                }
                            }
                        ],
                        "stateSave": true, // Enable state saving (remember column visibility)
                        "stateDuration": -1, // Save state indefinitely
                        "initComplete": function (settings, json) {
                            // Hide the loading overlay and display the table
                            loadingOverlay.style.display = 'none';
                            dataTableElement.style.display = 'table';
                        },
                        "pagingType": "full_numbers", // Use full pagination controls
                        "language": {
                            "search": "", // Remove default search label text
                            "searchPlaceholder": "Search records" // Set placeholder for search input
                        },
                        "pageLength": 100, // Default number of rows per page
                        "lengthMenu": [
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], // Page length options
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] // Labels for the options
                        ],
                        "order": [[0, 'asc']], // Default sorting (by first column ascending)
                        "autoWidth": false // Disable automatic column width calculation
                    });

                    // Adjust table columns when column visibility changes
                    table.on('column-visibility.dt', function (e, settings, column, state) {
                        table.columns.adjust().draw(false);
                    });

                    // Update the button styles dynamically based on state
                    updateAllButtonStyles();
                });
            })
            .catch(error => {
                // Log any errors to the console
                console.error('Error loading the data:', error);

                // Hide the loading overlay in case of error
                loadingOverlay.style.display = 'none';
            });
    }

    // Helper function to update the button styles based on active state
    function updateButtonStyles(buttonNode) {
        if (buttonNode.hasClass('active')) {
            buttonNode.css({
                'background-color': '#134F9B', // Blue background for active
                'color': '#FFFFFF' // White text color for active
            });
        } else {
            buttonNode.css({
                'background-color': '#FFFFFF', // White background for inactive
                'color': '#134F9B' // Blue text color for inactive
            });
        }
    }

    // Function to update styles for all buttons initially and on click
    function updateAllButtonStyles() {
        $('.dt-button').each(function() {
            updateButtonStyles($(this));
        });

        $('.dt-button').on('click', function() {
            updateButtonStyles($(this));
        });
    }

    // Call the loadData function to fetch data and initialize the table
    loadData();
});
