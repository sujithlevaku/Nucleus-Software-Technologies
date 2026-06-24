import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {SpeedInsights} from '@vercel/speed-insights/react';
import App from './App.tsx';
import './index.css';
import reportWebVitals from './reportWebVitals';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);

// Configure metrics endpoint via environment variable `VITE_METRICS_ENDPOINT`.
// If not provided, metrics will be logged to the console.
const metricsEndpoint = (import.meta.env.VITE_METRICS_ENDPOINT as string | undefined) || undefined;
reportWebVitals(metricsEndpoint ?? ((metric) => { console.log(metric) }));
