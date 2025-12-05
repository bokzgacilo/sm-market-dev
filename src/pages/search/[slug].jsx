'use client';
import {
  Button,
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
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import ProductCard from '@/components/custom/ProductCard';
import { getAllProducts, supabase } from '@/helper/supabase';
import Filters from '@/components/custom/Filters';

export default function SearchPage() {
  const router = useRouter();
  const { type = "all", sortBy = null, slug } = router.query;
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);

      const products = await getAllProducts({
        q: slug,
        type: type,
        sortBy: sortBy,
      });

      console.log(products)
      setResults(products);
      setIsLoading(false);
    };

    fetchSearchResults();
  }, [router]);

  const pageTitle = slug
    ? `Search: ${slug} | SM Supermarket`
    : 'Search | SM Supermarket';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Stack p={4} gap={4}>
        <CustomBreadcrumb
          data={{ root: 'home', first: 'search', second: slug }}
          display={{ base: 'none', md: 'block' }}
        />
        <Heading size={{ base: 'lg', md: '3xl' }} color='#0030FF'>
          Search results for “{slug}”
        </Heading>

        <Card.Root>
          <Card.Body p={0}>
            <Stack p={4}>
              <Filters router={router} />
              {/* <HStack flexWrap='wrap'>
                <Flex direction='row' gap={4}>
                  <Button variant='solid' colorPalette='blue'>
                    All
                  </Button>
                  <Button variant='outline'>New</Button>
                  <Button variant='outline'>Sale</Button>
                </Flex>
                <Flex gap={4} ml={{ base: 0, md: 'auto' }} w='250px'>
                  <IconButton rounded='full' variant='outline'>
                    <FiFilter />
                  </IconButton>
                  <Separator orientation='vertical' />
                  <NativeSelect.Root variant='subtle'>
                    <NativeSelect.Field>
                      <option>Relevance</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Flex>
              </HStack> */}
              {isLoading ? (
                <Center>
                  <Stack gap={8} p={4} alignItems='center'>
                    <Spinner color='blue.500' borderWidth='4px' size='xl' />
                    <Heading>Loading results...</Heading>
                  </Stack>
                </Center>
              ) : results.length > 0 ? (
                <SimpleGrid mt={4} columns={{ base: 2, md: 5 }} gap={4}>
                  {results.map((item) => (
                    <ProductCard pid={item.id} key={item.id} />
                  ))}
                </SimpleGrid>
              ) : (
                <Center p={10}>
                  <Heading size='md' color='gray.600'>
                    No products found for “{slug}”
                  </Heading>
                </Center>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
