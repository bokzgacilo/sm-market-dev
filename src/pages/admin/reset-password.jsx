import {
  Box,
  Button,
  Field,
  IconButton,
  Image,
  Input,
  Stack,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export default function AdminResetPassword() {
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
    router.replace('/admin/signin');
  };

  return (
    <>
      <Head>
        <title>Reset Password | Admin | SM Market</title>
      </Head>
      <Box height='100dvh' maxW='full' position='relative'>
        <Image
          height='100dvh'
          width='full'
          objectFit='cover'
          position='absolute'
          zIndex={1}
          filter='brightness(0.3)'
          src='/images/photo1.jpeg'
          alt=''
        />
        <Stack
          top='40%'
          left='50%'
          transform='translate(-50%, -50%)'
          position='absolute'
          zIndex={2}
          bg='bg'
          width='400px'
          p={8}
          rounded='md'
        >
          <Image
            height='150px'
            objectFit='contain'
            src='/images/sm-markets-blue.jpg'
            my={8}
            alt='SM Markets'
          />
          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Box position='relative' width='full'>
              <Input
                disabled={loading}
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={form.password}
                onChange={handleChange}
                pr='3rem'
                required
              />
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
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

          <Field.Root mt={2}>
            <Field.Label>Retype Password</Field.Label>
            <Box position='relative' width='full'>
              <Input
                disabled={loading}
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
                disabled={loading}
                position='absolute'
                top='50%'
                right={1}
                transform='translateY(-50%)'
                size='sm'
                variant='ghost'
                onClick={() => setShowRetypePassword((current) => !current)}
              >
                {showRetypePassword ? <LuEyeOff /> : <LuEye />}
              </IconButton>
            </Box>
          </Field.Root>

          <Button
            mt={4}
            bg='blue.600'
            loading={loading}
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
        </Stack>
      </Box>
    </>
  );
}
