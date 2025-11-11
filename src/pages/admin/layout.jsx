import {
  Button,
  Card,
  Container,
  Flex,
  Icon,
  Image,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  LuBox,
  LuChevronRight,
  LuClipboard,
  LuDollarSign,
  LuDoorClosed,
  LuShoppingBag,
  LuTruck,
  LuUsers,
} from 'react-icons/lu';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const navItems = [
    { href: '/', label: 'Go Shopping', icon: LuShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: LuUsers },
    { href: '/admin/deliveries', label: 'Deliveries', icon: LuTruck },
    { href: '/admin/orders', label: 'Orders and Sales', icon: LuClipboard },
    { href: '/admin/products', label: 'Products', icon: LuBox },
  ];
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("auth_admin");
    if (!auth) {
      router.replace("/admin/signin");
    } else {
      setCheckingAuth(false); // allow rendering
    }
  }, [router]);

  if (checkingAuth) {
    return null; // or a spinner/loader
  }

  return (
    <Container p={0} maxWidth="full" bg="gray.200">
      <SimpleGrid templateColumns="400px 1fr" height="100dvh" gap={4} px={4}>
        <Stack py={4}>
          <Card.Root>
            <Card.Body p={0}>
              <Stack p={4}>
                <Image
                  src="/images/sm-markets-blue.jpg"
                  width="70%"
                  my={8}
                  alignSelf="center"
                  alt="SM Logo"
                />
                <Separator mb={4} />
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Flex
                      align="center"
                      direction="row"
                      gap={4}
                      p={4}
                      borderRadius="md"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      <Icon as={item.icon} boxSize={5} />
                      <Text>{item.label}</Text>
                      <Icon ml="auto" as={LuChevronRight} boxSize={5} />
                    </Flex>
                  </Link>
                ))}
                <Button
                  variant="outline"
                  rounded="full"
                  mt={4} 
                  size="xl"
                  colorPalette="red"
                  onClick={() => {
                    localStorage.removeItem("auth_admin");
                    router.replace("/admin/signin");
                  }}
                ><LuDoorClosed />Sign Out</Button>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
        {children}
      </SimpleGrid>
    </Container>
  );
}
