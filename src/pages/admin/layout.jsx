import {
  Card,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  LuBox,
  LuChevronRight,
  LuClipboard,
  LuDollarSign,
  LuUsers,
} from 'react-icons/lu';

export default function AdminLayout({ children }) {
  const navItems = [
    { href: '/admin/products', label: 'Products', icon: LuBox },
    { href: '/admin/orders', label: 'Orders', icon: LuClipboard },
    { href: '/admin/customers', label: 'Customers', icon: LuUsers },
    // { href: '/admin/sales', label: 'Sales', icon: LuDollarSign },
  ];

  return (
    <Container p={0} maxWidth="full" bg="gray.200">
      <SimpleGrid templateColumns="20% 1fr" height="100dvh" gap={0}>
        <Stack p={4}>
          <Card.Root bg="blue.600">
            <Card.Body p={0}>
              <Stack p={4} color="#fff">
                <Image
                  src="/images/smlogo.webp"
                  width="70%"
                  my={4}
                  alignSelf="center"
                  alt="SM Logo"
                />
                <Heading mt={4} size="2xl">
                  Menu
                </Heading>
                <Separator />

                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Flex
                      align="center"
                      direction="row"
                      gap={4}
                      color="#fff"
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
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>

        {/* ✅ Main content area */}
        {children}
      </SimpleGrid>
    </Container>
  );
}
