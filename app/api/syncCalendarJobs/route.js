import clientPromise from "@/lib/mongodb";
import { getUpcomingCalendarEvents } from "@/lib/googleCalendar";

export async function GET() {
  const events = await getUpcomingCalendarEvents();

  const automationEvents = events.filter(
    (event) => event.automationEnabled === true,
  );

  const client = await clientPromise;
  const db = client.db("let_us_clean_scheduler");
  const jobs = db.collection("jobs");

  let created = 0;
  let updated = 0;

  for (const event of automationEvents) {
    const result = await jobs.updateOne(
      {
        googleEventId: event.id,
      },
      {
        $set: {
          recurringEventId: event.recurringEventId || null,

          "client.name": event.summary || "",
          "client.phone": event.phone || null,

          "job.start": event.start?.dateTime
            ? new Date(event.start.dateTime)
            : null,

          "job.end": event.end?.dateTime ? new Date(event.end.dateTime) : null,

          "job.location": event.location || "",
          "job.description": event.description || "",

          "automation.enabled": event.automationEnabled,

          googleUpdatedAt: event.updated ? new Date(event.updated) : null,

          updatedAt: new Date(),
        },

        $setOnInsert: {
          createdAt: new Date(),

          "automation.dayBeforeReminder": {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null,
          },

          "automation.dayOfReminder": {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null,
          },

          "automation.cleaningCompletion": {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null,
          },

          "automation.reviewRequest": {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null,
          },
        },
      },
      {
        upsert: true,
      },
    );

    if (result.upsertedId) {
      created++;
    } else if (result.matchedCount > 0) {
      updated++;
    }
  }

  return Response.json({
    success: true,
    calendarEvents: events.length,
    automationEvents: automationEvents.length,
    created,
    updated,
  });
}
