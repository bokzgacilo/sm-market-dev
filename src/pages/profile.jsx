import {
  Avatar,
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Menu,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Table,
  Tag,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import EditAddress from '@/components/custom/EditAddress';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/helper/supabase';

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const { signOut, userData } = useAuth();

  useEffect(() => {
    if (!userData) return;

    const fetchAllOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userData.id);

      setOrders(data);
    };

    fetchAllOrders();
  }, [userData]);

  if (!userData) {
    return (
      <Stack alignItems='center' height='60dvh' p={4}>
        <Text textAlign='center' fontSize='lg'>
          You’re not signed in.
        </Text>
        <Link href='/signin' passHref>
          <Button size='xl' colorPalette='blue' rounded='full'>
            Sign In
          </Button>
        </Link>
      </Stack>
    );
  }

  const handleCompletePayment = async (cid) => {
    const secretKey = 'sk_test_Y5BxqyZzNUjNgMLebHFh1Jhy';
    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${cid}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Basic ${Buffer.from(secretKey).toString('base64')}`,
        },
      },
    );
    window.location.href = response.data.data.attributes.checkout_url;
  };

  return (
    <>
      <Head>
        <title>Profile | SM Market Mapua</title>
        <meta name='description' content='User profile page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <Stack gap={4} p={4}>
        <CustomBreadcrumb data={{ root: 'home', first: 'profile' }} />

        <Heading size='3xl' color='#0030FF'>
          Account
        </Heading>

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
                    <Avatar.Image />
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
                  <Stack>
                    <Text fontWeight='bold'>Gender:</Text>
                    <Text>{userData.gender.toUpperCase()}</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight='bold'>Date Of Birth:</Text>
                    <Text>{userData.dob}</Text>
                  </Stack>
                  <Separator my={4} />
                  <Stack gap={4}>
                    <Field.Root>
                      <Field.Label>Street/Building/Unit/Room</Field.Label>
                      <Input
                        readOnly
                        value={userData?.shipping_address?.address_line || ''}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Barangay</Field.Label>
                      <Input
                        readOnly
                        value={userData?.shipping_address?.barangay || ''}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>City</Field.Label>
                      <Input
                        readOnly
                        value={userData?.shipping_address?.city || ''}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Province</Field.Label>
                      <Input
                        readOnly
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
                onClick={async () => {
                  await signOut();
                }}
              >
                Logout
              </Button>
              <EditAddress useremail={userData.email} />
            </Card.Footer>
          </Card.Root>
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
                        <Table.ColumnHeader>Items</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Action</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {orders.map((order) => (
                        <Table.Row key={order.id}>
                          <Table.Cell>{order.reference_number}</Table.Cell>
                          <Table.Cell>{order.total_amount / 100}</Table.Cell>
                          <Table.Cell>{order.cart_items.length}</Table.Cell>
                          <Table.Cell>
                            <Tag.Root>
                              <Tag.Label>
                                {order.status.toUpperCase()}
                              </Tag.Label>
                            </Tag.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <Button variant='outline' size='sm'>
                                  See More
                                </Button>
                              </Menu.Trigger>
                              <Portal>
                                <Menu.Positioner>
                                  <Menu.Content>
                                    {order.status !== 'paid' && (
                                      <Menu.Item
                                        value='complete-payment'
                                        onClick={() =>
                                          handleCompletePayment(
                                            order.checkout_id,
                                          )
                                        }
                                      >
                                        Complete Payment
                                      </Menu.Item>
                                    )}
                                    <Menu.Item value='view-cart'>
                                      View Cart
                                    </Menu.Item>
                                    <Menu.Item value='full-details'>
                                      Full Details
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Portal>
                            </Menu.Root>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              ) : (
                <Stack alignItems='center' gap={4}>
                  <Text>No Orders</Text>
                  <Box>
                    <Button rounded='full' bg='blue.600'>
                      Continue Shopping
                    </Button>
                  </Box>
                </Stack>
              )}
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Stack>
    </>
  );
}
