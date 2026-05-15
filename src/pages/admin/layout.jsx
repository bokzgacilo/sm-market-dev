import {
  Badge,
  Button,
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
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  LuBox,
  LuChevronRight,
  LuClipboard,
  LuLogOut,
  LuMessageCircleQuestion,
  LuShoppingBag,
  LuTruck,
  LuUsers,
} from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export const AdminContext = createContext({
  userRole: null,
});

export const useAdmin = () => useContext(AdminContext);

const getRoleIndicator = (role) => {
  if (role === 'ITADMIN') {
    return 'IT ADMIN';
  }

  return 'ADMINISTRATOR';
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const navItems = [
    { href: '/', label: 'Go Shopping', icon: LuShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: LuUsers },
    { href: '/admin/users', label: 'Users', icon: LuUsers },
    { href: '/admin/deliveries', label: 'Deliveries', icon: LuTruck },
    { href: '/admin/orders', label: 'Orders and Sales', icon: LuClipboard },
    { href: '/admin/products', label: 'Products', icon: LuBox },
  ];
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();
  const roleIndicator = getRoleIndicator(userRole);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/admin/signin');
      } else {
        const { data: user, error } = await supabase
          .from('system_users')
          .select('role, status, flag_delete')
          .eq('id', data.user.id)
          .maybeSingle();

        if (
          error ||
          !user ||
          user.status?.toLowerCase() !== 'active' ||
          user.flag_delete
        ) {
          await supabase.auth.signOut();
          router.replace('/admin/signin');
          return;
        }

        setUserRole(user?.role);
        setCheckingAuth(false); // allow rendering
      }
    };
    fetchUser();
  }, [router]);

  if (checkingAuth) {
    return null; // or a spinner/loader
  }

  return (
    <Container p={0} maxWidth='full' bg='gray.200'>
      <SimpleGrid templateColumns='350px 1fr' height='100dvh' gap={4}>
        <Stack bg='bg' gap={0} pb={4}>
          <Stack mt={4} align='center' gap={4}>
            <Image
              src='/images/sm-markets-blue.jpg'
              width='300px'
              alt='SM Logo'
            />
            <Badge
              variant='solid'
              colorPalette={userRole === 'ITADMIN' ? 'purple' : 'blue'}
            >
              {roleIndicator}
            </Badge>
          </Stack>
          <Separator my={4} />
          <Stack px={4} gap={2} flex={1}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Flex
                  border='1px solid'
                  borderColor={
                    pathname === item.href ? 'border' : 'transparent'
                  }
                  bg={pathname === item.href ? 'blue.focusRing' : 'none'}
                  align='center'
                  direction='row'
                  gap={4}
                  px={4}
                  py={2}
                  borderRadius='md'
                  color={pathname === item.href ? 'fg.inverted' : 'fg.accent'}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text>{item.label}</Text>
                  <Icon ml='auto' as={LuChevronRight} boxSize={5} />
                </Flex>
              </Link>
            ))}
            <Badge size='lg' mt='auto' variant='solid' colorPalette='green'>
              Signed in as {roleIndicator}
            </Badge>
            <Button variant='outline'>
              My Permissions
              <LuMessageCircleQuestion />
            </Button>
            <Button
              variant='outline'
              colorPalette='red'
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace('/admin/signin');
              }}
            >
              <LuLogOut />
              Sign Out
            </Button>
          </Stack>
        </Stack>
        <AdminContext.Provider value={{ userRole }}>
          {children}
        </AdminContext.Provider>
      </SimpleGrid>
    </Container>
  );
}
