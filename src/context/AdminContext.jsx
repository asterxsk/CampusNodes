import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AdminContext, useAuth } from './Contexts';

export const AdminProvider = ({ children }) => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAdminStatus = async () => {
            if (!user) {
                if (isMounted) {
                    setIsAdmin(false);
                    setIsLoadingAdmin(false);
                }
                return;
            }

            if (user.email === 'admin@campusnodes.com') {
                if (isMounted) {
                    setIsAdmin(true);
                    setIsLoadingAdmin(false);
                }
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();

                if (isMounted) {
                    if (error || !data) {
                        setIsAdmin(false);
                    } else {
                        setIsAdmin(true);
                    }
                }
            } catch (err) {
                console.error("Error checking admin status:", err);
                if (isMounted) setIsAdmin(false);
            } finally {
                if (isMounted) setIsLoadingAdmin(false);
            }
        };

        checkAdminStatus();

        return () => {
            isMounted = false;
        };
    }, [user]);

    return (
        <AdminContext.Provider value={{ isAdmin, isLoadingAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};
