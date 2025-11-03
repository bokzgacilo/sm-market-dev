import { Box, Card, Flex, Image, Spinner, Stack, Text } from '@chakra-ui/react';
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
    <Card.Root flexDirection="row" gap={{base: 2, lg: 4}}>
      <Box p={2}>
        <Image boxSize={{base: "50px", lg: "90px"}} src={product.images?.[0]} alt={product.title} objectFit="contain" />
      </Box>
      <Box py={4} flex={1}>
        <Card.Body p={0}>
          <Card.Title fontSize={{base: "sm", lg: "xl"}} lineClamp={{base: 1, lg: 2}}>{product.title}</Card.Title>
          <Card.Description mt="auto">Quantity: {data.quantity} @ PHP{product.price}</Card.Description>
        </Card.Body>
      </Box>
      <Stack p={4} alignItems="flex-end">
        <Text cursor="pointer" color="red.500" onClick={onRemove}>Remove</Text>
        <Text mt="auto" fontSize={{base: "sm", lg: "xl"}} fontWeight="semibold">PHP {(product.price * data.quantity).toLocaleString()}</Text>
      </Stack>
    </Card.Root>

  );
}
