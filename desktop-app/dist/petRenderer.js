import React from 'react';
import { createRoot } from 'react-dom/client';
import PetDisplay from './components/PetDisplay.jsx';
import './index.css';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(/*#__PURE__*/React.createElement(React.StrictMode, null, /*#__PURE__*/React.createElement(PetDisplay, null)));