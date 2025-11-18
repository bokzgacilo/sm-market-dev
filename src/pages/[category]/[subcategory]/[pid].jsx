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
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LuHeart, LuShoppingCart } from 'react-icons/lu';
import Slider from 'react-slick';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductViewer from '@/components/custom/ProductViewer';
import formatTitle from '@/helper/slug';
import { supabase } from '@/helper/supabase';
import { useCart } from '@/context/CartContext';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

export default function ProductPage() {
  const router = useRouter();
  const {addToCart} = useCart();
  const { category, subcategory, pid } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!pid) return;

    const getProduct = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', pid)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
        return;
      }

      setProduct(data);
      setIsLoading(false);
    };

    getProduct();
  }, [pid]);

  const pageTitle = pid
    ? `${formatTitle(pid)} | SM Supermarket`
    : 'Category | SM Supermarket';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Stack p={{ base: 0, lg: 4 }} gap={{ base: 0, lg: 4 }}>
        <Box p={{ base: 4, lg: 0 }} bg={{base: "gray.200", lg: "none"}}>
          <CustomBreadcrumb
            data={{
              root: 'home',
              first: category,
              second: subcategory,
              third: pid,
            }}
          />

        </Box>

        <Card.Root rounded={{base: 0, lg: "md"}}>
          <Card.Body p={{ base: 0, lg: 4 }}>
            {isLoading ? (
              <Center>
                <Stack gap={8} p={4} alignItems='center'>
                  <Spinner color='blue.500' borderWidth='4px' size='xl' />
                  <Heading>{pageTitle}</Heading>
                </Stack>
              </Center>
            ) : (
              <SimpleGrid p={{ base: 0, lg: 4 }} columns={{ base: 1, lg: 2 }} gap={{ base: 2, lg: 8 }}>
                {product['3d_model'] ? (
                  <ProductViewer modelUrl={product['3d_model']} />
                ) : (
                  <Box py={4}>
                    <Slider {...settings}>
                      {product.images.map((img, index) => (
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
                  <Heading size='2xl'>{pageTitle}</Heading>
                  <Heading size={{ base: "3xl", lg: "5xl" }} my={4}>
                    PHP {product?.price}
                  </Heading>
                  <Field.Root>
                    <Field.Label>Quantity</Field.Label>
                    <NumberInput.Root defaultValue={1} value={quantity} onValueChange={(e) => setQuantity(e.value)} min="1" max="10" allowMouseWheel size="lg" w={{ base: "full", lg: "25%" }}>
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                  <Text mt={4} w={{ base: "full", lg: "70%" }}>{product?.description}</Text>
                  <Separator mt="auto" mb={2} />
                  <Flex gap={4} flexWrap="wrap">
                    <Button onClick={() => addToCart(product, quantity)} bg='#0030FF' size='xl' rounded="full">
                      <LuShoppingCart />Add To Cart
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
