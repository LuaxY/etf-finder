import mixpanel from "mixpanel-browser";

let initialized = false;

export function initAnalytics() {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (!token) {
    return;
  }

  mixpanel.init(token, {
    track_pageview: false,
    persistence: "localStorage",
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) {
    return;
  }
  mixpanel.track(event, properties);
}
