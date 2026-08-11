import { getUpcomingCalendarEvents } from "@/lib/googleCalendar";

export async function GET() {
  const events = await getUpcomingCalendarEvents();

  return Response.json(events);
}
