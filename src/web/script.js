// Assuming your JSON file is named 'Full_Database_Backend.json' and is in the 'data' directory
document.addEventListener("DOMContentLoaded", function() {
    const loadingBar = document.getElementById('loading-bar');
    const dataTable = document.getElementById('data-table');

    // Show the loading bar
    loadingBar.style.display = 'block';

    // Function to fetch and load data
    function loadData() {
        fetch('/data/Full_Database_Backend.json') // Adjust the path if necessary
            .then(response => response.json()) // Parses the JSON file
            .then(data => {
                // Initialize DataTables with the fetched data
                $(document).ready(function() {
                    $('#data-table').DataTable({
                        data: data,
                        columns: Object.keys(data[0]).map(function(key) {
                            return {
                                title: key.replace(/([A-Z])/g, ' $1').trim(), // Formats header text
                                data: key
                            };
                        }),
                        "initComplete": function(settings, json) {
                            // Hide the loading bar and show the table after DataTables initialization is complete
                            loadingBar.style.display = 'none';
                            dataTable.style.display = 'table';
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
