// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // Get references to the loading overlay and data table elements
    const loadingOverlay = document.getElementById('loading-overlay');
    const dataTableElement = document.getElementById('data-table');

    // The loading overlay is visible by default (set in CSS)
    // The data table is hidden by default (has 'hidden' class)

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
                                collectionLayout: 'three-column' // Adjust layout if needed
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

                                    // Update button classes
                                    updateButtonClasses();
                                }
                            }
                        ],
                        "stateSave": true, // Enable state saving (remember column visibility)
                        "stateDuration": -1, // Save state indefinitely
                        "initComplete": function (settings, json) {
                            // Hide the loading overlay
                            loadingOverlay.classList.add('hidden');

                            // Show the data table
                            dataTableElement.classList.remove('hidden');

                            // Update button classes
                            updateButtonClasses();
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

                    // Function to update button classes based on column visibility
                    function updateButtonClasses() {
                        var colvisButtons = $('.dt-button-collection .dt-button');

                        // Loop through each column
                        table.columns().every(function (index) {
                            var column = this;
                            var button = colvisButtons.eq(index);

                            if (column.visible()) {
                                button.addClass('column-visible');
                            } else {
                                button.removeClass('column-visible');
                            }
                        });
                    }

                    // Update button classes after columns are shown/hidden
                    table.on('column-visibility.dt', function (e, settings, column, state) {
                        updateButtonClasses();
                    });

                    // Update button classes when the column visibility collection is shown
                    $(document).on('click', '.buttons-colvis', function () {
                        setTimeout(function () {
                            updateButtonClasses();
                        }, 0);
                    });
                });
            })
            .catch(error => {
                // Log any errors to the console
                console.error('Error loading the data:', error);

                // Hide the loading overlay in case of error
                loadingOverlay.classList.add('hidden');
            });
    }

    // Call the loadData function to fetch data and initialize the table
    loadData();
});
