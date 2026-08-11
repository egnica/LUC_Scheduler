import { google } from "googleapis";
import { googleOAuth2Client } from "@/lib/google";
import { parsePhone } from "@/lib/parsePhone";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing authorization code", {
      status: 400,
    });
  }

  const { tokens } = await googleOAuth2Client.getToken(code);

  googleOAuth2Client.setCredentials(tokens);

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

  const events = response.data.items.map((event) => {
    const phone = parsePhone(event.description);

    return {
      ...event,
      phone,
      automationEnabled: Boolean(phone),
    };
  });

  return Response.json(events);
}
