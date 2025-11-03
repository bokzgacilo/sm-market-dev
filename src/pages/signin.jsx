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
  Separator
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import { useAuth } from '@/context/AuthContext';

export default function Signin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signIn, user, userData} = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (userData) {
    router.replace("/profile");
    return;
  }

  return (
    <>
      <Head>
        <title>Sign In | SM Market Mapua</title>
        <meta name='description' content='Sign in page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack gap={4} p={4} alignItems="center">
        <Heading size='3xl' color='#0030FF'>
          Welcome Back!
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 1 }} justif gap={6} width={{base: "100%", lg: "30%"}}>
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
                <Separator />
                <Button variant="outline">Google</Button>
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
