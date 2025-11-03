import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  IconButton,
  NativeSelect,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductCard from '@/components/custom/ProductCard';
import formatTitle from '@/helper/slug';
import { getAllProducts } from '@/helper/supabase';

export default function CategoryPage() {
  const router = useRouter();
  const { category, subcategory } = router.query;
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProducts(category, subcategory);
      setAllProducts(data);
    };
    fetchProducts();
  }, [subcategory, category]);

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

        <Stack p={{base: 4, lg: 0}}>
          <Heading size='3xl' color='#0030FF'>
            {formatTitle(subcategory)}
          </Heading>
        </Stack>

        <Card.Root rounded={{ base: 0, lg: 'md' }}>
          <Card.Body p={0}>
            <Stack p={{base: 2, lg: 4}} gap={0}>
              <HStack>
                <Flex direction='row' gap={2}>
                  <Button variant='solid' size="sm" rounded="full" colorPalette='blue'>
                    All
                  </Button>
                  <Button variant='outline' size="sm" rounded="full">New</Button>
                  <Button variant='outline' size="sm" rounded="full">Sale</Button>
                </Flex>
                <Flex gap={4} ml='auto' w='250px'>
                  <IconButton rounded='full' variant='outline'>
                    <FiFilter />
                  </IconButton>
                  <Separator orientation='vertical' />
                  <NativeSelect.Root variant='subtle'>
                    <NativeSelect.Field>
                      <option>Popularity</option>
                      <option>Prices: Low to High</option>
                      <option>Prices: High to Low</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Flex>
              </HStack>

              {allProducts.length === 0 ? (
                <Text textAlign='center' color='gray.500' py={8}>
                  No products to show
                </Text>
              ) : (
                <SimpleGrid mt={4} columns={{ base: 2, md: 5 }}>
                  {allProducts.map((item) => (
                    <ProductCard key={item.id} data={item} />
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
