import {
  Button,
  CloseButton,
  Drawer,
  Icon,
  Portal,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LuShoppingCart } from 'react-icons/lu';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/helper/supabase';
import CartItem from './CartItem';

export default function CartDrawer({ isMobile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { cartItems } = useCart();
  const [cartAuthError, setCartAuthError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error.message);
    } finally {
      localStorage.removeItem('auth_id');
      localStorage.removeItem('authSession');
      router.replace('/signin');
    }
  };

  useEffect(() => {
    const checkCustomerAccount = async () => {
      const authId = localStorage.getItem('auth_id');

      if (!authId) {
        setCartAuthError('');
        return;
      }

      const { data: customer } = await supabase
        .from('users')
        .select('id')
        .eq('id', authId)
        .maybeSingle();

      if (customer) {
        setCartAuthError('');
        return;
      }

      const { data: systemUser } = await supabase
        .from('system_users')
        .select('id')
        .eq('id', authId)
        .maybeSingle();

      setCartAuthError(
        systemUser
          ? 'Admin accounts cannot use the customer cart. Please sign in with a customer account.'
          : 'We could not verify your customer account. Please sign in again.',
      );
    };

    checkCustomerAccount();
  }, []);

  const canReviewCart = cartItems.length > 0 && !cartAuthError;

  return (
    <Drawer.Root size='md' open={open} onOpenChange={(e) => setOpen(e.open)}>
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
              <Drawer.Title fontSize='xl'>My Cart</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Separator />
            <Drawer.Body p={0}>
              <Stack p={4} gap={4}>
                {cartAuthError ? (
                  <Stack gap={4}>
                    <Text fontSize='lg'>{cartAuthError}</Text>
                    <Button
                      colorPalette='blue'
                      loading={isLoggingOut}
                      onClick={handleLogout}
                    >
                      Re-login
                    </Button>
                  </Stack>
                ) : cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <CartItem key={item.pid} data={item} refresh={item.pid} />
                  ))
                ) : (
                  <Text fontSize='lg'>No items in cart.</Text>
                )}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer
              justifyContent='flex-start'
              p={4}
              hidden={!canReviewCart}
            >
              <Drawer.ActionTrigger asChild>
                <Button
                  w='full'
                  colorPalette='blue'
                  rounded='full'
                  size='xl'
                  onClick={() => router.push('/cart')}
                >
                  Review Cart
                  <LuShoppingCart />
                </Button>
              </Drawer.ActionTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
