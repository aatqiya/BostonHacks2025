// desktop-app/src/conversationRenderer.jsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import ConversationWindow from './components/ConversationWindow';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <ConversationWindow />
    </React.StrictMode>
);