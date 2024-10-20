document.addEventListener("DOMContentLoaded", function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const dataTableElement = document.getElementById('data-table');

    // Default visible columns by their indices
    const defaultVisibleColumns = [0, 1, 2, 3, 8, 9];

    function loadData() {
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(data => {
                const headers = Object.keys(data[0]);

                // Map headers to DataTables column definitions
                const columns = headers.map((header, index) => ({
                    data: header,
                    title: header.replace(/([A-Z])/g, ' $1').trim(),
                    visible: defaultVisibleColumns.includes(index)
                }));

                $(document).ready(function () {
                    const table = $('#data-table').DataTable({
                        data: data,
                        columns: columns,
                        dom: '<"top"Bf>rt<"bottom"lip><"clear">',
                        buttons: [
                            {
                                extend: 'colvis',
                                text: 'Select Columns',
                                columns: ':not(:first-child)',
                                className: 'dt-button column-selector-btn'
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
                                },
                                className: 'dt-button reset-columns-btn'
                            }
                        ],
                        stateSave: true,
                        stateDuration: -1,
                        initComplete: function () {
                            loadingOverlay.classList.add('hidden');
                            dataTableElement.classList.remove('hidden');

                            // Apply custom class to column visibility buttons
                            $('.dt-button-collection button').addClass('column-visibility-btn');
                            updateColumnVisibilityButtonStyles();
                        },
                        pagingType: 'full_numbers',
                        language: {
                            search: '',
                            searchPlaceholder: 'Search records'
                        },
                        pageLength: 100,
                        lengthMenu: [
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
                        ],
                        order: [[0, 'asc']],
                        autoWidth: false
                    });

                    // Update styles when column visibility changes
                    table.on('column-visibility.dt', function () {
                        updateColumnVisibilityButtonStyles();
                    });

                    function updateColumnVisibilityButtonStyles() {
                        $('.column-visibility-btn').each(function () {
                            const button = $(this);
                            const columnIndex = button.index();
                            const column = table.column(columnIndex);

                            if (column.visible()) {
                                button.addClass('active');
                            } else {
                                button.removeClass('active');
                            }
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error loading the data:', error);
                loadingOverlay.classList.add('hidden');
            });
    }

    loadData();
});
