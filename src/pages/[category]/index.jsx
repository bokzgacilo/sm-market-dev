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
  Text,
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
import Filters from '@/components/custom/Filters';

export default function CategoryPage() {
  const router = useRouter();
  const { category, type = "all", sortBy = null, q = null} = router.query;
  const [subcategoriesArray, setSubcategoriesArray] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return; // Wait until router has the query params
    if (!category) return;

    const getSubcategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('subcategories')
        .eq('slug', category)
        .limit(1);
      if (error) {
        console.error(error)
        return;
      }
      setSubcategoriesArray(data[0].subcategories)
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getAllProducts({
          category: category,
          type: type,
          sortBy: sortBy,
          q:q
        });
        setAllProducts(products);
      } catch (err) {
        console.error(err);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getSubcategories()
    fetchProducts();
  }, [category, router])

  const pageTitle = category
    ? `${formatTitle(category)} | SM Supermarket`
    : 'Category | SM Supermarket';

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
              {subcategoriesArray.map((sub) => (
                <Link key={sub} href={`/${category}/${sub}`}>
                  <Tag.Root size='xl' rounded='full'>
                    <Tag.Label>
                      {sub
                        .replace(/-/g, " ") // replace hyphens with spaces
                        .split(" ") // split into words
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </Tag.Label>
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
