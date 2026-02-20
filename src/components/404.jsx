import { Stack, Image, Heading, Text, Button } from "@chakra-ui/react";
import Head from "next/head";
import { LuMessageSquareWarning } from "react-icons/lu";

export default function Page404() {
  return (
    <>
      <Head>
        <title>404 | SM Supermarket</title>
      </Head>
      <Stack
        p={4}
        alignItems='center'
        gap={0}
        justifyContent='center'
      >
        <Image mt={8} boxSize="192px" src="/404.png" />
        <Heading size="xl">404: Page not found</Heading>
        <Text color="gray.500" fontSize="12px">The page you are looking for does not exist.</Text>
        <Button rounded="full" variant="outline" mt={4}><LuMessageSquareWarning /> Send a report</Button>
      </Stack>
    </>
  )
}