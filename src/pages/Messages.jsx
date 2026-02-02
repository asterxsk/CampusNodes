import React from 'react';
import MessagesInterface from '../components/chat/MessagesInterface';

const Messages = () => {
    return (
        <div className="h-screen pt-safe md:pt-0">
            <MessagesInterface />
        </div>
    );
};

export default Messages;
