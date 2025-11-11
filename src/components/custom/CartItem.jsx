import { Box, Card, Flex, GridItem, Image, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/helper/supabase';

export default function CartItem({ data, onRemove }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', data.pid)
        .limit(1)
        .single();

      if (product) setProduct(product);
      setLoading(false);
    };

    getProduct();
  }, [data.pid]);

  if (loading) {
    return (
      <Flex justify='center' align='center' p={4}>
        <Spinner size='md' color='blue.500' />
      </Flex>
    );
  }

  if (!product) {
    return (
      <Flex justify='center' align='center' p={4}>
        <Text color='red.500'>Product not found.</Text>
      </Flex>
    );
  }

  return (
    <Card.Root flexDirection="row" gap={2}>
      <Box p={2}>
        <Image boxSize={{base: "50px", lg: "90px"}} src={product.images?.[0]} alt={product.title} objectFit="contain" />
      </Box>
        <Card.Body flex={1} p={2}>
          <SimpleGrid columns={2}>
            <GridItem colSpan={{base: 1, lg: 1}} order={1} >
              <Card.Title fontSize={{base: "sm", lg: "xl"}} lineClamp={{base: 1, lg: 2}}>{product.title}</Card.Title>
            </GridItem>
            <GridItem order={3} colSpan={typeof onRemove === "function" ? 1 : 2}>
              <Card.Description order={3}>Quantity: {data.quantity} @ PHP{product.price}</Card.Description>
            </GridItem>
            <GridItem order={4} colSpan={1}  ml="auto">
            {
              typeof onRemove === "function" && <Text cursor="pointer" color="red.500" onClick={onRemove}>Remove</Text>
            }
            </GridItem>
            <GridItem ml="auto" order={2} colSpan={1}>
              <Text fontSize={{base: "sm", lg: "xl"}} fontWeight="semibold">PHP {(product.price * data.quantity).toLocaleString()}</Text>
            </GridItem>
          </SimpleGrid>
        </Card.Body>
    </Card.Root>
  );
}