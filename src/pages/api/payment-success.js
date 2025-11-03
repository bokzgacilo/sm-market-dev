import { supabase } from "@/helper/supabase";
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { ref } = req.query;
    const secretKey = "sk_test_Y5BxqyZzNUjNgMLebHFh1Jhy";

    // 1️⃣ Get checkout_id from Supabase
    const { data, error } = await supabase
      .from("orders")
      .select("checkout_id")
      .eq("reference_number", ref)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2️⃣ Fetch checkout session from PayMongo
    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${data.checkout_id}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
        },
      }
    );

    const payment_status =
      response.data.data.attributes.payments?.[0]?.attributes?.status || "unknown";

    // 3️⃣ Update order status in Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: payment_status })
      .eq("reference_number", ref)
      .single();

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: "Failed to update order status" });
    }

    // 4️⃣ Redirect to profile after successful update
    res.writeHead(302, { Location: "/profile" });
    res.end();
  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({
      error: "Failed to verify payment",
      details: err.message,
    });
  }
}
