import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast-clay.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingSpinner } from './components/common';
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
import Logs from './pages/Logs';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';
import RoundList from './components/admin/RoundList';
import CreateRound from './components/admin/CreateRound';
import RoundDetail from './components/admin/RoundDetail';
import AchievementManager from './components/admin/AchievementManager';
import ExamCorrection from './components/admin/ExamCorrection';
import QuestionManager from './components/admin/QuestionManager';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exam/online/:roundId" element={<OnlineExam />} />
                <Route path="/study" element={<Study />} />
                <Route path="/exam" element={<ExamList />} />
                <Route path="/exam/mode/:roundId" element={<ModeSelection />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/achievements/user/:userId" element={<Achievements />} /> {/* Modified route */}
                <Route path="/exam/offline/:roundId" element={<OfflineExam />} />
                <Route path="/result/:examId" element={<Result />} />
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<RoundList />} />
                    <Route path="create" element={<CreateRound />} />
                    <Route path="achievements" element={<AchievementManager />} />
                    <Route path="questions" element={<QuestionManager />} />
                    <Route path="exam-correction" element={<ExamCorrection />} />
                    <Route path=":roundId" element={<RoundDetail />} />
                </Route>
                <Route path="/logs" element={<Logs />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                    <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
