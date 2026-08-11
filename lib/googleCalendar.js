import { google } from "googleapis";
import { googleOAuth2Client } from "@/lib/google";
import { parsePhone } from "@/lib/parsePhone";

export async function getUpcomingCalendarEvents() {
  const calendar = google.calendar({
    version: "v3",
    auth: googleOAuth2Client,
  });

  const response = await calendar.events.list({
    calendarId: "letuscleanmn@gmail.com",
    timeMin: new Date().toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items ?? [];

  return events.map((event) => {
    const phone = parsePhone(event.description);

    return {
      ...event,
      phone,
      automationEnabled: Boolean(phone),
    };
  });
}
