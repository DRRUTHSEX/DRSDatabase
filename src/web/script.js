// Assuming your JSON file is named 'Full_Database_Backend.json' and is in the same directory
document.addEventListener("DOMContentLoaded", function() {
    const loadingBar = document.getElementById('loading-bar');
    const dataTableElement = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'block';

    // Function to fetch and load data
    function loadData() {
        fetch('/data/Full_Database_Backend.json') // Asynchronously fetches the JSON file
            .then(response => response.json()) // Parses the JSON file
            .then(data => {
                // Extract headers from the data
                const headers = Object.keys(data[0]);

                // Create columns array with 'data' and 'title'
                const columns = headers.map(header => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim()
                }));

                // Determine which columns should be visible by default
                // Columns 1,2,3,4,9,10 are visible (indices 0,1,2,3,8,9)
                const visibleColumns = [0,1,2,3,8,9];

                // Initialize DataTables
                $(document).ready(function() {
                    $('#data-table').DataTable({
                        data: data, // Provide the data directly to DataTables
                        columns: columns,
                        "columnDefs": [
                            {
                                "targets": "_all",
                                "visible": false
                            },
                            {
                                "targets": visibleColumns,
                                "visible": true
                            }
                        ],
                        dom: 'Bfrtip',
                        buttons: [
                            {
                                extend: 'colvis',
                                text: 'Select Columns'
                            }
                        ],
                        "initComplete": function(settings, json) {
                            // Hide the loading bar and show the table after DataTables initialization is complete
                            loadingBar.style.display = 'none';
                            dataTableElement.style.display = 'table';
                        },
                        "pagingType": "simple", // Simplifies pagination controls
                        "language": {
                            "search": "", // Removes "Search:" label
                            "searchPlaceholder": "Search records" // Adds placeholder text
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error loading the data:', error); // Logs any errors to the console

                // Hide the loading bar even if there's an error
                loadingBar.style.display = 'none';
            });
    }

    // Load the data
    loadData();
});
