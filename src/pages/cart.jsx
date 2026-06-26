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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";
import CartItem from "@/components/custom/CartItem";
import { LuReceipt } from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Head from "next/head";

const shipping_methods = [
  {
    value: "pickup",
    title: "Pickup",
    description: "Collect your order directly from our store or branch.",
  },
  {
    value: "delivery",
    title: "Delivery",
    description: "Have your order conveniently delivered to your address.",
  },
];

export default function Cart() {
  const { cartItems, store_code, TOTAL, DISCOUNT, SUBTOTAL } = useCart();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("pickup");

  const handleCheckout = async () => {
    const auth_id = localStorage.getItem("auth_id");
    const { data: userData } = await supabase
      .from("users")
      .select("shipping_address")
      .eq("id", auth_id)
      .single();
    if (method === "delivery" && !userData.shipping_address) {
      alert("Please set your shipping address in your profile.");
      window.location.href = "/profile";
      return;
    } else {
      setLoading(true);
      try {
        const slugs = cartItems.map((item) => item.pid);
        const { data: products, error: productError } = await supabase
          .from("products")
          .select("id, slug,title,price, isSale, compare_at_price") // price in PHP
          .in("id", slugs);
        if (productError) throw productError;

        const line_items = cartItems
          .map((cartItem) => {
            const product = products.find((p) => p.id === cartItem.pid);
            if (!product) return null;

            const AMOUNT = product.isSale
              ? product.compare_at_price * 100
              : product.price * 100;

            return {
              name: product.title,
              amount: Number(AMOUNT),
              currency: "PHP",
              description: "",
              quantity: Number(cartItem.quantity),
            };
          })
          .filter(Boolean);

        const total_amount = line_items.reduce(
          (sum, item) => sum + item.amount * item.quantity,
          0
        );
        const ref = `${Date.now()}`;
        let ship_to;

        if (method === "pickup") {
          ship_to = JSON.parse(localStorage.getItem("branch_location"));
        } else {
          ship_to = userData.shipping_address;
        }

        const { data: checkoutSession, error } = await axios.post(
          "/api/payment",
          {
            ref,
            method,
            store_code,
            auth_id,
            ship_to,
            cartItems,
            total_amount,
            line_items: JSON.stringify(line_items), // ✅ stringify here
          }
        );

        if (checkoutSession.success) {
          window.location.href = checkoutSession.checkout_url;
        }
      } catch (err) {
        console.error(
          "Failed to create checkout session:",
          err.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>My Cart | SM Market</title>
      </Head>
      <Stack gap={6} p={4}>
        <Heading>My Cart</Heading>

        {cartItems.length === 0 ? (
          <Text>Your cart is empty</Text>
        ) : (
          <SimpleGrid gap={4} columns={{ base: 1, md: 2 }}>
            <Stack>
              {cartItems.length > 0 ? (
                cartItems.map((item) => <CartItem key={item.pid} data={item} />)
              ) : (
                <Text fontSize="lg">No items in cart.</Text>
              )}
            </Stack>
            <Card.Root>
              <Card.Header>
                <Heading size="md">Order Summary</Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap={4}>
                  <HStack justifyContent="space-between">
                    <Text>Subtotal</Text>
                    <Text>₱ {SUBTOTAL.toFixed(2)}</Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text>Discount</Text>
                    <Text>₱ {DISCOUNT.toFixed(2)}</Text>
                  </HStack>
                  <Separator />
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">₱ {TOTAL.toFixed(2)}</Text>
                  </HStack>
                  <RadioCard.Root
                    value={method}
                    onValueChange={(e) => setMethod(e.value)}
                    defaultValue="pickup"
                    size="sm"
                  >
                    <RadioCard.Label>Shipping Method</RadioCard.Label>
                    <Stack>
                      {shipping_methods.map((item) => (
                        <RadioCard.Item key={item.value} value={item.value}>
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <RadioCard.ItemContent>
                              <RadioCard.ItemText>
                                {item.title}
                              </RadioCard.ItemText>
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
                    disabled={cartItems.some((item) => item.out_of_stock)}
                  >
                    Pay Now <LuReceipt />
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        )}
      </Stack>
    </>
  );
}
