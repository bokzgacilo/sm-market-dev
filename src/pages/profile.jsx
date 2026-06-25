import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  CloseButton,
  Dialog,
  Field,
  Heading,
  Input,
  Portal,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tag,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import EditAddress from '@/components/custom/EditAddress';
import FullDetail from '@/components/custom/FullDetail';
import { supabase } from '@/helper/supabase';

export default function Profile() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState([]);
  const [auth, setAuth] = useState(null);
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
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
    const authId = localStorage.getItem('auth_id');

    if (authId) {
      setAuth(authId);
    } else {
      setProfileError('Your session has expired. Please sign in again.');
    }

    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!auth) return;

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      setProfileError('');

      const { data: profile, error: profileFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', auth)
        .maybeSingle();

      if (profileFetchError || !profile) {
        const { data: systemUser } = await supabase
          .from('system_users')
          .select('id')
          .eq('id', auth)
          .maybeSingle();

        setUserData(null);
        setOrders([]);
        setProfileError(
          systemUser
            ? 'Admin accounts cannot open the customer profile page. Please sign in with a customer account.'
            : 'We could not load your account. Please sign in again.',
        );
        setIsProfileLoading(false);
        return;
      }

      setUserData(profile);

      const { data: customerOrders, error: ordersFetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', auth);

      if (ordersFetchError) {
        console.error('Error fetching orders:', ordersFetchError.message);
        setOrders([]);
      } else {
        setOrders(customerOrders || []);
      }

      setIsProfileLoading(false);
    };

    fetchProfile();
  }, [auth]);

  if (isCheckingAuth) {
    return (
      <Center>
        <Stack alignItems='center' height='60dvh' p={4}>
          <Spinner />
          <Text>Loading...</Text>
        </Stack>
      </Center>
    );
  }

  const shouldShowReloginFallback = !auth || profileError;

  return (
    <>
      <Head>
        <title>Profile | SM Market Mapua</title>
        <meta name='description' content='User profile page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        size='xl'
        scrollBehavior='inside'
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Full Details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <FullDetail order={order} cart={cart} />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Stack gap={4} p={4}>
        <CustomBreadcrumb data={{ root: 'home', first: 'profile' }} />

        <Heading size='3xl' color='#0030FF'>
          Account
        </Heading>

        {shouldShowReloginFallback ? (
          <Center py={20}>
            <Card.Root maxW='md' width='full'>
              <Card.Body>
                <Stack gap={4} align='center' textAlign='center'>
                  <Heading size='lg'>Please sign in again</Heading>
                  <Text color='gray.600'>
                    {profileError ||
                      'We could not verify your account session.'}
                  </Text>
                  <Button
                    colorPalette='blue'
                    loading={isLoggingOut}
                    onClick={handleLogout}
                  >
                    Re-login
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Center>
        ) : isProfileLoading ||
          !userData ||
          Object.keys(userData).length === 0 ? (
          <Stack align='center' py={20}>
            <Spinner />
            <Text>Loading profile...</Text>
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <Card.Header p={4}>
                <Card.Title>Customer Profile</Card.Title>
              </Card.Header>
              <Separator />
              <Card.Body p={0}>
                <Stack gap={0}>
                  <Stack bg='gray.100' align='center' gap={0} py={4}>
                    <Avatar.Root boxSize='150px'>
                      <Avatar.Image src='/default.jpg' />
                    </Avatar.Root>
                    <Heading fontSize='32px' mt={4}>
                      {userData.first_name} {userData.last_name}
                    </Heading>
                    <Text mt={2} color='gray.600' fontSize='sm'>
                      {userData.email.toLowerCase()}
                    </Text>
                    <Text color='gray.600' fontSize='sm'>
                      {userData.phone.toLowerCase()}
                    </Text>
                  </Stack>
                  <Separator />
                  <Stack p={4}>
                    {/* <Stack>
                      <Text fontWeight='bold'>Gender:</Text>
                      <Text>{userData.gender.toUpperCase()}</Text>
                    </Stack>
                    <Stack>
                      <Text fontWeight='bold'>Date Of Birth:</Text>
                      <Text>{userData.dob}</Text>
                    </Stack> */}
                    <Stack gap={4}>
                      <Field.Root>
                        <Field.Label>Street/Building/Unit/Room</Field.Label>
                        <Input
                          readOnly
                          size='sm'
                          value={userData?.shipping_address?.address_line || ''}
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Barangay</Field.Label>
                        <Input
                          readOnly
                          size='sm'
                          value={userData?.shipping_address?.barangay || ''}
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>City</Field.Label>
                        <Input
                          readOnly
                          size='sm'
                          value={userData?.shipping_address?.city || ''}
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Province</Field.Label>
                        <Input
                          readOnly
                          size='sm'
                          value={userData?.shipping_address?.province || ''}
                        />
                      </Field.Root>
                    </Stack>
                  </Stack>
                </Stack>
              </Card.Body>
              <Separator />
              <Card.Footer p={4}>
                <Button
                  colorPalette='red'
                  loading={isLoggingOut}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <EditAddress useremail={userData.email} />
              </Card.Footer>
            </Card.Root>
            <Box>
              <Card.Root>
                <Card.Header p={4}>
                  <Card.Title>Orders</Card.Title>
                </Card.Header>
                <Separator />
                <Card.Body p={0}>
                  {orders.length > 0 ? (
                    <Table.ScrollArea>
                      <Table.Root size='sm' stickyHeader>
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Ref #</Table.ColumnHeader>
                            <Table.ColumnHeader>Amount</Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {orders.map((order) => (
                            <Table.Row key={order.id}>
                              <Table.Cell
                                onClick={() => {
                                  setOpen(true);
                                  setCart(order.cart_items);
                                  setOrder(order);
                                }}
                              >
                                {order.reference_number}
                              </Table.Cell>
                              <Table.Cell>
                                {order.total_amount / 100}
                              </Table.Cell>
                              <Table.Cell>
                                <Tag.Root>
                                  <Tag.Label>
                                    {order.status.toUpperCase()}
                                  </Tag.Label>
                                </Tag.Root>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Table.ScrollArea>
                  ) : (
                    <Stack alignItems='center' gap={4} p={4}>
                      <Heading>No Orders</Heading>
                      <Box>
                        <Button
                          rounded='full'
                          bg='blue.600'
                          onClick={() => router.replace('/')}
                        >
                          Continue Shopping
                        </Button>
                      </Box>
                    </Stack>
                  )}
                </Card.Body>
              </Card.Root>
            </Box>
          </SimpleGrid>
        )}
      </Stack>
    </>
  );
}
