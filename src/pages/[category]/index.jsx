'use client';
import {
  Button,
  Box,
  Card,
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  NativeSelect,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductCard from '@/components/custom/ProductCard';
import formatTitle from '@/helper/slug';
import { getAllProducts, supabase } from '@/helper/supabase';

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [subcategoriesArray, setSubcategoriesArray] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSubcategories = useCallback(async () => {
    const { data: subcategories, error } = await supabase
      .from('categories')
      .select('subcategories')
      .eq('slug', category)
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (
      Array.isArray(subcategories) &&
      subcategories.length > 0 &&
      Array.isArray(subcategories[0].subcategories) &&
      subcategories[0].subcategories.length > 0
    ) {
      const formatted = subcategories[0].subcategories
        .filter((sub) => sub && sub.trim() !== '')
        .map((slug) => ({
          path: slug,
          name: slug
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        }));
      setSubcategoriesArray(formatted);
    }
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProducts(category, '');
      setAllProducts(data);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    getSubcategories();
    fetchProducts();
  }, [category, getSubcategories]);

  const pageTitle = category
    ? `${formatTitle(category)} | SM Supermarket`
    : 'Category | SM Supermarket';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Stack p={{ base: 0, lg: 4 }} gap={{ base: 2, lg: 4 }}>
        <Box p={{ base: 4, lg: 0 }} bg={{base: "gray.200", lg: "none"}}>
          <CustomBreadcrumb
            data={{
              root: 'home',
              first: category,
            }}
          />
        </Box>
        <Stack p={{base: 4, lg: 0}} gap={4}>
          <Heading size='3xl' color='#0030FF'>
            {formatTitle(category)}
          </Heading>

          {category && (
            <Flex direction='row' gap={4}>
              {subcategoriesArray.map((sub) => (
                <Link key={sub.path} href={`/${category}/${sub.path}`}>
                  <Tag.Root size='xl' rounded='full'>
                    <Tag.Label>{sub.name}</Tag.Label>
                  </Tag.Root>
                </Link>
              ))}
            </Flex>
          )}
        </Stack>

        <Card.Root rounded={{ base: 0, lg: "md" }}>
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
              {isLoading ? (
                <Center>
                  <Stack gap={8} p={4} alignItems='center'>
                    <Spinner color='blue.500' borderWidth='4px' size='xl' />
                    <Heading>{pageTitle}</Heading>
                  </Stack>
                </Center>
              ) : (
                <SimpleGrid mt={4} columns={{ base: 2, md: 5 }} gap={{ base: 2, lg: 4 }}>
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
