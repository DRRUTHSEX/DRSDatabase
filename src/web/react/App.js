import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import DataTable from './DataTable';
import LoadingBar from './LoadingBar';

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/data/Full_Database_Backend.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(jsonData => {
                setData(jsonData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                setError(error.toString());
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>WhyDRS Database</h1>
            <LoadingBar loading={loading} />
            {error && <div>Error: {error}</div>}
            {!loading && !error && <DataTable data={data} />}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
