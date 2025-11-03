import {
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaInstagram, FaSquareFacebook } from 'react-icons/fa6';

export default function FooterNavigation() {
  return (
    <Stack
      mt='auto'
      p={{ base: 4, md: 12 }}
      backgroundColor='#0030FF'
      color='#fff'
    >
      <SimpleGrid templateColumns={{ base: '1fr', md: '50% 50%' }} gap={4}>
        <Stack flex={1} gap={4}>
          <Heading size="md">
            Get awesome exclusives and more deals when you subscribe!
          </Heading>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Input
              size={{ base: 'md', lg: 'lg' }}
              placeholder='Enter your email address'
              backgroundColor='#fff'
              type='email'
            />
            <Button
              size={{ base: 'md', lg: 'lg' }}
              backgroundColor='#fff'
              color='#0030FF'
              fontWeight='semibold'
            >
              Subscribe
            </Button>
          </Flex>
        </Stack>

        <Stack gap={4} alignItems={{ base: 'flex-start', md: 'flex-end' }}>
          <Heading size="md">Follow Us</Heading>
          <Flex direction='row' alignItems='center' gap={2}>
            <Link href="https://web.facebook.com/SMMarkets" target="_blank" rel="noopener noreferrer">
              <Icon height="50px" width="50px" color='#fff' cursor="pointer">
                <FaSquareFacebook />
              </Icon>
            </Link>
            <Link href="https://www.instagram.com/smmarkets" target="_blank" rel="noopener noreferrer">
              <Icon height="50px" width="50px" color='#fff' cursor="pointer">
                <FaInstagram />
              </Icon>
            </Link>
          </Flex>
        </Stack>
      </SimpleGrid>
      <Stack gap={4} mt={8}>
        <SimpleGrid templateColumns={{ base: '1fr', md: '25% 50%' }} gap={4}>
          <Link href='/terms-and-conditions'>
            <Heading size="md">Terms & Conditions</Heading>
          </Link>
          <Link href='/profile'>
            <Heading size="md">My Account</Heading>
          </Link>
          {/* <Link href='/privacy-policy'>
            <Heading size="md">Privacy Policy</Heading>
          </Link> */}
          <Link href='/faqs'>
            <Heading size="md">FAQS</Heading>
          </Link>
          <Link href='/cookies-policy'>
            <Heading size="md">Cookies Policy</Heading>
          </Link>
          <Link href='/contact-us'>
            <Heading size="md">Contact Us</Heading>
          </Link>
        </SimpleGrid>
        <Heading size="sm">
          Copyright © 2025 Supervalue, Inc. All rights reserved.
        </Heading>
      </Stack>
    </Stack>
  );
}
