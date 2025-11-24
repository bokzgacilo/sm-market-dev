export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "GET request received" });
  }

  if (req.method === "POST") {
    const body = req.body; // JSON body from client

    return res.status(201).json({
      message: "POST request received",
      data: body,
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
