import { Outlet } from 'react-router-dom';
import Header from './Header';
import AchievementUnlockModal from './achievements/AchievementUnlockModal';

const Layout = () => {
    return (
        <div className="app-layout">
            <main className="main-content">
                <Header />

                <div className="container">
                    <Outlet />
                </div>
            </main>

            <AchievementUnlockModal />
        </div>
    );
};

export default Layout;
