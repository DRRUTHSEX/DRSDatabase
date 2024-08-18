export function initializeDataTables() {
    $(document).ready(function() {
        $('#data-table').DataTable({
            "initComplete": function(settings, json) {
                // Hide the loading bar and show the table after DataTables initialization is complete
                loadingBar.style.display = 'none';
                dataTable.style.display = 'table';
            }
        });
    });
}
