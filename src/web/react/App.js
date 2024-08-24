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

    return React.createElement('div', null,
        React.createElement('h1', null, 'WhyDRS Database'),
        React.createElement(LoadingBar, { loading: loading }),
        error && React.createElement('div', null, 'Error: ', error),
        !loading && !error && React.createElement(DataTable, { data: data })
    );
};

window.App = App;
