import {
  Stack,
  Heading,
  Table,
  Button,
  HStack,
  Text,
  RadioCard,
  Card,
  Separator,
  SimpleGrid,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/helper/supabase';
import CartItem from '@/components/custom/CartItem';
import { LuReceipt } from 'react-icons/lu';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

const shipping_methods = [
  {
    value: "pickup",
    title: "Pickup",
    description: "Collect your order directly from our store or branch."
  },
  {
    value: "delivery",
    title: "Delivery",
    description: "Have your order conveniently delivered to your address."
  },
];


export default function Cart() {
  const { cartItems, store_code, TOTAL } = useCart();
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState("pickup")

  const handleCheckout = async () => {
    const auth_id = localStorage.getItem("auth_id")
    const { data: userData } = await supabase
      .from('users')
      .select('shipping_address')
      .eq('id', auth_id)
      .single()
    if (method === "delivery" && !userData.shipping_address) {
      alert("Please set your shipping address in your profile.");
      window.location.href = "/profile";
      return;
    } else {
      setLoading(true)
      const secretKey = 'sk_test_Y5BxqyZzNUjNgMLebHFh1Jhy';
      try {

        const slugs = cartItems.map(item => item.pid);
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id, slug,title,price') // price in PHP
          .in('id', slugs);
        if (productError) throw productError;

        const line_items = cartItems.map(cartItem => {
          const product = products.find(p => p.id === cartItem.pid);


          if (!product) return null;
          return {
            name: product.title,
            amount: product.price * 100,
            currency: 'PHP',
            quantity: cartItem.quantity,
          };
        }).filter(Boolean);

        const total_amount = line_items.reduce(
          (sum, item) => sum + item.amount * item.quantity,
          0
        );
        const authHeader = `Basic ${btoa(secretKey)}:`;
        const ref = `${Date.now()}`;
        const response = await axios.post(
          'https://api.paymongo.com/v1/checkout_sessions',
          {
            data: {
              attributes: {
                reference_number: ref,
                send_email_receipt: true,
                description: 'SM Market Mapua Payment',
                payment_method_types: ['card', 'gcash', 'qrph', 'paymaya'],
                line_items,
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-success?ref=${ref}`,
                failed_url: 'https://yourwebsite.com/failed',
              },
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader, // Basic auth
            },
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

          let ship_to;

          if (method === "pickup") {
            ship_to = JSON.parse(localStorage.getItem("branch_location"));
          } else {
            ship_to = userData.shipping_address;
          }

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
            window.location.href = checkoutUrl;
          }
        }
      } catch (err) {
        console.error('Failed to create checkout session:', err.response?.data || err);
      } finally {
        setLoading(false)
      }
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price * item.quantity || 0);
  }, 0);

  return (
    <Stack gap={6} p={4}>
      <Heading>My Cart</Heading>

      {cartItems.length === 0 ? (
        <Text>Your cart is empty</Text>
      ) : (
        <SimpleGrid gap={4} columns={{ base: 1, md: 2 }}>
          <Stack>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem
                  key={item.pid}
                  data={item}
                />
              ))
            ) : (
              <Text fontSize='lg'>No items in cart.</Text>
            )}
          </Stack>
          <Card.Root>
            <Card.Header>
              <Heading size='md'>Order Summary</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                <HStack justifyContent='space-between'>
                  <Text>Subtotal</Text>
                  <Text>₱ {subtotal.toFixed(2)}</Text>
                </HStack>
                <Separator />
                <HStack justifyContent='space-between'>
                  <Text fontWeight='bold'>Total</Text>
                  <Text fontWeight='bold'>₱ {TOTAL.toFixed(2)}</Text>
                </HStack>
                <RadioCard.Root value={method} onValueChange={(e) => setMethod(e.value)} defaultValue="pickup" size="sm">
                  <RadioCard.Label>Shipping Method</RadioCard.Label>
                  <Stack>
                    {shipping_methods.map((item) => (
                      <RadioCard.Item key={item.value} value={item.value}>
                        <RadioCard.ItemHiddenInput />
                        <RadioCard.ItemControl>
                          <RadioCard.ItemContent>
                            <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                          </RadioCard.ItemContent>
                          <RadioCard.ItemIndicator />
                        </RadioCard.ItemControl>
                      </RadioCard.Item>
                    ))}
                  </Stack>
                </RadioCard.Root>
                <Button
                  onClick={handleCheckout}
                  bg="blue.600"
                  size="xl"
                  rounded="full"
                  loading={loading}
                  disabled={cartItems.some(item => item.out_of_stock)}
                >
                  Pay Now <LuReceipt />
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      )}
    </Stack>
  );
}
