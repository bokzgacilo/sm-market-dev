import {
  Card,
  Container,
  Heading,
  Image,
  Separator,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { LuBox, LuClipboard, LuDollarSign, LuUsers } from 'react-icons/lu';
import AdminNavLink from '@/components/custom/AdminNavLink';

export default function AdminLayout({ children }) {
  return (
    <Container p={0} maxWidth='full' bg='gray.200'>
      <SimpleGrid templateColumns='20% 1fr' height='100dvh' gap={0}>
        <Stack p={4}>
          <Card.Root bg='blue.600'>
            <Card.Body p={0}>
              <Stack p={4} color='#fff'>
                <Image
                  src='/images/smlogo.webp'
                  width='70%'
                  my={4}
                  alignSelf='center'
                />
                <Heading mt={4} size='2xl'>
                  Menu
                </Heading>
                <Separator />
                <AdminNavLink
                  href='/admin/products'
                  icon={<LuBox />}
                  label='Products'
                  showChevron
                />
                <AdminNavLink
                  href='/admin/orders'
                  icon={<LuClipboard />}
                  label='Orders'
                />
                <AdminNavLink
                  href='/admin/customers'
                  icon={<LuUsers />}
                  label='Customers'
                />
                <AdminNavLink
                  href='/admin/sales'
                  icon={<LuDollarSign />}
                  label='Sales'
                />
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
        {children}
      </SimpleGrid>
    </Container>
  );
}
