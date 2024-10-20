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
                                text: 'Select Columns',
                                action: function (e, dt, node, config) {
                                    // Toggle the visibility of the custom column visibility buttons
                                    $('.custom-colvis-btns').toggle();
                                }
                            },
                            {
                                text: 'Reset Columns',
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
                            },
                            {
                                text: 'Column Visibility',
                                className: 'custom-colvis-btns',
                                action: function () {},
                                extend: null
                            }
                        ],
                        "stateSave": true, // Enable state saving (remember column visibility)
                        "stateDuration": -1, // Save state indefinitely
                        "initComplete": function (settings, json) {
                            // Hide the loading overlay
                            loadingOverlay.classList.add('hidden');

                            // Show the data table
                            dataTableElement.classList.remove('hidden');

                            // Create custom column visibility buttons
                            createCustomColVisButtons();
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

                    // Hide the custom column visibility buttons initially
                    $('.custom-colvis-btns').hide();

                    // Function to create custom column visibility buttons
                    function createCustomColVisButtons() {
                        var buttonsContainer = $('.dt-buttons');

                        // Create a container for the custom buttons
                        var customButtonsDiv = $('<div class="custom-colvis-btns"></div>');
                        buttonsContainer.append(customButtonsDiv);

                        // Loop through each column
                        table.columns().every(function (index) {
                            var column = this;
                            var columnName = column.header().innerText;

                            // Create a button for each column
                            var button = $('<button class="dt-button"></button>')
                                .text(columnName)
                                .on('click', function () {
                                    // Toggle column visibility
                                    var visible = column.visible();
                                    column.visible(!visible);

                                    // Update button active state
                                    $(this).toggleClass('active', !visible);

                                    // Save the new state
                                    table.state.save();
                                });

                            // Set initial active state
                            if (column.visible()) {
                                button.addClass('active');
                            }

                            // Append the button to the custom buttons div
                            customButtonsDiv.append(button);
                        });
                    }
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
