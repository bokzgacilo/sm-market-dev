import { Box, Button, Card, Field, Image, Input, Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { LuChevronsRight } from "react-icons/lu";

export default function AdminSignin() {
  const [form, setForm] = useState({
    code: "",
    password: ""
  })
  const router = useRouter();


  useEffect(() => {
    const auth = localStorage.getItem("auth_admin");
    if (auth) {
      router.replace("/admin/products");
    }
  }, [router]);

  return (
    <Stack
      padding={4}
      height="100dvh"
      maxW="full"
      bg="gray.200"
      alignItems="center"
    >
      <Box width={{ base: "full", lg: "500px" }}>
        <Card.Root>
          <Card.Header>
            <Card.Title>Admin Login</Card.Title>
          </Card.Header>
          <Card.Body>
            <Stack
              gap={4}
            >
              <Image height="150px" objectFit="contain" src="/images/sm-markets-blue.jpg" my={8} />
              <Field.Root>
                <Field.Label>Admin Code</Field.Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.currentTarget.value })}
                  size="sm" />
              </Field.Root>
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
                  type="password"
                  size="sm"
                />
              </Field.Root>
              <Button size="xl" rounded="full" bg="blue.600" onClick={() => {
                if (form.code === "admin" && form.password === "admin") {
                  localStorage.setItem("auth_admin", true)
                  alert("Login successful! Redirecting to admin products...");
                  router.replace("/admin/products");
                } else {
                  alert("Invalid admin credentials. Please try again.");
                  setForm({
                    code: "",
                    password: "",
                  })
                }
              }}>Sign In <LuChevronsRight /></Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Box>
    </Stack>
  )
}