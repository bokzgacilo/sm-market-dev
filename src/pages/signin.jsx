import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export default function Signin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!localStorage.getItem('auth_id')) return;
  }, []);

  // if (auth) {
  //   router.replace("/profile");
  //   return;
  // }

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { data: customer, error: customerError } = await supabase
        .from('users')
        .select('id, flag_delete')
        .eq('email', form.email)
        .maybeSingle();

      if (customerError) throw customerError;

      if (!customer) {
        alert('No customer account found with this email address.');
        return;
      }

      if (customer?.flag_delete) {
        alert(
          'Your account has been disabled or deleted.\n\nPlease contact the administrator to recover or reactivate your account.',
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        if (user.id !== customer.id) {
          await supabase.auth.signOut();
          alert('This sign in is not linked to a customer account.');
          return;
        }

        localStorage.setItem('auth_id', user.id);
        alert('Login successful!');
        router.replace('/profile');
      }
    } catch (err) {
      console.error(err.message);
      alert('Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);

    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('flag_delete')
      .eq('email', form.email)
      .maybeSingle();

    if (customerError) {
      alert(customerError.message);
      setLoading(false);
      return;
    }

    if (!customer) {
      alert('No account found with this email address.');
      setLoading(false);
      return;
    }

    if (customer.flag_delete) {
      alert(
        'Your account has been disabled or deleted.\n\nPlease contact the administrator to recover or reactivate your account.',
      );
      setLoading(false);
      return;
    }

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      form.email,
      redirectTo ? { redirectTo } : undefined,
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Password reset email sent successfully.');
    setPasswordReset(false);
  };

  return (
    <>
      <Head>
        <title>Sign In | SM Market Mapua</title>
        <meta name='description' content='Sign in page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack gap={4} p={4} mt={{ base: 8, lg: 4 }} alignItems='center'>
        <Heading size='3xl' color='#0030FF'>
          {passwordReset ? 'Forgot Password' : 'Welcome Back!'}
        </Heading>

        <SimpleGrid
          columns={{ base: 1, md: 1 }}
          justif
          gap={6}
          width={{ base: '100%', md: '50%' }}
        >
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
                  {passwordReset ? (
                    <Field.HelperText>
                      Enter your email address to receive a reset password link.
                    </Field.HelperText>
                  ) : null}
                </Field.Root>

                {!passwordReset ? (
                  <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <Box position='relative' width='full'>
                      <Input
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        value={form.password}
                        onChange={handleChange}
                        pr='3rem'
                        required
                      />
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        position='absolute'
                        top='50%'
                        right={1}
                        transform='translateY(-50%)'
                        size='sm'
                        variant='ghost'
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </IconButton>
                    </Box>
                  </Field.Root>
                ) : null}

                <Button
                  colorPalette='blue'
                  size='xl'
                  loading={loading}
                  onClick={passwordReset ? handlePasswordReset : handleSignIn}
                >
                  {passwordReset ? 'Submit' : 'Sign In'}
                </Button>
                <Button
                  variant='outline'
                  disabled={loading}
                  onClick={() => setPasswordReset((current) => !current)}
                >
                  {passwordReset ? 'Cancel' : 'Forgot Password?'}
                </Button>
                {/* <Separator />
                <Button variant="outline" onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: "http://localhost:3000/api/auth",
                    },
                  });
                }}>Google</Button> */}
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
