document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById('loading-bar');
    const dataTableElement = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'flex';

    // Function to fetch and load data
    function loadData() {
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(data => {
                // Extract headers from the data
                const headers = Object.keys(data[0]);

                // Determine which columns should be visible by default
                // Columns 1,2,3,4,9,10 are visible (indices 0, 1, 2, 3, 8, 9)
                const visibleColumns = [0, 1, 2, 3, 8, 9];

                // Optionally, define column widths
                const columnWidths = [
                    { width: '150px' }, // Column 1
                    { width: '200px' }, // Column 2
                    { width: '200px' }, // Column 3
                    { width: '200px' }, // Column 4
                    // ... Add widths for other columns as needed
                ];

                // Create columns array with 'data', 'title', 'visible', and 'width'
                const columns = headers.map((header, index) => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim(),
                    visible: visibleColumns.includes(index),
                    width: columnWidths[index] ? columnWidths[index].width : null,
                }));

                // Initialize DataTables
                $(document).ready(function () {
                    var table = $('#data-table').DataTable({
                        data: data,
                        columns: columns,
                        dom: '<"top"<"top_left"l><"top_center"B><"top_right"f>>rt<"bottom"<"bottom_left"i><"bottom_right"p>><"clear">',
                        buttons: [
                            {
                                extend: 'colvis',
                                text: 'Select Columns',
                                columns: ':not(:first-child)'
                            }
                        ],
                        "initComplete": function (settings, json) {
                            // Hide the loading bar and show the table after DataTables initialization is complete
                            loadingBar.style.display = 'none';
                            dataTableElement.style.display = 'table';
                        },
                        "pagingType": "full_numbers",
                        "language": {
                            "search": "",
                            "searchPlaceholder": "Search records"
                        },
                        "pageLength": 100,
                        "lengthMenu": [
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
                        ],
                        "order": [[0, 'asc']],
                        "responsive": false, // Disable responsive to prevent interference with column widths
                        "autoWidth": false,
                        "scrollX": true,
                    });

                    // Adjust columns when visibility changes
                    table.on('column-visibility.dt', function (e, settings, column, state) {
                        table.columns.adjust();
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
