
document.addEventListener("DOMContentLoaded", function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const dataTableElement = document.getElementById('data-table');

 
    loadingOverlay.style.display = 'flex';

   
    const defaultVisibleColumns = [0, 1, 2, 3, 8, 9];

  
    function loadData() {
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(data => {
             
                const headers = Object.keys(data[0]);

            
                const columns = headers.map((header, index) => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim(),
                    visible: defaultVisibleColumns.includes(index)
                }));

             
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
                                  
                                    dt.state.clear();

                               
                                    dt.columns().visible(false);


                                    defaultVisibleColumns.forEach(function (colIndex) {
                                        dt.column(colIndex).visible(true);
                                    });


                                    dt.columns.adjust().draw(false);


                                    dt.state.save();
                                }
                            }
                        ],
                        "stateSave": true,
                        "stateDuration": -1,
                        "initComplete": function (settings, json) {

                            loadingOverlay.style.display = 'none';
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
                        "autoWidth": false 
                    });


                    table.on('column-visibility.dt', function (e, settings, column, state) {
                        table.columns.adjust().draw(false);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading the data:', error);

                loadingOverlay.style.display = 'none';
            });
    }


    loadData();
});
