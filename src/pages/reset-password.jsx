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
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const [form, setForm] = useState({
    password: '',
    'retype-password': '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleResetPassword = async () => {
    if (form.password !== form['retype-password']) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Password updated successfully.');
    router.replace('/signin');
  };

  return (
    <>
      <Head>
        <title>Reset Password | SM Market Mapua</title>
        <meta name='description' content='Reset your password' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack gap={4} p={4} mt={{ base: 8, lg: 4 }} alignItems='center'>
        <Heading size='3xl' color='#0030FF'>
          Reset Password
        </Heading>

        <SimpleGrid
          columns={{ base: 1, md: 1 }}
          gap={6}
          width={{ base: '100%', md: '50%' }}
        >
          <Card.Root>
            <Card.Body>
              <Stack gap={4}>
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

                <Field.Root>
                  <Field.Label>Retype Password</Field.Label>
                  <Box position='relative' width='full'>
                    <Input
                      name='retype-password'
                      type={showRetypePassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      value={form['retype-password']}
                      onChange={handleChange}
                      pr='3rem'
                      required
                    />
                    <IconButton
                      aria-label={
                        showRetypePassword
                          ? 'Hide retype password'
                          : 'Show retype password'
                      }
                      position='absolute'
                      top='50%'
                      right={1}
                      transform='translateY(-50%)'
                      size='sm'
                      variant='ghost'
                      onClick={() =>
                        setShowRetypePassword((current) => !current)
                      }
                    >
                      {showRetypePassword ? <LuEyeOff /> : <LuEye />}
                    </IconButton>
                  </Box>
                </Field.Root>

                <Button
                  colorPalette='blue'
                  size='xl'
                  loading={loading}
                  onClick={handleResetPassword}
                >
                  Reset Password
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Stack>
    </>
  );
}
