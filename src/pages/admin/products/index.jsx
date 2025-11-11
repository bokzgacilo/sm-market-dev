import { Badge, Box, Button, ButtonGroup, Card, Field, Flex, Heading, HStack, IconButton, Image, Input, Pagination, Separator, SimpleGrid, Skeleton, SkeletonText, Stack, Table, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPlus } from "react-icons/lu";
import { supabase } from "@/helper/supabase";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import ProductDetails from "./[slug]";

export default function ProductIndex() {
  const [products, setAllProducts] = useState([])
  const [isloadingProducts, isSetLoadingProducts] = useState(true)
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState(null)
  const router = useRouter();

  const [page, setPage] = useState(1);
  const productsPerPage = 5;
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage - 1;

  useEffect(() => {
    const fetchAllProducts = async () => {
      const { data, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("slug", { ascending: true })
        .range(start, end);

      if (data) {
        setAllProducts(data);
        isSetLoadingProducts(false);
        setTotalCount(count);
      }
    };

    fetchAllProducts();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Product change detected:", payload);
          fetchAllProducts(); // re-fetch on change
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [page]);

  return (
    <>
      <Head>
        <title>Products | Admin | SM Market Mapua</title>
      </Head>
      <SimpleGrid py={4} templateColumns={selectedSlug ? "1fr 50%" : "1fr"} backgroundColor="gray.200" gap={4} overflow="hidden">
        <Stack>
          <Flex bg="white" p={4} rounded="md" alignItems="center" justifyContent="space-between">
            <Link href="/admin/products/add">
              <Button bg="blue.600" >
                Add Product
                <LuPlus />
              </Button>
            </Link>
            <Flex gap={4} px={4}>
              <Input placeholder="Search product" />
              <Button bg="blue.600" >Search</Button>
            </Flex>
          </Flex>

          <Card.Root>
            <Card.Header p={4}>
              <Flex direction="row" alignItems="center" justifyContent="space-between">
                <Card.Title fontSize="xl">Products</Card.Title>

              </Flex>
            </Card.Header>
            <Card.Body
              p={0}
            >
              <Separator />
              <Stack
                gap={4}
                px={0}
                py={4}
              >
                <Table.Root interactive>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader w="10%">Display</Table.ColumnHeader>
                      <Table.ColumnHeader>Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Price</Table.ColumnHeader>
                      <Table.ColumnHeader>Visibility</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {
                      isloadingProducts && <Table.Row>
                        <Table.Cell>
                          <Skeleton height="40px" width="40px" />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton height="25px" width="full" />
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                          <SkeletonText height="25px" width="50px" noOfLines={1} />
                        </Table.Cell>
                      </Table.Row>
                    }
                    {products.length !== 0 ?
                      products.map((product) => (
                        <Table.Row
                          cursor="pointer"
                          key={product.slug}
                          onClick={() => {
                            setSelectedSlug(product.slug)
                            window.history.pushState({}, "", `/admin/products/${product.slug}`);
                          }}
                        >
                          <Table.Cell>
                            <Image objectFit="contain" width="30px" height="30px" src={product.images[0]} />
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight="semibold">{product.title}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight="semibold">PHP {product.price}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={product.isActive ? "green" : "yellow"}>{product.isActive ? "Active" : "Archived"}</Badge>
                          </Table.Cell>

                        </Table.Row>
                      )) : <></>
                    }
                  </Table.Body>
                </Table.Root>
              </Stack>
            </Card.Body>
            <Card.Footer p={4}>
              <Pagination.Root count={totalCount} pageSize={productsPerPage} defaultPage={page} onPageChange={(e) => setPage(e.page)}>
                <ButtonGroup variant="ghost" size="sm">
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(page) => (
                      <IconButton variant={{ base: "ghost", _selected: "outline" }}>
                        {page.value}
                      </IconButton>
                    )} />

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
        {selectedSlug && <ProductDetails slug={selectedSlug} close={() => {
          setSelectedSlug(null)
          window.history.pushState({}, "", `/admin/products`)
        }} />}
      </SimpleGrid>
    </>
  )
}