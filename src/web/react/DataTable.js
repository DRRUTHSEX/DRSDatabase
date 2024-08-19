const DataTable = ({ data }) => {
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    return (
        <table id="data-table">
            <thead>
                <tr>
                    {headers.map(header => (
                        <th key={header}>{header.replace(/([A-Z])/g, ' $1').trim()}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        {Object.values(item).map((val, idx) => (
                            <td key={idx}>{val}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
