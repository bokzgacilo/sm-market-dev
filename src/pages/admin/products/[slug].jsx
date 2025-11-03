import { supabase } from "@/helper/supabase";
import { Button, Flex, Image, Separator, Heading, Textarea, SimpleGrid, Field, Input, Stack, Text, Card, CloseButton, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function ProductDetails({ slug, close }) {
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()


      if (error) {
        setProduct(null)
        close()
        return;
      }

      setProduct(data)
    }

    fetchProduct()
  }, [slug])

  if(!product) return;

  return (
    <Stack>
      <Card.Root>
        <Card.Header>
          <HStack alignItems="center" justifyContent="space-between">
            <Card.Title>{product.title}</Card.Title>
            <CloseButton onClick={() => {
              setProduct(null)
              close()
            }} />
          </HStack>
        </Card.Header>
        <Card.Body>
          <Stack gap={4} p={0}>
            <Stack border="1px solid lightgray" borderRadius={4} py={2}>
              <Flex alignItems="center" justifyContent="space-between" px={4}>
                <Heading size="md">Inventory</Heading>
                <Button variant="outline" size="xs">Manage</Button>
              </Flex>
              <Separator />
              <SimpleGrid columns={3} px={4}>
                <Stack>
                  <Text fontWeight="semibold" fontSize="12px">Total Sold</Text>
                  <Heading>10</Heading>
                </Stack>
                <Stack>
                  <Text fontWeight="semibold" fontSize="12px">Available in Store</Text>
                  <Heading>10</Heading>
                </Stack>
                <Stack>
                  <Text fontWeight="semibold" fontSize="12px">In Cart</Text>
                  <Heading>0</Heading>
                </Stack>
              </SimpleGrid>
            </Stack>
            <Heading size="md">Details</Heading>
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input value={product.title} />
            </Field.Root>

            <HStack gap={4}>
              <Field.Root>
                <Field.Label>Price</Field.Label>
                <Input value={product.price} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Compare At</Field.Label>
                <Input value={product.compare_at_price} />
              </Field.Root>
            </HStack>
            <HStack gap={4}>
              <Field.Root>
                <Field.Label>Category</Field.Label>
                <Input value={product.category} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Subcategory</Field.Label>
                <Input value={product.subcategory} />
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label>Description</Field.Label>
              <Textarea value={product.description} />
            </Field.Root>

            <Heading size="md">Media</Heading>
            <SimpleGrid columns={3} gap={4}>
              {
                product.images.map((image) => (
                  <Image
                    key={Math.random()}
                    borderRadius={4}
                    height="200px"
                    w="full"
                    objectFit="contain"
                    border="1px solid lightgray"
                    src={image}
                  />
                ))
              }
            </SimpleGrid>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}