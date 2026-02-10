import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../utils/api';

const Admin = () => {
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRounds();
    }, []);

    const loadRounds = async () => {
        setLoading(true);
        try {
            const data = await api.get('/rounds');
            setRounds(data);
        } catch (error) {
            console.error('Failed to load rounds:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Outlet context={{ rounds, loading, loadRounds }} />
        </div>
    );
};

export default Admin;
