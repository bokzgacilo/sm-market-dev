import axios from "axios";

export default async function handler(req, res) {
  const { checkout_id } = req.body;
  try {
    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${checkout_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic c2tfdGVzdF9ZNUJ4cXlaek5Vak5nTUxlYkhGaDFKaHk6"
        }
      }
    );

    res.status(200).json({
      success: true,
      id: checkout_id,
      checkout_url: response.data.data.attributes.checkout_url
    })
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
}

