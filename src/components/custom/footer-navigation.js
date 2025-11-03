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
          <Heading size={{ base: 'md', md: 'xl' }}>
            Get awesome exclusives and more deals when you subscribe!
          </Heading>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Input
              size={{ base: 'md', md: 'xl' }}
              placeholder='Enter your email address'
              backgroundColor='#fff'
              type='email'
            />
            <Button
              size={{ base: 'md', md: 'xl' }}
              backgroundColor='#fff'
              color='#0030FF'
              fontWeight='semibold'
            >
              Subscribe
            </Button>
          </Flex>
        </Stack>

        <Stack gap={4} alignItems={{ base: 'flex-start', md: 'flex-end' }}>
          <Heading>Follow Us</Heading>
          <Flex direction='row' alignItems='center' gap={2}>
            <Icon size='2xl' color='#fff'>
              <FaSquareFacebook />
            </Icon>
            <Icon size='2xl' color='#fff'>
              <FaInstagram />
            </Icon>
          </Flex>
        </Stack>
      </SimpleGrid>
      <Stack gap={8} mt={8}>
        <SimpleGrid templateColumns={{ base: '1fr', md: '25% 50%' }} gap={4}>
          <Link href='/terms-and-conditions'>
            <Heading>Terms & Conditions</Heading>
          </Link>
          <Link href='/profile'>
            <Heading>My Account</Heading>
          </Link>
          <Link href='/privacy-policy'>
            <Heading>Privacy Policy</Heading>
          </Link>
          <Link href='/faqs'>
            <Heading>FAQS</Heading>
          </Link>
          <Link href='/cookies-policy'>
            <Heading>Cookies Policy</Heading>
          </Link>
          <Link href='/contact-us'>
            <Heading>Contact Us</Heading>
          </Link>
        </SimpleGrid>
        <Heading>
          Copyright © 2025 Supervalue, Inc. All rights reserved.
        </Heading>
      </Stack>
    </Stack>
  );
}
