import {
  Button,
  Flex,
  Icon,
  Image,
  InputGroup,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { LuMenu, LuUser } from 'react-icons/lu';
import { useAuth } from '@/context/AuthContext';
import BranchSelector from './custom/BranchSelector';
import CartDrawer from './custom/CartDrawer';
import FooterNavigation from './custom/footer-navigation';
import SearchInput from './custom/SearchInput';
import SideNavigation from './custom/side-navigation';

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const {userData} = useAuth();

  return (
    <Stack height='100dvh' gap={0}>
      <Flex
        w='100%'
        flexWrap='wrap'
        zIndex={5}
        direction='row'
        position='sticky'
        top='0'
        alignItems='center'
        p={4}
        backgroundColor='#0030FF'
        gap={{ base: 0, md: 4 }}
        gapY={{ base: 4, md: 0 }}
      >
        <Flex order={1} justifyContent='center'>
          <Image
            src='/images/smlogo.webp'
            height={{ base: '40px', md: '40px' }}
            alt='Logo'
            onClick={() => router.push("/")}
          />
        </Flex>
        <BranchSelector />
        <Flex
          order={{ base: 4, md: 3 }}
          flexBasis={{ base: '100%', md: 'auto' }}
          flex={{ base: '100%', md: 'auto' }}
          alignItems="center"

        >
          <InputGroup endElement={<FaSearch />}>
            <SearchInput />
          </InputGroup>
          
          {isMobile && <Icon ml={4} as={LuMenu} size='2xl' color='#fff' cursor='pointer' onClick={() => setIsOpen(prev => !prev)} />}
        </Flex>

        <Flex ml={4} order={{ base: 3, md: 4 }} gap={4} alignItems='center'>
          {userData ? (
            <Link href='/profile' passHref>
              <Icon as={LuUser} size='xl' color='#fff' cursor='pointer' />
            </Link>
          ) : (
            <Link href='/signin' passHref>
              {isMobile ? (
                <Icon as={LuUser} size='xl' color='#fff' cursor='pointer' />
              ) : (
                <Button
                  size='xl'
                  color='#0030FF'
                  backgroundColor='#fff'
                  fontWeight='semibold'
                >
                  Hello, sign in?
                </Button>
              )}
            </Link>
          )}

          <CartDrawer isMobile={isMobile} />
        </Flex>
        {isOpen && isMobile && (
          <SideNavigation closeNav={() => setIsOpen(false)} order={6} w="full" flex={1} />
        )}
      </Flex>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        height="100vh"
        overflow="hidden"
      >
        {!isMobile && <SideNavigation />}
        <Stack
          backgroundColor="#F5F5F5"
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          height="100%"
        >
          {children}
          <FooterNavigation />
        </Stack>
      </Flex>
    </Stack>
  );
}
