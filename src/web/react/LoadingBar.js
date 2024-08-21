import React from 'react';

const LoadingBar = ({ loading }) => {
    return loading ? <div id="loading-bar">Loading...</div> : null;
};

export default LoadingBar;
