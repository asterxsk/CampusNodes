import React from 'react';
import MessagesInterface from '../components/chat/MessagesInterface';

const Messages = () => {
    return (
        // Use fixed height and position to prevent scrolling issues with mobile nav
        <div className="fixed inset-0 pt-2 md:pt-0 pb-20 md:pb-0 bg-background">
            <MessagesInterface />
        </div>
    );
};

export default Messages;
