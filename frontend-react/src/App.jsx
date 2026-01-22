import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ExamList from './pages/ExamList';
import OnlineExam from './pages/OnlineExam';
import OfflineExam from './pages/OfflineExam';
import Result from './pages/Result';
import History from './pages/History';
import Study from './pages/Study';
import Analytics from './pages/Analytics';
import ModeSelection from './pages/ModeSelection';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', flexDirection: 'column', gap: '1rem'
            }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Public Route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', flexDirection: 'column', gap: '1rem'
            }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p>Loading...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Route */}
            <Route path="/" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            {/* Full-screen exam routes (no sidebar) */}
            <Route path="/exam/online/:roundId" element={
                <ProtectedRoute>
                    <OnlineExam />
                </ProtectedRoute>
            } />

            {/* Protected Routes with Layout */}
            <Route element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study" element={<Study />} />
                <Route path="/exam" element={<ExamList />} />
                <Route path="/exam/mode/:roundId" element={<ModeSelection />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/exam/offline/:roundId" element={<OfflineExam />} />
                <Route path="/result/:examId" element={<Result />} />
                <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
