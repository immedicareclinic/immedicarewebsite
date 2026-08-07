// Cloudflare Pages Function: cari nama kecamatan/kota tujuan pengiriman
// Route otomatis jadi: /search-destination?q=NAMA_KOTA
// API key disimpan aman di Environment Variable Cloudflare (RAJAONGKIR_API_KEY), tidak pernah dikirim ke browser.

export async function onRequestGet(context) {
  const { request, env } = context;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const apiKey = env.RAJAONGKIR_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "RAJAONGKIR_API_KEY belum diatur di Cloudflare Environment Variables." }),
      { status: 500, headers }
    );
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (!query || query.trim().length < 3) {
    return new Response(JSON.stringify({ data: [] }), { status: 200, headers });
  }

  try {
    const apiUrl = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(
      query
    )}&limit=10&offset=0`;

    const res = await fetch(apiUrl, {
      headers: { key: apiKey },
    });
    const data = await res.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
