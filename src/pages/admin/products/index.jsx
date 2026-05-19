import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Flex,
  IconButton,
  Image,
  Input,
  Pagination,
  Separator,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Stack,
  Table,
  Tabs,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuPlus } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';
import { useAdmin } from '../layout';
import ProductDetails from './[slug]';

export default function ProductIndex() {
  const [products, setAllProducts] = useState([]);
  const [isloadingProducts, isSetLoadingProducts] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productView, setProductView] = useState('active');
  const { userRole } = useAdmin();
  const [page, setPage] = useState(1);
  const productsPerPage = 10;
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage - 1;

  const fetchAllProducts = useCallback(async () => {
    const isDeletedView = productView === 'deleted';
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('slug', { ascending: true })
      .range(start, end);

    query = isDeletedView
      ? query.eq('flag_delete', true)
      : query.or('flag_delete.is.null,flag_delete.eq.false');

    if (searchQuery) {
      query = query.or(
        `slug.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`,
      );
    }

    const { data, count } = await query;

    if (data) {
      setAllProducts(data);
      isSetLoadingProducts(false);
      setTotalCount(count);
    }
  }, [end, productView, searchQuery, start]);

  useEffect(() => {
    fetchAllProducts();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchAllProducts(); // re-fetch on change
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchAllProducts]);

  return (
    <>
      <Head>
        <title>Products | Admin | SM Market</title>
      </Head>
      <SimpleGrid
        py={4}
        templateColumns={selectedSlug ? '1fr 50%' : '1fr'}
        backgroundColor='gray.200'
        gap={4}
        overflow='hidden'
      >
        <Stack>
          <Flex
            bg='white'
            p={4}
            rounded='md'
            alignItems='center'
            justifyContent='space-between'
          >
            <Link href='/admin/products/add'>
              <Button
                bg='blue.600'
                display={userRole === 'SUPERADMIN' ? 'flex' : 'none'}
              >
                Add Product
                <LuPlus />
              </Button>
            </Link>
            <Flex gap={4} px={4}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search product'
              />
              <Button
                bg='blue.600'
                onClick={() => {
                  setSearchQuery(search.trim());
                  setPage(1);
                }}
              >
                Search
              </Button>
            </Flex>
          </Flex>

          <Card.Root>
            <Card.Header p={4}>
              <Flex
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Card.Title fontSize='xl'>Products</Card.Title>
              </Flex>
            </Card.Header>
            <Card.Body p={0}>
              <Separator />
              <Tabs.Root
                value={productView}
                onValueChange={(e) => {
                  setProductView(e.value);
                  setSelectedSlug(null);
                  setPage(1);
                  window.history.pushState({}, '', '/admin/products');
                }}
                px={4}
                pt={4}
              >
                <Tabs.List>
                  <Tabs.Trigger value='active'>Active Products</Tabs.Trigger>
                  <Tabs.Trigger value='deleted'>
                    Deactivated / Deleted Products
                  </Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
              <Stack gap={4} px={0} py={4}>
                <Table.Root interactive striped size='sm'>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader w='10%'>Display</Table.ColumnHeader>
                      <Table.ColumnHeader>Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Price</Table.ColumnHeader>
                      <Table.ColumnHeader>Visibility</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {isloadingProducts && (
                      <Table.Row>
                        <Table.Cell>
                          <Skeleton height='40px' width='40px' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton height='25px' width='full' />
                        </Table.Cell>
                        <Table.Cell textAlign='end'>
                          <SkeletonText
                            height='25px'
                            width='50px'
                            noOfLines={1}
                          />
                        </Table.Cell>
                      </Table.Row>
                    )}
                    {products.length !== 0 ? (
                      products.map((product) => (
                        <Table.Row
                          cursor='pointer'
                          key={product.slug}
                          onClick={() => {
                            setSelectedSlug(product.slug);
                            window.history.pushState(
                              {},
                              '',
                              `/admin/products/${product.slug}`,
                            );
                          }}
                        >
                          <Table.Cell>
                            <Image
                              objectFit='contain'
                              width='30px'
                              height='30px'
                              src={product.images[0]}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight='semibold'>{product.title}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight='semibold'>
                              PHP {product.price}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              colorPalette={
                                product.isActive ? 'green' : 'yellow'
                              }
                            >
                              {product.isActive ? 'Active' : 'Archived'}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={5}>
                          <Text>No products found</Text>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Stack>
            </Card.Body>
            <Card.Footer p={4}>
              <Pagination.Root
                count={totalCount}
                pageSize={productsPerPage}
                page={page}
                onPageChange={(e) => setPage(e.page)}
              >
                <ButtonGroup variant='ghost' size='sm'>
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(page) => (
                      <IconButton
                        variant={{ base: 'ghost', _selected: 'outline' }}
                      >
                        {page.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton>
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Card.Footer>
          </Card.Root>
        </Stack>
        {selectedSlug && (
          <ProductDetails
            slug={selectedSlug}
            close={() => {
              setSelectedSlug(null);
              window.history.pushState({}, '', `/admin/products`);
            }}
          />
        )}
      </SimpleGrid>
    </>
  );
}
