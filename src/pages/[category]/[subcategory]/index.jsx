import {
  Box,
  Card,
  Center,
  Heading,
  SimpleGrid,
  Stack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductCard from '@/components/custom/ProductCard';
import formatTitle from '@/helper/slug';
import { getAllProducts } from '@/helper/supabase';
import Filters from '@/components/custom/Filters';

export default function CategoryPage() {
  const router = useRouter();
  const { category, subcategory, type = "all", sortBy = null } = router.query;
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!router.isReady) return; // Wait until router has the query params
    if (!subcategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await getAllProducts({
          category: category,
          subcategory: subcategory,
          type: type,
          sortBy: sortBy,
        });
        setAllProducts(products);
      } catch (err) {
        console.error(err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, router])

  const pageTitle = subcategory
    ? `${formatTitle(subcategory)} | SM Supermarket`
    : 'Category | SM Supermarket';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Stack p={{ base: 0, lg: 4 }} gap={{ base: 2, lg: 4 }}>
        <Box p={{ base: 4, lg: 0 }} bg={{ base: 'gray.200', lg: 'none' }}>
          <CustomBreadcrumb
            data={{
              root: 'home',
              first: category,
              second: subcategory,
            }}
          />
        </Box>

        <Stack p={{ base: 4, lg: 0 }}>
          <Heading size='3xl' color='#0030FF'>
            {formatTitle(subcategory)}
          </Heading>
        </Stack>

        <Card.Root rounded={{ base: 0, lg: 'md' }}>
          <Card.Body p={0}>
            <Stack p={{ base: 2, lg: 4 }} gap={0}>
              <Filters router={router} />
              {loading ? (
                <Center>
                  <Stack gap={8} p={4} alignItems='center'>
                    <Spinner color='blue.500' borderWidth='4px' size='xl' />
                    <Heading>{pageTitle}</Heading>
                  </Stack>
                </Center>
              ) : (
                allProducts.length === 0 ?
                  <Text textAlign='center' color='gray.500' py={8}>No products to show</Text>
                  :
                  <SimpleGrid mt={4} columns={{ base: 2, md: 4}} gap={{ base: 2, lg: 4 }}>
                    {allProducts.map((item) => (
                      <ProductCard data={item} key={item.id} />
                    ))}
                  </SimpleGrid>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
