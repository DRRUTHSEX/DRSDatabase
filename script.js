// Assuming your JSON file is named 'Full_Database_Backend.json' and is in the same directory
fetch('Full_Database_Backend.json')
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('data-table');
        
        // Clear previous table body
        table.tBodies[0].innerHTML = '';

        // Create table headers from the keys of the first JSON object
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters for readability
            headerRow.appendChild(header);
        });
        table.tHead.innerHTML = '';  // Clear any existing headers
        table.tHead.appendChild(headerRow);

        // Create the table body rows
        data.forEach(rowData => {
            const row = document.createElement('tr');
            Object.values(rowData).forEach(cellData => {
                const cell = document.createElement('td');
                cell.textContent = cellData;
                row.appendChild(cell);
            });
            table.tBodies[0].appendChild(row);
        });

        // Initialize DataTables
        $(document).ready( function () {
            $('#data-table').DataTable();
        });
    })
    .catch(error => {
        console.error('Error loading the data:', error);
    });
