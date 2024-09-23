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
                                    // Clear the saved state in cookies
                                    eraseCookie('DataTables_state');

                                    // Reset all columns to invisible
                                    dt.columns().visible(false);

                                    // Set default columns to visible
                                    defaultVisibleColumns.forEach(function (colIndex) {
                                        dt.column(colIndex).visible(true);
                                    });

                                    // Redraw the table without resetting the paging
                                    dt.draw(false);
                                }
                            }
                        ],
                        "stateSave": true,
                        "stateDuration": -1, // Not used when custom stateSaveCallback is provided
                        "stateSaveCallback": function (settings, data) {
                            // Save the state data in a cookie
                            setCookie('DataTables_state', JSON.stringify(data), 365);
                        },
                        "stateLoadCallback": function (settings) {
                            // Load the state data from the cookie
                            var data = getCookie('DataTables_state');
                            return data ? JSON.parse(data) : null;
                        },
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

    // Cookie helper functions
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        var secureFlag = location.protocol === 'https:' ? "; Secure" : "";
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict" + secureFlag;
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        setCookie(name, "", -1);
    }

    // Load the data
    loadData();
});
