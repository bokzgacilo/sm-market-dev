import { Card, Popover, Portal, Stack, Table, Button, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";
import { LuCheck } from "react-icons/lu";

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchAllOrders = async () => {
      const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    users (
      first_name,
      last_name
    )
  `);

      console.log(data)
      setOrders(data)
    }

    fetchAllOrders();
  }, [])

  return (
    <Stack
      p={4}
    >
      <Card.Root>
        <Card.Header p={4}>
          <Card.Title fontSize="xl">Orders</Card.Title>
        </Card.Header>
        <Card.Body p={0}>
          <Table.Root striped>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Reference Number</Table.ColumnHeader>
                <Table.ColumnHeader>Customer</Table.ColumnHeader>
                <Table.ColumnHeader>Items</Table.ColumnHeader>
                <Table.ColumnHeader>Shipping Method</Table.ColumnHeader>
                <Table.ColumnHeader>Payment Status</Table.ColumnHeader>
                <Table.ColumnHeader>Order Date</Table.ColumnHeader>
                <Table.ColumnHeader>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.map((order, index) => (
                <Table.Row key={order.id}>
                  <Table.Cell>{order.reference_number}</Table.Cell>
                  <Table.Cell>{order.users.first_name} {order.users.last_name}</Table.Cell>
                  <Table.Cell>{order.cart_items.length}</Table.Cell>
                  {/* <Table.Cell>{order.shipping_method.toUpperCase()}</Table.Cell> */}
                  <Table.Cell>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <Button variant="outline" size="xs">
                          {order.shipping_method.toUpperCase()}
                        </Button>
                      </Popover.Trigger>
                      <Portal>
                        <Popover.Positioner>
                          <Popover.Content>
                            <Popover.Arrow />
                            <Popover.Body>
                              <Popover.Title>{order.shipping_method.toUpperCase()} Location</Popover.Title>
                              <Text>
                                {order.shipping_method === "pickup"
                                  ? order.shipping_address.branch_name + ", " + order.shipping_address.branch_address
                                  : order.shipping_address.address_line + ", " + order.shipping_address.barangay + ", " + order.shipping_address.city
                                }
                              </Text>
                            </Popover.Body>
                          </Popover.Content>
                        </Popover.Positioner>
                      </Portal>
                    </Popover.Root>
                  </Table.Cell>
                  <Table.Cell>{order.status.toUpperCase()}</Table.Cell>
                  <Table.Cell>{
                    new Date(order.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  }</Table.Cell>
                  <Table.Cell>
                    <Button disabled={order.status !== "paid"} variant="solid" size="sm" colorPalette="green">Complete Order <LuCheck /></Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>

          </Table.Root>
        </Card.Body>
        <Card.Footer>

        </Card.Footer>
      </Card.Root>
    </Stack>
  )
}