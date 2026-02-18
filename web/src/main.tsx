import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";
import { initAnalytics, track } from "./lib/analytics";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
      networkDetailAllowUrls: [window.location.origin],
      networkCaptureBodies: true,
      networkRequestHeaders: ["content-type", "accept"],
      networkResponseHeaders: ["content-type"],
    }),
    Sentry.browserTracingIntegration(),
  ],
});

initAnalytics();
track("page_viewed");

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="font-semibold text-gray-900 text-lg">
            Something went wrong
          </p>
          <p className="max-w-md text-gray-500 text-sm">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
          <button
            className="rounded-md bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700"
            onClick={resetError}
            type="button"
          >
            Try again
          </button>
        </div>
      )}
      showDialog
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
