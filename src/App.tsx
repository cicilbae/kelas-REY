import React from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import Login from './components/auth/Login';

const AppContainer: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Login />;
    }

    return (
        <AppProvider>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <MainContent />
            </div>
        </AppProvider>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContainer />
    </AuthProvider>
  );
};

export default App;
