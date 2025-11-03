import { Button, CloseButton, Drawer, Icon, Portal, Separator, Stack, Text } from "@chakra-ui/react";
import { LuShoppingCart } from "react-icons/lu";
import { supabase } from "@/helper/supabase";
import CartItem from "./CartItem";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function CartDrawer({ isMobile }) {
  const {cartItems, refreshCart} = useAuth();
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if(open) refreshCart();
  }, [open])

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

    setCartItems(updatedCart);
  };

  const handleCheckout = async () => {
    const secretKey = 'sk_test_Y5BxqyZzNUjNgMLebHFh1Jhy';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in first.');
        return;
      }
      const { data: userData, error: cartError } = await supabase
        .from('users')
        .select('cart_item')
        .eq('id', user.id)
        .single();
      if (cartError) throw cartError;

      const cart = userData?.cart_item || [];
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }

      // 3️⃣ Fetch product details from products table
      const slugs = cart.map(item => item.pid);
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('slug,title,price') // price in PHP
        .in('slug', slugs);
      if (productError) throw productError;

      // 4️⃣ Build line_items array for PayMongo
      const line_items = cart.map(cartItem => {
        const product = products.find(p => p.slug === cartItem.pid);
        if (!product) return null; // skip if product not found
        return {
          name: product.title,
          amount: product.price * 100, // convert PHP to centavos and multiply by qty
          currency: 'PHP',
          quantity: cartItem.quantity, // PayMongo expects 1 per line item since amount includes quantity
        };
      }).filter(Boolean);
      const authHeader = `Basic ${btoa(secretKey)}:`;
      const response = await axios.post(
        'https://api.paymongo.com/v1/checkout_sessions',
        {
          data: {
            attributes: {
              description: 'My Product',
              payment_method_types: ['card', 'gcash', 'qrph', 'paymaya'],
              line_items,
              success_url: 'https://yourwebsite.com/success',
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

      const checkoutUrl = response.data.data.attributes.checkout_url;
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Failed to create checkout session:', err.response?.data || err);
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
                <CloseButton/>
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
            <Drawer.Footer p={4}>
              <Button w='full' colorPalette='blue' size='xl' rounded="full" onClick={handleCheckout} hidden={cartItems !== 0}>
                Checkout
                <LuShoppingCart />
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}