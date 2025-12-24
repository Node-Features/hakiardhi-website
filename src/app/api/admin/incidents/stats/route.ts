export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
        totalIncidents: 150,
        openIncidents: 45,
        closedIncidents: 105,
        averageResolutionTime: "3 days"
    }),
    {
      status: 200,
        headers: { 'Content-Type': 'application/json' },
    }
    );
}