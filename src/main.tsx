import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";
import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';

function postClientError(payload: Record<string, unknown>) {
  fetch('/api/v1/logs/client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

window.onerror = (message, source, lineno, colno, error) => {
  postClientError({
    message: String(message),
    source,
    lineno,
    colno,
    stack: error?.stack,
  });
};

window.onunhandledrejection = (event) => {
  postClientError({
    message: 'Unhandled promise rejection',
    reason: String(event.reason),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
  });
};

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);
