import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session on app load
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            // First check localStorage
            const savedUser = localStorage.getItem('user');
            let localUser = null;
            if (savedUser) {
                localUser = JSON.parse(savedUser);
                setUser(localUser);
            }

            // Then verify with server
            const response = await fetch('/api/users/me');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else if (localUser) {
                // Session expired but we have local user - auto re-login
                console.log('Session expired, auto re-logging in...');
                try {
                    const reloginResponse = await fetch('/api/users/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: localUser.name })
                    });
                    if (reloginResponse.ok) {
                        const userData = await reloginResponse.json();
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                        console.log('Auto re-login successful');
                    } else {
                        // Re-login failed, clear local data
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } catch (reloginError) {
                    console.error('Auto re-login failed:', reloginError);
                    // Keep local user if server is unreachable
                }
            } else {
                // No local user and no session
                setUser(null);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            // Keep localStorage user if server is unreachable
        } finally {
            setLoading(false);
        }
    };

    const login = async (userName) => {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const logout = async () => {
        try {
            await fetch('/api/users/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
