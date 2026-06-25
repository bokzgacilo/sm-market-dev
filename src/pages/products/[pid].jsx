import {
  Box,
  Button,
  Card,
  Center,
  Field,
  Flex,
  Heading,
  Image,
  NumberInput,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuShoppingCart } from "react-icons/lu";
import Slider from "react-slick";
import CustomBreadcrumb from "@/components/custom/CustomBreadcrumb";
import ProductViewer from "@/components/custom/ProductViewer";
import { useCart } from "@/context/CartContext";
import formatTitle from "@/helper/slug";
import { supabase } from "@/helper/supabase";

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

function hasMeasurements(measurements) {
  return Boolean(
    measurements &&
    (measurements.length || measurements.width || measurements.height)
  );
}

export default function ProductPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { pid } = router.query;
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [child, setChild] = useState(null);

  useEffect(() => {
    if (!pid) return;

    const getProduct = async () => {
      setIsLoading(true);
      const { data: product } = await supabase
        .from("products")
        .select("id, category, subcategory, child")
        .eq("slug", pid)
        .single();

      const { data: inventory } = await supabase
        .from("inventory")
        .select("*, products(*)")
        .eq("product_id", product.id)
        .single();

      const branch = JSON.parse(localStorage.getItem("branch_location"));
      const branchInventory = branch ? inventory[branch.branch_code] : null;

      setCategory(product.category);
      setSubcategory(product.subcategory);
      setChild(product.child);
      setInventory(branchInventory || { available: 0, sold: 0 });
      setProduct(inventory);
      setIsLoading(false);
    };

    getProduct();
  }, [pid]);

  const pageTitle = pid
    ? `${formatTitle(pid)} | SM Supermarket`
    : "Category | SM Supermarket";
  const productMeasurements = product?.products?.measurements;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Stack p={{ base: 0, lg: 4 }} gap={{ base: 0, lg: 4 }}>
        <Box p={{ base: 4, lg: 0 }} bg={{ base: "gray.200", lg: "none" }}>
          <CustomBreadcrumb
            data={{
              root: "home",
              first: category,
              second: subcategory,
              third: child,
              fourth: pid,
            }}
          />
        </Box>

        <Card.Root rounded={{ base: 0, lg: "md" }}>
          <Card.Body p={0}>
            {isLoading ? (
              <Center>
                <Stack gap={8} p={4} alignItems="center">
                  <Spinner color="blue.500" borderWidth="4px" size="xl" />
                  <Heading>{pageTitle}</Heading>
                </Stack>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 2, lg: 4 }}>
                {product.products["3d_model"] ? (
                  <ProductViewer
                    modelUrl={product.products["3d_model"]}
                    description={product.products.description}
                    productMeasurements={productMeasurements}
                  />
                ) : (
                  <Box py={4}>
                    <Slider {...settings}>
                      {product.products.images.map((img, index) => (
                        <Image
                          key={index.img}
                          src={img}
                          alt={`${product.title} image ${index + 1}`}
                          width="100%"
                          height="400px"
                          objectFit="contain"
                        />
                      ))}
                    </Slider>
                  </Box>
                )}
                <Stack p={4}>
                  <Heading size="2xl">{pageTitle}</Heading>
                  <Heading size={{ base: "3xl", lg: "5xl" }} my={4}>
                    PHP{" "}
                    {product.products.isSale
                      ? product.products.compare_at_price
                      : product.products.price}
                  </Heading>
                  <Field.Root>
                    <Field.Label fontWeight="semibold" fontSize="18px">
                      QUANTITY
                    </Field.Label>
                    <NumberInput.Root
                      defaultValue={1}
                      value={quantity}
                      onValueChange={(e) => setQuantity(e.value)}
                      min="1"
                      max="10"
                      allowMouseWheel
                      size="lg"
                      w={{ base: "full", lg: "25%" }}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                    <Text fontSize="12px" fontWeight="bold" color="fg.muted">
                      AVAILABLE: {inventory.available}
                    </Text>
                  </Field.Root>
                  <Text mt={4} w={{ base: "full", lg: "70%" }}>
                    {product.products.description}
                  </Text>
                  {hasMeasurements(productMeasurements) ? (
                    <Stack gap={1}>
                      <Text fontWeight="semibold">Measurements</Text>
                      <Text color="fg.muted">
                        Length: {productMeasurements.length || 0} x Width:{" "}
                        {productMeasurements.width || 0} x Height:{" "}
                        {productMeasurements.height || 0}
                      </Text>
                    </Stack>
                  ) : null}
                  <Flex
                    gap={4}
                    mt="auto"
                    justifyContent="end"
                    alignItems="flex-end"
                  >
                    <Button
                      onClick={() => addToCart(product.products, quantity)}
                      bg="#0030FF"
                      size="2xl"
                    >
                      <LuShoppingCart />
                      Add To Cart
                    </Button>
                    {/* <Button rounded="full" variant='outline' size='xl'><LuHeart />Add To Wishlist </Button> */}
                  </Flex>
                </Stack>
              </SimpleGrid>
            )}
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
