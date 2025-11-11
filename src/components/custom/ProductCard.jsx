import { Button, CloseButton, Dialog, Flex, Image, NumberInput, Box, Portal, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { LuPlus, LuShoppingCart } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export default function ProductCard({ data, ...props }) {
  const [qty, SetQty] = useState(1)
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false)

  const addToCart = async () => {
    console.log(data)
    const res = await supabase.auth.getUser();
    const user = res.data.user;

    if (!user) {
      alert("Please sign in first.")
      router.push('/signin');
      return;
    } else {
      try {
        // 1️⃣ Fetch current cart
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('cart_item')
          .eq('id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const currentCart = userData?.cart_item || [];
        const existingIndex = currentCart.findIndex(item => item.pid === data.slug);

        if (existingIndex !== -1) {
          currentCart[existingIndex].quantity += qty;
          alert(`Product quantity updated to ${currentCart[existingIndex].quantity}`);
        } else {
          currentCart.push({ pid: data.slug, quantity: qty });
          alert('Item added to cart!');
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ cart_item: currentCart })
          .eq('id', user.id);

        setIsOpen(false)
        if (updateError) throw updateError;

      } catch (err) {
        console.error(err);
        alert('Failed to update cart.');
      }
    }
  }

  return (
    <Stack
      p={{ base: 2, md: 4 }}
      gap={0}
      border="1px solid transparent"       // default border (invisible)
      borderRadius="md"                     // optional, for smooth corners
      _hover={{ borderColor: "gray.300" }} // change border color on hover
      {...props}
    >
      <Link
        href={`/${data.category}/${data.subcategory}/${data.slug}`}
        passHref
      >
        <Stack>
          <Stack
            position="relative"
          >
            <Image
              mb={{ base: 0, md: 6 }}
              alt={data.title}
              src={data.images[0]}
              width='100%'
              height={{ base: '150px', md: '300px' }}
              objectFit='contain'
            />
            <Flex
              direction="row"
              position="absolute"
              top={0}
              gap={2}
            >
              {data.created_at && (() => {
                const createdDate = new Date(data.created_at);
                const now = new Date();
                const diffInMs = now - createdDate;
                const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

                return diffInDays <= 1 ? (
                  <Box
                    fontSize="10px"
                    padding="0.5rem 1rem"
                    bg="red.500"
                    color="#fff"
                    rounded="full"
                    fontWeight="bold"
                  >
                    <Text>New!</Text>
                  </Box>
                ) : null;
              })()}

              {data.isSale &&
                <Box
                  fontSize="10px"
                  padding="0.5rem 1rem"
                  bg="yellow.400"
                  fontWeight="bold"
                  rounded="full"
                >
                  <Text>Sale!</Text>
                </Box>
              }

            </Flex>

          </Stack>

          <Text
            fontSize={{ base: '12px', md: '15px' }}
            color='#0030FF'
            fontWeight='semibold'
            mb={4}
          >
            {data.title}
          </Text>
        </Stack>
      </Link>
      <Text fontSize='26px' mt="auto" fontWeight='700'>
        ₱{data.price}
      </Text>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Button bgColor='#0030FF' mt={4} size={{ base: 'md', md: 'xl' }}>
            Add to Cart <LuPlus />
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{data.title}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack>
                  <Image
                    mb={{ base: 0, md: 6 }}
                    alt={data.title}
                    src={data.images[0]}
                    width='100%'
                    height={{ base: '150px', md: '300px' }}
                    objectFit='contain'
                  />


                  <NumberInput.Root min="0" max="20" value={qty} onValueChange={(e) => SetQty(Number(e.value))}>
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton />
                </Dialog.CloseTrigger>
                <Button rounded="full" bgColor='#0030FF' disabled={qty === 0} onClick={addToCart}>Add To Chart <LuShoppingCart /></Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}
