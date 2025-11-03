import { Button, CloseButton, Drawer, Icon, Portal, RadioCard, Separator, Stack, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { LuShoppingCart } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/helper/supabase";
import CartItem from "./CartItem";

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

export default function CartDrawer({ isMobile }) {
  const { cartItems, refreshCart, userData } = useAuth();
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState("pickup")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      await refreshCart();
    };

    fetchCart();
  }, [open]);

  const handleRemove = async (pidToRemove) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('cart_item')
      .eq('id', user.id)
      .single();

    const updatedCart = (userData?.cart_item || []).filter(item => item.pid !== pidToRemove);

    await supabase
      .from('users')
      .update({ cart_item: updatedCart })
      .eq('id', user.id);

    await refreshCart()
  };

  const handleCheckout = async () => {
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
          .select('slug,title,price') // price in PHP
          .in('slug', slugs);
        if (productError) throw productError;

        const line_items = cartItems.map(cartItem => {
          const product = products.find(p => p.slug === cartItem.pid);


          if (!product) return null; // skip if product not found
          return {
            name: product.title,
            amount: product.price * 100, // convert PHP to centavos and multiply by qty
            currency: 'PHP',
            quantity: cartItem.quantity, // PayMongo expects 1 per line item since amount includes quantity
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
            customer_id: userData.id,
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
              .eq("id", userData.id);

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

  return (
    <Drawer.Root
      size='md'
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Drawer.Trigger asChild>
        {isMobile ? (
          <Icon
            as={LuShoppingCart}
            size='xl'
            color='#fff'
            cursor='pointer'
            onClick={() => setOpen(true)}
          />
        ) : (
          <Button
            size='xl'
            color='#0030FF'
            backgroundColor='#fff'
            fontWeight='semibold'
            onClick={() => setOpen(true)}
          >
            My Cart
          </Button>
        )}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header p={4}>
              <Drawer.Title fontSize="xl">My Cart</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Separator />
            <Drawer.Body p={0}>
              <Stack p={4} gap={4}>
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <CartItem key={item.pid} data={item} onRemove={() => handleRemove(item.pid)} />
                  ))
                ) : (
                  <Text fontSize="lg">No items in cart.</Text>
                )}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer justifyContent="flex-start" p={4} hidden={cartItems.length === 0}>
              <Stack w="full">
                <RadioCard.Root disabled={loading} value={method} onValueChange={(e) => setMethod(e.value)} defaultValue="pickup" size="sm">
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
                <Button colorPalette='blue' rounded="full" size="lg" loading={loading} onClick={handleCheckout}>
                  Checkout
                  <LuShoppingCart />
                </Button>
              </Stack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}