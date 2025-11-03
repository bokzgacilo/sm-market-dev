import {
  Button,
  Card,
  Field,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import { supabase } from '@/helper/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Signin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { signIn } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, } = await supabase.auth.getUser();
      if (user) {
        router.replace('/profile');
      } else {
        setCheckingSession(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  if (checkingSession) {
    return (
      <Stack align='center' justify='center' h='80vh'>
        <Spinner size='xl' color='blue.500' />
        <Text mt={3}>Checking session...</Text>
      </Stack>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In | SM Market Mapua</title>
        <meta name='description' content='Sign in page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack gap={4} p={4}>
        <CustomBreadcrumb
          data={{ root: 'home', first: 'signin' }}
          display={{ base: 'none', md: 'block' }}
        />
        <Heading size='3xl' color='#0030FF'>
          Welcome Back!
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 1 }} gap={6}>
          <Card.Root>
            <Card.Body>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input
                    name='email'
                    type='email'
                    placeholder='you@example.com'
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <Input
                    name='password'
                    type='password'
                    placeholder='••••••••'
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </Field.Root>

                <Button
                  colorPalette='blue'
                  size='xl'
                  loading={loading}
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await signIn(form.email, form.password)
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setLoading(false)
                    }

                  }}
                >
                  Sign In
                </Button>

                <Text fontSize='sm' color='gray.600' textAlign='center'>
                  Don’t have an account?{' '}
                  <Link href='/signup' passHref>
                    Sign up
                  </Link>
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Stack>
    </>
  );
}
