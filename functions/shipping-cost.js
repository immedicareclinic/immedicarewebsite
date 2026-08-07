// Cloudflare Pages Function: hitung ongkos kirim via RajaOngkir (Komerce Collaborator API)
// Route otomatis jadi: POST /shipping-cost
// Body JSON: { destination: "ID_TUJUAN", weight: 1000, courier: "anteraja" }
//
// PENTING: RAJAONGKIR_ORIGIN_ID diambil dari Cloudflare Environment Variables
// (ID kecamatan Karang Tengah, Kota Tangerang = 73338, sudah diketahui dari setup sebelumnya)

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const apiKey = env.RAJAONGKIR_API_KEY;
  const originId = env.RAJAONGKIR_ORIGIN_ID;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "RAJAONGKIR_API_KEY belum diatur di Cloudflare Environment Variables." }),
      { status: 500, headers }
    );
  }
  if (!originId) {
    return new Response(
      JSON.stringify({ error: "RAJAONGKIR_ORIGIN_ID belum diatur di Cloudflare Environment Variables." }),
      { status: 500, headers }
    );
  }

  try {
    const payload = await request.json();
    const destination = payload.destination;
    const weight = payload.weight || 1000; // gram
    const courier = payload.courier || "anteraja";

    if (!destination) {
      return new Response(JSON.stringify({ error: "destination wajib diisi" }), { status: 400, headers });
    }

    const params = new URLSearchParams({
      origin: String(originId),
      destination: String(destination),
      weight: String(weight),
      courier: courier,
    });

    const res = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", {
      method: "POST",
      headers: {
        key: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
