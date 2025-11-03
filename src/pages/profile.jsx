import {
  Avatar,
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';
import EditAddress from '@/components/custom/EditAddress';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { signOut, user, userData } = useAuth();

  if (!user) {
    return (
      <Stack align='center' justify='center' h={{base: "100dvh", lg: "60dvh"}} p={4}>
        <Text fontSize='lg'>You’re not signed in.</Text>
        <Link href='/signin' passHref>
          <Button colorPalette='blue' rounded="full">Sign In</Button>
        </Link>
      </Stack>
    );
  }

  if (!userData) return null;

  return (
    <>
      <Head>
        <title>Profile | SM Market Mapua</title>
        <meta name='description' content='User profile page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <Stack gap={4} p={4}>
        <CustomBreadcrumb data={{ root: 'home', first: 'profile' }} />

        <Heading size='3xl' color='#0030FF'>
          Account
        </Heading>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Card.Root>
            <Card.Header p={4}>
              <Card.Title>
                Customer Profile
              </Card.Title>
            </Card.Header>
            <Separator />
            <Card.Body p={0}>
              <Stack gap={0}>
                <Stack bg="gray.100" align='center' gap={0} py={4}>
                  <Avatar.Root boxSize="150px">
                    <Avatar.Image />
                  </Avatar.Root>
                  <Heading fontSize='32px' mt={4}>
                    {userData.first_name} {userData.last_name}
                  </Heading>
                  <Text mt={2} color='gray.600' fontSize='sm'>
                    {userData.email.toLowerCase()}
                  </Text>
                  <Text color='gray.600' fontSize='sm'>
                    {userData.phone.toLowerCase()}
                  </Text>
                </Stack>
                <Separator />
                <Stack p={4}>
                  <Stack>
                    <Text fontWeight='bold'>Gender:</Text>
                    <Text>{userData.gender.toUpperCase()}</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight='bold'>Date Of Birth:</Text>
                    <Text>{userData.dob}</Text>
                  </Stack>
                  <Separator my={4} />
                  <Stack gap={4}>
                    <Field.Root>
                      <Field.Label>Street/Building/Unit/Room</Field.Label>
                      <Input readOnly value={userData.shipping_address.address_line} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Barangay</Field.Label>
                      <Input readOnly value={userData.shipping_address.barangay} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>City</Field.Label>
                      <Input readOnly value={userData.shipping_address.city} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Province</Field.Label>
                      <Input readOnly value={userData.shipping_address.province} />
                    </Field.Root>
                  </Stack>
                </Stack>
              </Stack>
            </Card.Body>
            <Separator />
            <Card.Footer p={4}>
              <Button
                colorPalette='red'
                onClick={async () => {
                  await signOut();
                }}
              >
                Logout
              </Button>
              <EditAddress useremail={userData.email} />
            </Card.Footer>
          </Card.Root>
          <Card.Root>
            <Card.Header p={4}>
              <Card.Title>Orders</Card.Title>
            </Card.Header>
            <Separator />
            <Card.Body>
              <Stack alignItems="center" gap={4}>
                <Text>No Orders</Text>
                <Box>
                  <Button rounded="full" bg="blue.600">Continue Shopping</Button>
                </Box>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Stack>
    </>
  );
}
