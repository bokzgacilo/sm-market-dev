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
import { LuReceipt, LuShoppingBag } from 'react-icons/lu';


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
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("pickup")

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        if (!localStorage.getItem('auth_id')) {
          setCartItems([]);
          return;
        }

        const { data } = await supabase
          .from('users')
          .select('cart_item')
          .eq('id', localStorage.getItem('auth_id'))
          .single()

        console.log(data)
        setCartItems(data.cart_item || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price * item.quantity || 0);
  }, 0);

  const handleRemove = async (pidToRemove) => {
    const auth_id = localStorage.getItem("auth_id")
    if (!auth_id) return;

    const { data: userData } = await supabase
      .from('users')
      .select('cart_item')
      .eq('id', auth_id)
      .single();  

    const updatedCart = (userData?.cart_item || []).filter(item => item.pid !== pidToRemove);

    await supabase
      .from('users')
      .update({ cart_item: updatedCart })
      .eq('id', auth_id);
  };

  const total = subtotal;

  if (loading) return <Text>Loading cart...</Text>;

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
                    onRemove={() => handleRemove(item.pid)}
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
                    <Text fontWeight='bold'>₱ {total.toFixed(2)}</Text>
                  </HStack>
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
                  <Button bg="blue.600" size="xl" rounded="full">
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
