import { Badge, Box, Button, Card, Flex, GridItem, Heading, Image, NumberInput, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/helper/supabase';
import { useCart } from '@/context/CartContext';
import { LuTrash } from 'react-icons/lu';

export default function CartItem({ data, refresh, compute_total = null }) {
  const { removeFromCart, addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(data.quantity)
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true);
  const [disableButton, setDisableButton] = useState(false)
  const [isOutOfStock, setIsOutOfStock] = useState(false)
  const current_branch = JSON.parse(localStorage.getItem("branch_location"));
  const store_code = current_branch.branch_code;
  const [debouncedQty, setDebouncedQty] = useState(quantity);


  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', data.pid)
        .single();

      if (product) setProduct(product);
    };

    getProduct();
  }, [data.pid]);

  
  // Update debounced value after 0.5s
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQty(quantity);
    }, 1000); // 0.5 seconds

    return () => clearTimeout(handler);
  }, [quantity]);

  // Run your function when debounce finishes
  useEffect(() => {
    if (!product) return; // wait for product to load

    const updateQuantity = async () => {
      await addToCart(product, quantity)
    }

    updateQuantity()
  }, [debouncedQty]);

  useEffect(() => {
    if (!product) return; // wait for product to load

    const getInventory = async () => {
      setLoading(true);

      const { data: inventoryJSON, error } = await supabase
        .from("inventory")
        .select(store_code)
        .eq("product_id", product.id)
        .single();

      if (error) {
        console.error("Inventory fetch error:", error);
        setLoading(false);
        return;
      }

      if (!inventoryJSON) {
        setLoading(false);
        return;
      }


      const matchedStoreInventory = inventoryJSON[store_code];
      setInventory(matchedStoreInventory);
      console.log(matchedStoreInventory)

      if (data.quantity > matchedStoreInventory?.available) {
        setIsOutOfStock(true);
      } else {
        setIsOutOfStock(false)
      }

      setLoading(false);
    };

    getInventory();
  }, [product, refresh]);

  if (loading) {
    return (
      <Flex justify='center' align='center' p={4}>
        <Spinner size='md' color='blue.500' />
      </Flex>
    );
  }

  if (!product) {
    return (
      <Flex justify='center' align='center' p={4}>
        <Text color='red.500'>Product not found.</Text>
      </Flex>
    );
  }

  return (
    <Box position="relative">
      {/* CARD */}
      <Flex
        direction="row"
        gap={4}
        alignItems="center"
      >
        <Image
          boxSize={{ base: "50px", lg: "60px" }}
          src={product.images?.[0]}
          alt={product.title}
          objectFit="contain"
          rounded="md"
          border="1px solid lightgray"
        />
        <Stack
          gap={0}
        >
          <Flex alignItems="center" gap={2}>
            <Heading>
              {product.title}
            </Heading>
            {product.isSale && <Badge bg="yellow.400">Sale!</Badge>}
          </Flex>
          <Flex
            alignItems="center"
            direction="row"
            gap={4}
          >
            <NumberInput.Root
              width="25%"
              size="xs"
              value={quantity}
              onValueChange={(e) => setQuantity(parseInt(e.value, 10))}
              min={1}
              max={inventory.available}
            >
              <NumberInput.Input rounded={0} />
              <NumberInput.Control />
            </NumberInput.Root>
            <Text flex={1}>
              {product.isSale ? (
                <>
                  {((product.compare_at_price || product.price)).toFixed(2)}
                  <span style={{ textDecoration: "line-through", color: "gray", fontWeight: "bold", fontSize: "12px", marginLeft: "5px" }}>
                    ₱ {product.price.toFixed(2)}
                  </span>
                </>

              ) : (
                <>₱ {product.price.toFixed(2)}</>
              )}
            </Text>
          </Flex>

        </Stack>
        <Stack
          ml="auto"
          alignItems="flex-end"
          gap={0}
        >
          <Heading>
            ₱ {(
              quantity * (product.isSale ? product.compare_at_price : product.price)
            ).toLocaleString()}
          </Heading>
          {typeof removeFromCart === "function" && (
            <Button
              loading={disableButton}
              disabled={disableButton}
              colorPalette="red"
              size="xs"
              onClick={async () => {
                setDisableButton(true)
                await removeFromCart(product.id)
              }}><LuTrash /></Button>
          )}
        </Stack>
      </Flex>

      {data.out_of_stock && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="gray.800"
          opacity={0.7}
          display="flex"
          alignItems="center"
          justifyContent="center"
          rounded="lg"
          zIndex={10}
        >
          <Text color="white" fontSize="xl" fontWeight="bold">
            OUT OF STOCK
          </Text>
        </Box>
      )}
    </Box>
  );
}