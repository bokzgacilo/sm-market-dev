import {
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Pagination,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Stat,
  Table,
  Tabs,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { TbCurrencyPeso } from 'react-icons/tb';
import FullDetail from '@/components/custom/FullDetail';
import { getSalesMetrics } from '@/helper/get_sales_metrics';
import { supabase } from '@/helper/supabase';
import { useAdmin } from './layout';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [orderView, setOrderView] = useState('active');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { userRole } = useAdmin();
  const ordersPerPage = 10;
  const start = (page - 1) * ordersPerPage;
  const end = start + ordersPerPage - 1;

  useEffect(() => {
    const fetchAllOrders = async () => {
      const isDeletedView = orderView === 'deleted';
      const { data, error, count } = await supabase
        .from('orders')
        .select(
          `
        *,
        users (
          first_name,
          last_name
        )
      `,
          { count: 'exact' },
        )
        .eq('flag_delete', isDeletedView)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error(error);
        return;
      }

      setOrders(data);
      setTotalCount(count || 0);
    };

    fetchAllOrders();
  }, [end, orderView, start]);

  useEffect(() => {
    getSalesMetrics().then((metrics) => {
      setMetrics(metrics);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Orders | Admin | SM Market</title>
      </Head>
      <Dialog.Root
        size={{ base: 'xl', lg: 'xl' }}
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Full Details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <FullDetail userRole={userRole} order={order} cart={cart} />
              </Dialog.Body>
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
            <Card.Title fontSize='xl'>Orders And Sales</Card.Title>
          </Card.Header>
          <Separator />
          <Card.Body p={0}>
            <Stack>
              <SimpleGrid columns={5} p={4} gap={4}>
                <Stat.Root borderWidth='1px' rounded='md' p={4}>
                  <HStack justifyContent='space-between'>
                    <Stat.Label>({metrics.total_count}) Total Sales</Stat.Label>
                    <Icon color='fg.muted'>
                      <TbCurrencyPeso />
                    </Icon>
                  </HStack>
                  <Stat.ValueText>{metrics.total_sales}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root borderWidth='1px' rounded='md' p={4}>
                  <HStack justifyContent='space-between'>
                    <Stat.Label>({metrics.paid_count}) Paid Orders</Stat.Label>
                    <Icon color='fg.muted'>
                      <TbCurrencyPeso />
                    </Icon>
                  </HStack>
                  <Stat.ValueText>{metrics.sales_by_paid}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root borderWidth='1px' rounded='md' p={4}>
                  <HStack justifyContent='space-between'>
                    <Stat.Label>
                      ({metrics.pending_count}) Unpaid Orders
                    </Stat.Label>
                    <Icon color='fg.muted'>
                      <TbCurrencyPeso />
                    </Icon>
                  </HStack>
                  <Stat.ValueText>{metrics.sales_by_pending}</Stat.ValueText>
                </Stat.Root>
              </SimpleGrid>
            </Stack>
            <Separator />
            <Tabs.Root
              value={orderView}
              onValueChange={(e) => {
                setOrderView(e.value);
                setPage(1);
              }}
              px={4}
              pt={4}
            >
              <Tabs.List>
                <Tabs.Trigger value='active'>Active Orders</Tabs.Trigger>
                <Tabs.Trigger value='deleted'>
                  Archived Orders
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            <Table.Root interactive striped size='sm'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Reference Number</Table.ColumnHeader>
                  <Table.ColumnHeader>Customer</Table.ColumnHeader>
                  <Table.ColumnHeader>Items</Table.ColumnHeader>
                  <Table.ColumnHeader>Payment Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Order Date</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign='center'>
                      No orders found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  orders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell
                        cursor='pointer'
                        onClick={() => {
                          setOpen(true);
                          setCart(order.cart_items);
                          setOrder(order);
                        }}
                      >
                        {order.reference_number}
                      </Table.Cell>

                      <Table.Cell>
                        {order.users.first_name} {order.users.last_name}
                      </Table.Cell>
                      <Table.Cell>{order.cart_items.length}</Table.Cell>
                      <Table.Cell>{order.status.toUpperCase()}</Table.Cell>
                      <Table.Cell>
                        {new Date(order.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
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
              pageSize={ordersPerPage}
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
