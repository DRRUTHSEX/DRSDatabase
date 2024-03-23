// Assuming your JSON file is named 'data.json' and is in the same directory
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('data-table');
        // Create table headers from the keys of the first JSON object
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
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
    });
