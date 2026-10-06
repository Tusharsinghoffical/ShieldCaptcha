export async function GET() {
  return new Response("google-site-verification: googlef2522572e90b8ca4.html\n", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
