import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (username, password) => {
        try {
            // Fetch users from mock server
            const response = await fetch(getApiUrl('users'));
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const users = await response.json();

            // Find matching user
            const foundUser = users.find(
                (u) => u.username === username && u.password === password
            );

            if (foundUser) {
                // Don't store password in state or localStorage
                const { password, ...userWithoutPassword } = foundUser;
                setUser(userWithoutPassword);
                localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                return { success: true, user: userWithoutPassword };
            } else {
                return { success: false, error: 'Invalid username or password' };
            }
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: 'An error occurred during sign in' };
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
