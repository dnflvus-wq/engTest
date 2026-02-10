import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <section className="active-section">
            <div className="dashboard-grid">
                <div className="clay-card widget" onClick={() => navigate('/study')}>
                    <div className="widget-icon color-blue">
                        <i className="fa-solid fa-book-open-reader"></i>
                    </div>
                    <div className="widget-info">
                        <h3>Study</h3>
                        <p>Learning materials</p>
                    </div>
                    <div className="widget-arrow"><i className="fa-solid fa-chevron-right"></i></div>
                </div>

                <div className="clay-card widget" onClick={() => navigate('/exam')}>
                    <div className="widget-icon color-purple">
                        <i className="fa-solid fa-file-pen"></i>
                    </div>
                    <div className="widget-info">
                        <h3>Take Exam</h3>
                        <p>Start a new test</p>
                    </div>
                    <div className="widget-arrow"><i className="fa-solid fa-chevron-right"></i></div>
                </div>

                <div className="clay-card widget" onClick={() => navigate('/history')}>
                    <div className="widget-icon color-pink">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div className="widget-info">
                        <h3>History</h3>
                        <p>Past results</p>
                    </div>
                    <div className="widget-arrow"><i className="fa-solid fa-chevron-right"></i></div>
                </div>

                <div className="clay-card widget" onClick={() => navigate('/analytics')}>
                    <div className="widget-icon color-mint">
                        <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div className="widget-info">
                        <h3>Analytics</h3>
                        <p>Check your progress</p>
                    </div>
                    <div className="widget-arrow"><i className="fa-solid fa-chevron-right"></i></div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
