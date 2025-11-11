import { Card, Stack, Table } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";

export default function Customers() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    const fetchAllCustomers = async () => {
      const { data } = await supabase
        .from("users")
        .select("last_name, first_name, email, dob, phone, gender")

      console.log(data)
      setCustomers(data)
    }

    fetchAllCustomers();
  }, [])

  return (
    <Stack
      py={4}
    >
      <Card.Root>
        <Card.Header p={4}>
          <Card.Title fontSize="xl">Customers</Card.Title>
        </Card.Header>
        <Card.Body p={0}>
          <Table.Root striped>
            <Table.Caption>This is list of registered customers</Table.Caption>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Phone</Table.ColumnHeader>
                <Table.ColumnHeader>Gender</Table.ColumnHeader>
                <Table.ColumnHeader>DoB</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {customers.map((customer, index) => (
                <Table.Row key={index.email}>
                  <Table.Cell>{customer.first_name} {customer.last_name}</Table.Cell>
                  <Table.Cell>{customer.email}</Table.Cell>
                  <Table.Cell>{customer.phone}</Table.Cell>
                  <Table.Cell>{customer.gender}</Table.Cell>
                  <Table.Cell>{customer.dob}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            
          </Table.Root>
        </Card.Body>
        <Card.Footer>

        </Card.Footer>
      </Card.Root>
    </Stack>
  )
}