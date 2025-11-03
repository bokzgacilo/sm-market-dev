// components/Layout.js

import {
  Button,
  Card,
  Field,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import Head from 'next/head';
import CustomBreadcrumb from '@/components/custom/CustomBreadcrumb';

export default function ContactUs() {
  return (
    <>
      <Head>
        <title>Contact Us</title>
        <meta name="description" content="Contact SM Markets Online" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack gap={4} p={4}>
        <CustomBreadcrumb
          data={{
            root: 'home',
            first: 'contact-us',
          }}
        />

        <Heading size='3xl' color='#0030FF'>
          Write Us
        </Heading>

        <Card.Root>
          <Card.Body p={0}>
            <Stack gap={4} p={4}>
              <Text fontWeight="semibold">
                Jot us a note here or email us at{' '}
                <Text as="a" href="mailto:support@smmarkets.ph" color="blue.500">
                  support@smmarkets.ph
                </Text>{' '}
                and we’ll get back to you as quickly as possible.
              </Text>

              <SimpleGrid columns={2} gap={4}>
                <Stack gap={4}>
                  <Field.Root id="name" isRequired>
                    <Field.Label>Name</Field.Label>
                    <Input size="xl" type="text" name="name" placeholder="Your Name" />
                  </Field.Root>
                  <Field.Root id="message" isRequired>
                    <Field.Label>What's on your mind?</Field.Label>
                    <Textarea
                      size="xl" 
                      name="message"
                      placeholder="Write your message here"
                      rows={8}
                    />
                  </Field.Root>
                </Stack>
                <Stack gap={4}>
                  <Field.Root id="email" isRequired>
                    <Field.Label>Email</Field.Label>
                    <Input size="xl"  type="email" name="email" placeholder="you@example.com" />
                  </Field.Root>

                  <Field.Root id="mobile" isRequired>
                    <Field.Label>Mobile Number</Field.Label>
                    <Input size="xl"  type="tel" name="number" placeholder="09XXXXXXXXX" />
                  </Field.Root>

                </Stack>
              </SimpleGrid>
              <Button bg='#0030FF' type="submit" w="fit-content">
                Submit
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
