import { Stack, Button, Field, Badge, Text, Steps, Separator, Center, Heading, SimpleGrid } from "@chakra-ui/react";
import CartItem from "./CartItem";
import { useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";
import OrderItem from "./OrderItem";
import axios from "axios";
import { LuBox, LuCheck, LuClipboard, LuTruck } from "react-icons/lu";

const steps = [
  {
    icon: <LuClipboard />,
    description: "Waiting for processing",
  },
  {
    icon: <LuBox />,
    description: "Preparing Order",
  },
  {
    icon: <LuTruck />,
    description: "Out for Delivery",
  },
  {
    icon: <LuCheck />,
    description: "Completed",
  },
]

export default function FullDetail({ order: orderData, cart }) {
  const [order, setOrder] = useState([])
  const [delivery, setDelivery] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("reference_number", orderData.reference_number)
        .single();

      if (error) console.error(error);
      setOrder(data);
      if (data) setLoading(false);
    };

    const fetchDelivery = async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("order_ref", orderData.reference_number);

      if (error) console.error(error);
      console.log(data[0])
      setDelivery(data[0]);
    };

    // Initial fetch
    fetchOrder();
    fetchDelivery();

    // Realtime subscription — deliveries only
    const channel = supabase
      .channel("delivery_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
          filter: `order_ref=eq.${orderData.reference_number}`,
        },
        (data) => {
          console.log(data)
          fetchDelivery(); // refetch only deliveries
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderData.reference_number]);

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
    <Stack
      gap={4}
    >
      {loading &&
        <Center>
          <Text>Loading details</Text>
        </Center>
      }
      {
        order.length !== 0 &&
        <SimpleGrid templateColumns={{ base: "1fr", lg: "1fr 40%" }} gap={4}>
          <Stack
            pr={4}
            gap={4}
            borderRight={{ base: "none", lg: "1px solid lightgray" }}
          >
            <Heading size="lg">Shipping</Heading>
            <Field.Root>
              <Field.Label>Method</Field.Label>
              <Text fontWeight="semibold">{order.shipping_method.toUpperCase()}</Text>
            </Field.Root>
            <Field.Root>
              <Field.Label>Address</Field.Label>
              {
                order.shipping_method === "delivery" ?
                  <Text>{order.shipping_address.address_line} {order.shipping_address.barangay} {order.shipping_address.city} {order.shipping_address.province}</Text> :
                  <Text>{order.shipping_address.branch_name} {order.shipping_address.branch_address}</Text>
              }
            </Field.Root>
            {
              delivery.length === 0 ?
                <Stack>
                  <Text>You need to pay first before the merchant can process your order.</Text>
                  <Button bg="blue.600" rounded="full" onClick={() => handleCompletePayment(order.checkout_id)}>Pay Now</Button>
                </Stack>
                :
                <>
                  <Field.Root>
                    <Field.Label>Status</Field.Label>
                  </Field.Root>

                  <Steps.Root step={
                    delivery.status === "pending" ? 0 :
                      delivery.status === "processing" ? 1 :
                        delivery.status === "out_for_delivery" ? 2 :
                          delivery.status === "completed" ? 3 :
                            0
                  } count={4} size="sm" colorPalette="green">
                    <Steps.List>
                      {steps.map((step, index) => (
                        <Steps.Item key={index} index={index}>
                          <Steps.Indicator>
                            <Steps.Status incomplete={step.icon} complete={step.icon} />
                          </Steps.Indicator>
                          <Steps.Separator />
                        </Steps.Item>
                      ))}
                    </Steps.List>

                    {steps.map((step, index) => (
                      <Steps.Content key={index} index={index}>
                        {order.shipping_method === "pickup" && delivery.status === "out_for_delivery" ? "Ready for pickup" : step.description}
                      </Steps.Content>
                    ))}
                    <Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>
                  </Steps.Root>
                </>
            }
          </Stack>
          <Stack
            gap={4}
          >
            <Heading size="lg">Order</Heading>
            <Field.Root>
              <Field.Label>Order ID/Reference Number</Field.Label>
              <Text fontWeight="semibold">{order.reference_number}</Text>
            </Field.Root>
            <Field.Root>
              <Field.Label>Total Amount</Field.Label>
              <Text fontWeight="semibold">PHP {order.total_amount / 100}</Text>
            </Field.Root>
            {
              order.status === "pending" &&
              <Field.Root>
                <Field.Label>Payment Status</Field.Label>
                <Text>
                  {order.status === "pending" && "Waiting for payment"}
                </Text>
              </Field.Root>
            }

            <Heading size="lg">Order Items</Heading>
            <Stack>
              {cart.map((item) => (
                <OrderItem
                  key={item.pid}
                  data={item}
                />
              ))}
            </Stack>
          </Stack>
        </SimpleGrid>
      }
    </Stack>
  )
}