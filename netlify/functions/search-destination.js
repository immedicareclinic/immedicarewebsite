// Netlify Function: cari nama kecamatan/kota tujuan pengiriman
// Dipanggil dari frontend: /.netlify/functions/search-destination?q=NAMA_KOTA
// API key disimpan aman di Environment Variable Netlify (RAJAONGKIR_API_KEY), tidak pernah dikirim ke browser.

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const apiKey = process.env.RAJAONGKIR_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "RAJAONGKIR_API_KEY belum diatur di Netlify Environment Variables." }),
    };
  }

  const query = (event.queryStringParameters && event.queryStringParameters.q) || "";
  if (!query || query.trim().length < 3) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: [] }),
    };
  }

  try {
    const url = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(
      query
    )}&limit=10&offset=0`;

    const res = await fetch(url, {
      headers: { key: apiKey },
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
