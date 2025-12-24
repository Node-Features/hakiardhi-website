export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
        totalCases: 150,
        openCases: 45,
        closedCases: 105,
        averageResolutionTime: "3 days"
    }),
    {
      status: 200,
        headers: { 'Content-Type': 'application/json' },
    }
  );
}
