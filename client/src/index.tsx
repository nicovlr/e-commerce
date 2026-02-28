import posthog from 'posthog-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

// Initialize PostHog
const posthogApiKey = process.env.REACT_APP_POSTHOG_API_KEY;
const posthogHost = process.env.REACT_APP_POSTHOG_HOST || 'http://localhost:8010';

if (posthogApiKey) {
  posthog.init(posthogApiKey, {
    api_host: posthogHost,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
