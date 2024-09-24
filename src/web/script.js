// Assuming your JSON file is named 'Full_Database_Backend.json' and is in the same directory
document.addEventListener("DOMContentLoaded", function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const dataTableElement = document.getElementById('data-table');

    // Show the loading overlay
    loadingOverlay.style.display = 'flex';

    // Define the default visible columns
    const defaultVisibleColumns = [0, 1, 2, 3, 8, 9];

    // Function to fetch and load data
    function loadData() {
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(data => {
                // Extract headers from the data
                const headers = Object.keys(data[0]);

                // Create columns array with 'data', 'title', 'visible', and 'width'
                const columns = headers.map((header, index) => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim(),
                    visible: defaultVisibleColumns.includes(index),
                    width: '150px', // Set a default width (adjust as needed)
                }));

                // Initialize DataTables
                $(document).ready(function () {
                    var table = $('#data-table').DataTable({
                        data: data,
                        columns: columns,
                        dom: '<"top"Bf>rt<"bottom"lip><"clear">',
                        buttons: [
                            {
                                extend: 'colvis',
                                text: 'Select Columns',
                                columns: ':not(:first-child)'
                            },
                            {
                                text: 'Reset Columns',
                                action: function (e, dt, node, config) {
                                    // Clear the saved state in localStorage
                                    dt.state.clear();

                                    // Reset all columns to invisible
                                    dt.columns().visible(false);

                                    // Set default columns to visible
                                    defaultVisibleColumns.forEach(function (colIndex) {
                                        dt.column(colIndex).visible(true);
                                    });

                                    // Redraw the table without resetting the paging
                                    dt.draw(false);

                                    // Adjust columns
                                    dt.columns.adjust();
                                }
                            }
                        ],
                        // Disable stateSave to prevent issues with column visibility
                        stateSave: false,
                        initComplete: function (settings, json) {
                            // Hide the loading overlay and show the table after DataTables initialization is complete
                            loadingOverlay.style.display = 'none';
                            dataTableElement.style.display = 'table';
                        },
                        pagingType: "full_numbers",
                        language: {
                            search: "",
                            searchPlaceholder: "Search records"
                        },
                        pageLength: 100,
                        lengthMenu: [
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
                        ],
                        order: [[0, 'asc']],
                        responsive: false, // Disable Responsive extension
                        autoWidth: false,
                        scrollX: true, // Enable horizontal scrolling
                        scrollCollapse: true,
                    });

                    // Add event listener for column visibility change
                    table.on('column-visibility.dt', function (e, settings, column, state) {
                        table.columns.adjust();
                    });
                });
            })
            .catch(error => {
                console.error('Error loading the data:', error);
                // Hide the loading overlay even if there's an error
                loadingOverlay.style.display = 'none';
            });
    }

    // Load the data
    loadData();
});
