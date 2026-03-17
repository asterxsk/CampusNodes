import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Preloader from '../ui/Preloader';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { openAuthModal } = useUI();

    useEffect(() => {
        if (!loading && !user) {
            openAuthModal();
        }
    }, [user, loading, openAuthModal]);

    if (loading) {
        return <Preloader />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
