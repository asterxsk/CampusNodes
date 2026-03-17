import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext } from './Contexts';

export const ThemeProvider = ({ children }) => {
    // Check localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });

    useEffect(() => {
        // Apply theme to html root
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const changeTheme = (newTheme) => {
        if (theme === newTheme) return;

        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }

        document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme);
            });
            // Also update attribute instantly just in case
            document.documentElement.setAttribute('data-theme', newTheme);
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
