'use client';
import {
  Button,
  Box,
  Card,
  Center,
  Flex,
  Heading,
  HStack,
  Image,
  IconButton,
  NativeSelect,
  Text,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductCard from '@/components/custom/ProductCard';
import formatTitle from '@/helper/slug';
import { getAllProducts, supabase } from '@/helper/supabase';
import Filters from '@/components/custom/Filters';
import { categories } from '@/constants/Categories';
import Page404 from '@/components/404';

export default function CategoryPage() {
  const router = useRouter();
  const { category, type = "all", sortBy = null } = router.query;
  const [subcategoriesArray, setSubcategoriesArray] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryIsExisting = categories.some((cat) => cat.path === category)

  const pageTitle = category
    ? `${formatTitle(category)} | SM Supermarket`
    : 'Category | SM Supermarket';

  useEffect(() => {
    if (!router.isReady || !category) return;
    const subcategories = categories.find((cat) => cat.path === category)?.subcategories
    setSubcategoriesArray(subcategories)

    const fetchProducts = async () => {
      const products = await getAllProducts({
        category: category,
        type: type,
        sortBy: sortBy,
      });
      if (products) setIsLoading(false)
      setAllProducts(products)
    }
    fetchProducts()
  }, [router.isReady, category])

  if (router.isReady && !categoryIsExisting) {
    return <Page404 />
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Stack p={{ base: 0, lg: 4 }} gap={{ base: 2, lg: 4 }}>
        <Box p={{ base: 4, lg: 0 }} bg={{ base: "gray.200", lg: "none" }}>
          <CustomBreadcrumb
            data={{
              root: 'home',
              first: category,
            }}
          />
        </Box>
        <Stack p={{ base: 4, lg: 0 }} gap={4}>
          <Heading size='3xl' color='#0030FF'>
            {formatTitle(category)}
          </Heading>

          {category && (
            <Flex direction='row' gap={4}>
              {subcategoriesArray.map((subcat) => (
                <Link key={subcat.path} href={`/${category}/${subcat.path}`}>
                  <Tag.Root size='xl' rounded='full'>
                    <Tag.Label>{subcat.label}</Tag.Label>
                  </Tag.Root>
                </Link>
              ))}
            </Flex>
          )}
        </Stack>

        <Card.Root rounded={{ base: 0, lg: "md" }}>
          <Card.Body p={0}>
            <Stack p={{ base: 2, lg: 4 }} gap={0}>
              <Filters router={router} />
              {isLoading ? (
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
                  <SimpleGrid mt={4} columns={{ base: 2, md: 4 }} gap={{ base: 2, lg: 4 }}>
                    {allProducts.map((item) => (
                      <ProductCard pid={item.id} key={item.id} />
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
