export async function onRequestGet() {
  const now = new Date();

  return new Response(
    JSON.stringify({
      status: "ok",
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      date: {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        day: now.getUTCDate(),
      },
      time: {
        hour: now.getUTCHours(),
        minute: now.getUTCMinutes(),
        second: now.getUTCSeconds(),
      },
      timezone: "UTC",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}
