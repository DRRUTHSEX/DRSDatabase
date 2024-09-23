// Assuming your JSON file is named 'Full_Database_Backend.json' and is in the same directory
document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loading-bar');
    const dataTableElement = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'flex';

    // Define the default visible columns
    const defaultVisibleColumns = [0, 1, 2, 3, 8, 9];

    // Function to fetch and load data
    function loadData() {
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(data => {
                // Extract headers from the data
                const headers = Object.keys(data[0]);

                // Create columns array with 'data', 'title', and 'visible'
                const columns = headers.map((header, index) => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim(),
                    visible: defaultVisibleColumns.includes(index) // Set visibility based on default
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

                                    // Save the new state
                                    dt.state.save();

                                    // Redraw the table without resetting the paging
                                    dt.draw(false);
                                }
                            }
                        ],
                        "stateSave": true,
                        "stateDuration": -1, // Set to -1 to save the state indefinitely
                        "initComplete": function (settings, json) {
                            // Hide the loading bar and show the table after DataTables initialization is complete
                            loadingBar.style.display = 'none';
                            dataTableElement.style.display = 'table';
                        },
                        "pagingType": "full_numbers", // Displays page numbers
                        "language": {
                            "search": "",
                            "searchPlaceholder": "Search records"
                        },
                        "pageLength": 100,
                        "lengthMenu": [
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
                        ],
                        "order": [[0, 'asc']], // Sort by the first column (index 0) ascending
                        "responsive": true // Enable responsive table
                    });
                });
            })
            .catch(error => {
                console.error('Error loading the data:', error);
                // Hide the loading bar even if there's an error
                loadingBar.style.display = 'none';
            });
    }

    // Load the data
    loadData();
});
