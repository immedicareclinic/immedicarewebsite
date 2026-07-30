// Netlify Function: hitung ongkos kirim via RajaOngkir (Komerce Collaborator API)
// Dipanggil dari frontend: POST /.netlify/functions/shipping-cost
// Body JSON: { destination: "ID_TUJUAN", weight: 1000, courier: "jne" }
//
// PENTING: ganti nilai RAJAONGKIR_ORIGIN_ID di Netlify Environment Variables
// dengan ID kecamatan/kota asal klinik (Karang Tengah, Kota Tangerang).
// Cara mendapatkan ID itu: panggil fungsi search-destination.js dengan
// query "Karang Tengah" setelah di-deploy, lalu catat field "id" yang cocok.

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const originId = process.env.RAJAONGKIR_ORIGIN_ID;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "RAJAONGKIR_API_KEY belum diatur di Netlify Environment Variables." }),
    };
  }
  if (!originId) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "RAJAONGKIR_ORIGIN_ID belum diatur di Netlify Environment Variables." }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const destination = payload.destination;
    const weight = payload.weight || 1000; // gram
    const courier = payload.courier || "jne";

    if (!destination) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "destination wajib diisi" }) };
    }

    const params = new URLSearchParams({
      origin: originId,
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
