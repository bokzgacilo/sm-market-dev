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
import { useEffect, useState } from 'react';
import { LuEye, LuEyeOff, LuLogIn, LuMail } from 'react-icons/lu';
import { supabase } from '@/helper/supabase';

export default function AdminSignin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [pageTitle, SetPageTitle] = useState('Sign In | Admin | SM Market');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: systemUser } = await supabase
          .from('system_users')
          .select('status, flag_delete')
          .eq('id', data.user.id)
          .maybeSingle();

        if (
          systemUser &&
          systemUser.status?.toLowerCase() === 'active' &&
          !systemUser.flag_delete
        ) {
          router.replace('/admin/products');
          return;
        }

        await supabase.auth.signOut();
      }
    };
    fetchUser();
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);

    const { data: systemUser, error: systemUserError } = await supabase
      .from('system_users')
      .select('status, flag_delete')
      .eq('email', email)
      .maybeSingle();

    if (systemUserError) {
      alert(systemUserError.message);
      setLoading(false);
      return;
    }

    if (!systemUser) {
      alert('Only admin accounts can sign in here.');
      setLoading(false);
      return;
    }

    if (
      systemUser.status?.toLowerCase() !== 'active' ||
      systemUser.flag_delete
    ) {
      alert('Your admin account is inactive or deleted.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      console.log(data);
      router.replace('/admin/products');
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) {
      console.log(error);
    } else {
      alert('Password reset email sent successfully!');
      setPasswordReset(false);
      SetPageTitle('Sign In | Admin | SM Market');
    }

    // const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    // if (error) {
    //   alert(error.message);
    // } else {
    //   router.replace("/admin/products");
    // }
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
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
          />
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <Field.HelperText>
              {passwordReset
                ? 'Enter your registered email address to receive instructions on how to reset your password.'
                : 'Enter your email address'}
            </Field.HelperText>
          </Field.Root>
          {!passwordReset && (
            <Field.Root mt={2}>
              <Field.Label>Password</Field.Label>
              <Box position='relative' width='full'>
                <Input
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  type={showPassword ? 'text' : 'password'}
                  pr='3rem'
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
          )}
          <Button
            mt={4}
            bg='blue.600'
            loading={loading}
            onClick={passwordReset ? handlePasswordReset : handleSignIn}
          >
            {passwordReset ? 'Submit' : 'Sign In'}
            {passwordReset ? <LuMail /> : <LuLogIn />}
          </Button>
          <Button
            variant='outline'
            disabled={loading}
            onClick={() => {
              setPasswordReset(!passwordReset);
              SetPageTitle(
                passwordReset
                  ? 'Sign In | Admin | SM Market'
                  : 'Forgot Password | Admin | SM Market',
              );
            }}
          >
            {passwordReset ? 'Cancel' : 'Forgot Password?'}
          </Button>
        </Stack>

        {/* <Box width={{ base: "full", lg: "400px" }}>
        <Card.Root
          mt={8}
          variant="outline"
        >
          <Card.Body>
            <Stack
              gap={4}
            >
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  type="password"
                />
              </Field.Root>
              <Button mt={4} bg="blue.600" onClick={handleSignIn}>Sign In <LuLogIn /></Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Box> */}
      </Box>
    </>
  );
}
