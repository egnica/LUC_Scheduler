import { googleOAuth2Client } from "@/lib/google";

export async function GET() {
  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });

  return Response.redirect(authUrl);
}