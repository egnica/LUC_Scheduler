import clientPromise from "@/lib/mongodb";
import { getUpcomingCalendarEvents } from "@/lib/googleCalendar";

export async function GET() {
  const events = await getUpcomingCalendarEvents();

  const testEvent = events.find(
    (event) => event.summary === "TEST - Cleaning Job - Nick",
  );

  if (!testEvent?.automationEnabled) {
    return Response.json(
      {
        success: false,
        error: "Test event does not contain a valid Phone field",
      },
      {
        status: 400,
      },
    );
  }

  const client = await clientPromise;
  const db = client.db("let_us_clean_scheduler");
  const jobs = db.collection("jobs");

  const result = await jobs.updateOne(
    {
      googleEventId: testEvent.id,
    },
    {
      $set: {
        recurringEventId: testEvent.recurringEventId || null,

        "client.name": testEvent.summary || "",
        "client.phone": testEvent.phone || null,

        "job.start": testEvent.start?.dateTime
          ? new Date(testEvent.start.dateTime)
          : null,

        "job.end": testEvent.end?.dateTime
          ? new Date(testEvent.end.dateTime)
          : null,

        "job.location": testEvent.location || "",
        "job.description": testEvent.description || "",

        "automation.enabled": testEvent.automationEnabled,

        googleUpdatedAt: testEvent.updated ? new Date(testEvent.updated) : null,

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

  return Response.json({
    success: true,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedId: result.upsertedId,
  });
}
