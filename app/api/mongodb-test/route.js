import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;

  await client.db("admin").command({
    ping: 1,
  });

  return Response.json({
    connected: true,
  });
}
