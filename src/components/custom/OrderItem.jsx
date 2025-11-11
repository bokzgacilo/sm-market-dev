import { Box, Card, Flex, GridItem, Image, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/helper/supabase';

export default function OrderItem({ data, onRemove }) {
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
    <Stack>
      <Flex
        direction="row"
        gap={4}
      >
        <Image border="1px solid lightgray" rounded="md" boxSize="50px" src={product.images?.[0]} alt={product.title} objectFit="contain" />
        <Stack
          gap={0}
        >
          <Text>{product.title}</Text>
          <Text>Quantity: {data.quantity} @ PHP{product.price}</Text>
        </Stack>
        <Heading size="sm" ml="auto">PHP {(product.price * data.quantity).toLocaleString()}</Heading>
      </Flex>
    </Stack>
  );
}