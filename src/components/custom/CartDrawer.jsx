import { Button, CloseButton, Drawer, Icon, Portal, RadioCard, Separator, Stack, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { LuShoppingCart } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/helper/supabase";
import CartItem from "./CartItem";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({isMobile}) {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const { cartItems } = useCart();
  
  return (
    <Drawer.Root
      size='md'
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Drawer.Trigger asChild>
        {isMobile ? (
          <Icon
            as={LuShoppingCart}
            size='xl'
            color='#fff'
            cursor='pointer'
            onClick={() => setOpen(true)}
          />
        ) : (
          <Button
            size='xl'
            color='#0030FF'
            backgroundColor='#fff'
            fontWeight='semibold'
            onClick={() => setOpen(true)}
          >
            My Cart
          </Button>
        )}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header p={4}>
              <Drawer.Title fontSize="xl">My Cart</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Separator />
            <Drawer.Body p={0}>
              <Stack p={4} gap={4}>
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <CartItem 
                      key={item.pid} 
                      data={item} 
                      refresh={item.pid}
                    />
                  ))
                ) : (
                  <Text fontSize="lg">No items in cart.</Text>
                )}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer justifyContent="flex-start" p={4} hidden={cartItems.length === 0}>
              <Drawer.ActionTrigger asChild>
                <Button w="full" colorPalette='blue' rounded="full" size="xl" onClick={() => router.push('/cart')}>
                  Review Cart
                  <LuShoppingCart />
                </Button>
              </Drawer.ActionTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}