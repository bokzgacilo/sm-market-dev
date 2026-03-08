import { supabase } from "@/helper/supabase";
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { ref, auth_id, method, ship_to, store_code, line_items, cartItems, total_amount } = req.body;

    // Parse stringified line_items
    const parsedLineItems = typeof line_items === "string"
      ? JSON.parse(line_items)
      : line_items;
    const options = {
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: parsedLineItems,
          payment_method_types: ["card", "gcash"]
        }
      }
    }
    console.log(options)
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      options,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic c2tfdGVzdF9ZNUJ4cXlaek5Vak5nTUxlYkhGaDFKaHk6"
        }
      }
    );


    if (response.data) {
      for (const item of cartItems) {
        const { pid, quantity } = item;

        const { data: inventoryRow } = await supabase
          .from("inventory")
          .select("*")
          .eq("product_id", pid)
          .single();

        const branchInv = inventoryRow[store_code];

        const updatePayload = {};
        updatePayload[store_code] = {
          ...branchInv,
          available: branchInv.available - quantity,
          sold: branchInv.sold + quantity
        };

        await supabase
          .from("inventory")
          .update(updatePayload)
          .eq("product_id", pid);
      }

      const cid = response.data.data.id;
      const order_json = {
        checkout_id: cid,
        reference_number: ref,
        customer_id: auth_id,
        cart_items: cartItems,
        total_amount: total_amount,
        status: "pending",
        shipping_method: method,
        shipping_address: ship_to
      };

      const { error: insertError } = await supabase
        .from("orders")
        .insert([order_json])
        .select(); // optional, returns inserted record

      if (insertError) {
        console.error("Error inserting order:", insertError.message);
      } else {
        // ✅ Clear user's cart after order creation
        const { error: updateError } = await supabase
          .from("users")
          .update({ cart_item: [] })
          .eq("id", auth_id);

        if (updateError) {
          console.error("Error clearing cart:", updateError.message);
        }

        // ✅ Redirect to PayMongo checkout
        const checkoutUrl = response.data.data.attributes.checkout_url;
        return res.status(200).json({
          success: true,
          checkout_url: checkoutUrl,
          checkout_id: response.data.data.id
        });
      }
    }
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
}

