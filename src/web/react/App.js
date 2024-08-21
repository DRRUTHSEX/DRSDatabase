const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('/data/Full_Database_Backend.json')
            .then(response => response.json())
            .then(jsonData => {
                console.log('Fetched data:', jsonData); // Log fetched data
                setData(jsonData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>WhyDRS Database</h1>
            <LoadingBar loading={loading} />
            {!loading && <DataTable data={data} />}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));