const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
    if (fullScreen) {
        return (
            <div className="loading-overlay">
                <div className="clay-spinner"></div>
                <div className="loading-text">{message}</div>
            </div>
        );
    }

    return (
        <div className="loading-screen">
            <i className="fa-solid fa-spinner fa-spin"></i>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
