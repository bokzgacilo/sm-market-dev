import {
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  Field,
  Heading,
  IconButton,
  Input,
  NativeSelect,
  Pagination,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Steps,
  Table,
  Tabs,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  LuArchive,
  LuBox,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuClipboard,
  LuTruck,
} from 'react-icons/lu';
import { supabase } from '@/helper/supabase';
import { useAdmin } from './layout';

const steps = [
  {
    value: 'pending',
    icon: <LuClipboard />,
    description: 'Waiting for processing',
  },
  {
    value: 'processing',
    icon: <LuBox />,
    description: 'Preparing Order',
  },
  {
    value: 'out_for_delivery',
    icon: <LuTruck />,
    description: 'Out for Delivery',
  },
  {
    value: 'completed',
    icon: <LuCheck />,
    description: 'Completed',
  },
];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [open, setOpen] = useState(false);
  const [delivery, setDelivery] = useState([]);
  const [tracking, setTracking] = useState({
    courier: '',
    tracking_number: '',
  });
  const [deliveryView, setDeliveryView] = useState('active');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { userRole } = useAdmin();
  const deliveriesPerPage = 10;
  const start = (page - 1) * deliveriesPerPage;
  const end = start + deliveriesPerPage - 1;

  useEffect(() => {
    const fetchAllOrders = async () => {
      const isDeletedView = deliveryView === 'deleted';
      const { data, error, count } = await supabase
        .from('deliveries')
        .select(
          `
        *,
        orders!inner (
          status,
          flag_delete,
          shipping_method,
          shipping_address,
          created_at,
          users (
            first_name,
            last_name,
            phone
          )
        )
      `,
          { count: 'exact' },
        )
        .eq('orders.flag_delete', isDeletedView)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('Error fetching deliveries:', error);
      } else {
        setDeliveries(data);
        setTotalCount(count || 0);
      }
    };

    // Initial fetch
    fetchAllOrders();

    // Realtime subscription to deliveries table
    const channel = supabase
      .channel('deliveries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deliveries' },
        async () => {
          await fetchAllOrders();
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [deliveryView, end, start]);

  const deleteOrder = async (orderRef) => {
    const { error } = await supabase
      .from('orders')
      .update({ flag_delete: true })
      .eq('reference_number', orderRef);

    if (error) {
      console.error(error);
      return;
    }

    alert('Order archived!');
    window.location.reload();
  };

  const advanceDeliveryStatus = async (
    currentStatus,
    orderRef,
    shipping_method,
    tracking,
  ) => {
    const nextStatusMap = {
      pending: 'processing',
      processing: 'out_for_delivery',
      out_for_delivery: 'completed',
      completed: 'completed',
    };

    const nextStatus = nextStatusMap[currentStatus] || 'pending';

    const updatePayload = { status: nextStatus, updated_at: new Date() };

    // Add tracking info if applicable
    if (shipping_method === 'delivery' && currentStatus === 'processing') {
      updatePayload.shipping_partner = tracking?.courier || null;
      updatePayload.tracking_number = tracking?.tracking_number || null;
    }

    const { error } = await supabase
      .from('deliveries')
      .update(updatePayload)
      .eq('order_ref', orderRef)
      .select();

    if (error) {
      alert(`❌ Failed to update delivery status: ${error.message}`);
    } else {
      alert(`✅ Delivery status successfully updated to "${nextStatus}".`);
      setOpen(false);
    }
  };

  return (
    <>
      <Head>
        <title>Deliveries | Admin | SM Market</title>
      </Head>
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size='xl'>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delivery Detail</Dialog.Title>
              </Dialog.Header>
              {delivery.length !== 0 && (
                <>
                  <Dialog.Body>
                    <SimpleGrid templateColumns='40% 1fr' gap={4}>
                      <Stack borderRight='1px solid lightgray' pr={4} gap={4}>
                        <Heading size='md'>Order</Heading>
                        <Field.Root>
                          <Field.Label>Order ID / Reference Number</Field.Label>
                          <Text>{delivery.order_ref}</Text>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Customer</Field.Label>
                          <Text>{`${delivery.orders.users.first_name} ${delivery.orders.users.last_name}`}</Text>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Phone</Field.Label>
                          <Text>{delivery.orders.users.phone}</Text>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Order Date</Field.Label>
                          <Text>
                            {new Date(
                              delivery.orders.created_at,
                            ).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </Field.Root>
                      </Stack>
                      <Stack gap={4}>
                        <Heading size='md'>Shipping</Heading>
                        <Field.Root>
                          <Field.Label>Method</Field.Label>
                          <Text>
                            {delivery.orders.shipping_method.toUpperCase()}
                          </Text>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Address</Field.Label>
                          <Text>
                            {delivery.orders.shipping_method === 'pickup'
                              ? `${delivery.orders.shipping_address.branch_name} ${delivery.orders.shipping_address.branch_address}`
                              : `${delivery.orders.shipping_address.address_line}, ${delivery.orders.shipping_address.barangay}, ${delivery.orders.shipping_address.city} ${delivery.orders.shipping_address.province}`}
                          </Text>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Status</Field.Label>
                          <Text>
                            {delivery.orders.shipping_method === 'pickup' &&
                            delivery.status === 'out_for_delivery'
                              ? 'Ready for pickup'
                              : delivery.orders.shipping_method.toUpperCase()}
                          </Text>
                          <Steps.Root
                            defaultStep={
                              delivery.status === 'pending'
                                ? 0
                                : delivery.status === 'processing'
                                  ? 1
                                  : delivery.status === 'out_for_delivery'
                                    ? 2
                                    : delivery.status === 'completed'
                                      ? 3
                                      : 0
                            }
                            count={4}
                            size='sm'
                            colorPalette='green'
                          >
                            <Steps.List>
                              {steps.map((step, index) => (
                                <Steps.Item key={step.value} index={index}>
                                  <Steps.Indicator>
                                    <Steps.Status
                                      incomplete={step.icon}
                                      complete={step.icon}
                                    />
                                  </Steps.Indicator>
                                  <Steps.Separator />
                                </Steps.Item>
                              ))}
                            </Steps.List>

                            {steps.map((step, index) => (
                              <Steps.Content key={step.value} index={index}>
                                {delivery.orders.shipping_method === 'pickup' &&
                                delivery.status === 'out_for_delivery'
                                  ? 'Ready for pickup'
                                  : step.description}
                              </Steps.Content>
                            ))}
                            <Steps.CompletedContent>
                              All steps are complete!
                            </Steps.CompletedContent>
                          </Steps.Root>
                        </Field.Root>
                        {delivery.status === 'processing' &&
                          delivery.orders.shipping_method === 'delivery' && (
                            <Stack gap={4}>
                              <Field.Root>
                                <Field.Label>Courier</Field.Label>
                                <NativeSelect.Root>
                                  <NativeSelect.Field
                                    value={tracking.courier}
                                    onChange={(e) =>
                                      setTracking({
                                        ...tracking,
                                        courier: e.currentTarget.value,
                                      })
                                    }
                                  >
                                    <option value='lbc'>LBC</option>
                                    <option value='lalamove'>Lalamove</option>
                                  </NativeSelect.Field>
                                </NativeSelect.Root>
                              </Field.Root>
                              <Field.Root>
                                <Field.Label>Tracking Number</Field.Label>
                                <Input
                                  value={tracking.tracking_number}
                                  onChange={(e) =>
                                    setTracking({
                                      ...tracking,
                                      tracking_number: e.currentTarget.value,
                                    })
                                  }
                                  type='text'
                                  size='xs'
                                />
                              </Field.Root>
                            </Stack>
                          )}
                        {(delivery.status === 'out_for_delivery' ||
                          delivery.status === 'completed') &&
                          delivery.orders.shipping_method === 'delivery' && (
                            <Stack gap={4}>
                              <Field.Root>
                                <Field.Label>Courier</Field.Label>
                                <Text>
                                  {delivery.shipping_partner.toUpperCase()}
                                </Text>
                              </Field.Root>
                              <Field.Root>
                                <Field.Label>Tracking Number</Field.Label>
                                <Text>
                                  {delivery.tracking_number.toUpperCase()}
                                </Text>
                              </Field.Root>
                            </Stack>
                          )}
                      </Stack>
                    </SimpleGrid>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button
                      display={userRole === 'ITADMIN' ? 'none' : 'flex'}
                      bg='blue.600'
                      rounded='full'
                      onClick={() =>
                        advanceDeliveryStatus(
                          delivery.status,
                          delivery.order_ref,
                          delivery.orders.shipping_method,
                          tracking,
                        )
                      }
                      disabled={
                        ((tracking?.courier === '' ||
                          tracking?.tracking_number === '') &&
                          delivery.orders.shipping_method === 'delivery' &&
                          delivery.status === 'processing') ||
                        delivery.status === 'completed'
                      }
                    >
                      {delivery.status === 'pending'
                        ? 'Accept Order'
                        : delivery.status === 'processing' &&
                            delivery.orders.shipping_method === 'delivery'
                          ? 'Out for Delivery'
                          : delivery.status === 'processing' &&
                              delivery.orders.shipping_method === 'pickup'
                            ? 'Ready for Pickup'
                            : delivery.status === 'out_for_delivery'
                              ? 'Complete Order'
                              : 'Completed'}
                    </Button>
                    {userRole === 'ITADMIN' && (
                      <Stack>
                        <Button
                          colorPalette='red'
                          variant='outline'
                          onClick={() =>
                            deleteOrder(
                              delivery.order_ref,
                              delivery.orders.shipping_method,
                            )
                          }
                          disabled={delivery.status !== 'completed'}
                        >
                          Archive Order <LuArchive />
                        </Button>
                        <Text>Order should be completed before archiving.</Text>
                      </Stack>
                    )}
                  </Dialog.Footer>
                </>
              )}

              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      <Stack py={4}>
        <Card.Root>
          <Card.Header p={4}>
            <Card.Title fontSize='xl'>Deliveries</Card.Title>
          </Card.Header>
          <Separator />
          <Card.Body p={0}>
            <Tabs.Root
              value={deliveryView}
              onValueChange={(e) => {
                setDeliveryView(e.value);
                setPage(1);
              }}
              px={4}
              pt={4}
            >
              <Tabs.List>
                <Tabs.Trigger value='active'>Active Deliveries</Tabs.Trigger>
                <Tabs.Trigger value='deleted'>
                  Deactivated / Deleted Deliveries
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            <Table.Root interactive striped size='sm'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Reference Number</Table.ColumnHeader>
                  <Table.ColumnHeader>Customer</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Order Date</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {deliveries.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={4} textAlign='center'>
                      No{' '}
                      {deliveryView === 'deleted'
                        ? 'deactivated or deleted'
                        : 'active'}{' '}
                      deliveries found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  deliveries.map((delivery) => (
                    <Table.Row key={delivery.order_ref}>
                      <Table.Cell
                        cursor='pointer'
                        onClick={() => {
                          setOpen(true);
                          setDelivery(delivery);
                        }}
                      >
                        {delivery.order_ref}
                      </Table.Cell>

                      <Table.Cell>
                        {delivery.orders.users.first_name}{' '}
                        {delivery.orders.users.last_name}
                      </Table.Cell>

                      <Table.Cell>{delivery.status.toUpperCase()}</Table.Cell>

                      <Table.Cell>
                        {new Date(delivery.orders.created_at).toLocaleString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          },
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer py={2} px={0}>
            <Pagination.Root
              count={totalCount}
              page={page}
              pageSize={deliveriesPerPage}
              onPageChange={(e) => setPage(e.page)}
            >
              <ButtonGroup variant='ghost' size='sm'>
                <Pagination.PrevTrigger asChild>
                  <IconButton>
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.Items
                  render={(page) => (
                    <IconButton
                      variant={{ base: 'ghost', _selected: 'outline' }}
                    >
                      {page.value}
                    </IconButton>
                  )}
                />
                <Pagination.NextTrigger asChild>
                  <IconButton>
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          </Card.Footer>
        </Card.Root>
      </Stack>
    </>
  );
}
