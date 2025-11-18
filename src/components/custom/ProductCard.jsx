import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Image,
  NumberInput,
  Box,
  Portal,
  Stack,
  Text,
  Heading,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LuPlus, LuShoppingCart } from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/helper/supabase";

export default function ProductCard({ pid, ...props }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, inventoryRes] = await Promise.all([
          supabase.from("products").select("*").eq("id", pid).single(),
          supabase.from("inventory").select("*").eq("product_id", pid).single(),
        ]);

        if (productRes.error) throw productRes.error;
        if (inventoryRes.error) throw inventoryRes.error;

        setProduct(productRes.data);

        const branch = JSON.parse(localStorage.getItem("branch_location"));
        const branchInventory = branch
          ? inventoryRes.data?.[branch.branch_code]
          : null;

        setInventory(branchInventory || { available: 0, sold: 0 });
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pid]);

  if (loading || !product) {
    return (
      <Stack gap={4}>
        <Skeleton width="100%" height={{ base: "150px", md: "300px" }} />
        <SkeletonText noOfLines={1} />
        <SkeletonText w="50%" noOfLines={1} />
        <Skeleton width="100%" height="40px" />
      </Stack>
    );
  }

  return (
    <Stack
      p={{ base: 2, md: 4 }}
      gap={2}
      border="1px solid transparent"
      borderRadius="md"
      _hover={{ borderColor: "gray.300" }}
      {...props}
    >
      <Link href={`/${product.category}/${product.subcategory}/${product.slug}`} passHref>
        <Stack gap={4}>
          <Stack position="relative">
            <Image
              alt={product.title}
              src={product.images?.[0]}
              width="100%"
              height={{ base: "150px", md: "300px" }}
              objectFit="cover"
            />

            <Flex position="absolute" top={0} gap={2}>
              {(() => {
                const createdDate = new Date(product.created_at);
                const diffInDays =
                  (new Date() - createdDate) / (1000 * 60 * 60 * 24);
                return diffInDays <= 1 ? (
                  <Badge bg="red.500" color="white">
                    New!
                  </Badge>
                ) : null;
              })()}

              {product.isSale && <Badge bg="yellow.400">Sale!</Badge>}
            </Flex>
          </Stack>

          <Heading fontSize={{ base: "md", lg: "xl" }} color="#0030FF" fontWeight="semibold">
            {product.title}
          </Heading>
        </Stack>
      </Link>

      {
        !product.isSale ?
          <Text fontSize="26px" fontWeight="700">
            ₱{Number(product.price).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          :
          <Flex direction={{ base: "column", lg: "row" }} alignItems={{ base: "start", lg: "center" }} gap={{ base: 0, lg: 2 }}>
            <Text fontSize="26px" fontWeight="700">
              ₱{Number(product.compare_at_price).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text fontSize="14px" fontWeight="700" textDecoration="line-through" color="gray.500">
              ₱{Number(product.price).toLocaleString("en-PH")}
            </Text>
          </Flex>
      }


      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Button
            mt="auto"
            bgColor="#0030FF"
            size={{ base: "md", md: "xl" }}
            disabled={inventory?.available === 0}
          >
            {inventory?.available === 0 ? "Out of Stock" : "Add to Cart"}{" "}
            {inventory?.available > 0 && <LuPlus />}
          </Button>
        </Dialog.Trigger>

        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{product.title}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Stack>
                  <Image
                    mb={{ base: 0, md: 6 }}
                    alt={product.title}
                    src={product.images?.[0]}
                    width="100%"
                    height={{ base: "150px", md: "300px" }}
                    objectFit="contain"
                  />
                  <NumberInput.Root
                    min={1}
                    max={inventory?.available}
                    value={qty}
                    onValueChange={(e) => setQty(Number(e.value))}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                  <Text>Available: {inventory?.available}</Text>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton />
                </Dialog.CloseTrigger>

                <Button
                  rounded="full"
                  bgColor="#0030FF"
                  disabled={qty === 0}
                  onClick={async () => {
                    await addToCart(product, qty)
                    setIsOpen(false)
                  }}
                >
                  Add To Cart <LuShoppingCart />
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}

// Simple badge component for clarity
const Badge = ({ children, bg, color = "black" }) => (
  <Box
    fontSize="10px"
    px="0.5rem"
    py="0.25rem"
    bg={bg}
    color={color}
    rounded="full"
    fontWeight="bold"
  >
    <Text>{children}</Text>
  </Box>
);
