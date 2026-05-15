const GIS_SCRIPT_ID = "google-identity-services";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GIS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GIS_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function requestAccessToken(clientId) {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export async function getGoogleCalendarAccessToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID in your environment variables.");
  }

  await loadGoogleIdentityServices();
  return requestAccessToken(clientId);
}

export async function fetchUpcomingGoogleCalendarEvents(accessToken) {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + 90);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: maxDate.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch Google Calendar events.");
  }

  const data = await response.json();
  return (data.items || []).filter((event) => event.start?.dateTime && event.end?.dateTime);
}
