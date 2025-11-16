import { supabase } from '@/helper/supabase';
import { Stack, Field, Input, Button, HStack, Text, Heading, Table, NumberInput } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function ManageInventory({ product_id, update }) {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('product_id', product_id)
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        setInventory(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (product_id) {
      fetchInventory();
    }
  }, [product_id]);

  useEffect(() => {
    if (inventory) {
      update(inventory);
    }
  }, [inventory, update]);

  const handleInventoryChange = (location, field, value) => {
    setInventory(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        [field]: value
      }
    }));

    
  };

  if (loading) return <Text>Loading inventory...</Text>;
  if (error) return <Text color="red">{error}</Text>;
  if (!inventory) return <Text>No inventory found</Text>;
  const locations = ["aura", "makati", "sta_mesa"];
  return (
    <Stack gap={4}>
      <Table.Root
        size="sm"
        interactive
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Branch</Table.ColumnHeader>
            <Table.ColumnHeader>Available</Table.ColumnHeader>
            <Table.ColumnHeader>Sold</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {locations.map(loc => (
            <Table.Row key={loc}>
              <Table.Cell>{loc.toLocaleUpperCase()}</Table.Cell>
              <Table.Cell>
                <NumberInput.Root
                  size="sm"
                  variant="outline"
                  value={inventory[loc].available}
                  onValueChange={(e) => handleInventoryChange(loc, 'available', e.value)}
                  min={0  }
                >
                  <NumberInput.Control />
                  <NumberInput.Input />
                </NumberInput.Root>
                {/* <Input 
                  type="number"
                  min={0}
                  value={inventory[loc].available}
                  onChange={(e) => handleInventoryChange(loc, 'available', e.currentTarget.value)}
                /> */}
              </Table.Cell>
              <Table.Cell>{inventory[loc].sold}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}