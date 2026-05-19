import {
  Badge,
  Button,
  Card,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Table,
  Textarea,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LuBoxes, LuEye, LuPen, LuRefreshCcw, LuTrash } from 'react-icons/lu';
import ManageInventory from '@/components/custom/ManageInventory';
import { supabase } from '@/helper/supabase';
import { useAdmin } from '../layout';

export default function ProductDetails({ slug, close }) {
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [newInventory, setNewInventory] = useState({});
  const router = useRouter();
  const productSlug = slug || router.query.slug;
  const { userRole } = useAdmin();
  const canManageDeletedProducts = userRole === 'ITADMIN';
  const canModifyProducts = userRole === 'SUPERADMIN';
  const closeDetails = () => {
    if (close) {
      close();
      return;
    }

    router.push('/admin/products');
  };

  // Fetch product
  useEffect(() => {
    const loadProduct = async () => {
      if (!productSlug) return;

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .single();

      setProduct(data);
    };
    loadProduct();
  }, [productSlug]);

  // Fetch inventory once product exists
  useEffect(() => {
    if (!product) return;

    const loadInventory = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', product.id)
        .single();

      setInventory(data);
    };

    loadInventory();
  }, [product]);

  // Real-time listener for inventory changes
  useEffect(() => {
    if (!product) return;

    const subscription = supabase
      .channel(`inventory:product_id=eq.${product.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `product_id=eq.${product.id}`,
        },
        (payload) => {
          setInventory(payload.new);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [product]);

  if (!product) return null;

  const toggleVisibility = async () => {
    if (!canModifyProducts) {
      alert('Only SUPERADMIN can toggle product visibility.');
      return;
    }

    if (product.flag_delete) {
      alert('Recover this product before changing visibility.');
      return;
    }

    const updatedState = !product.isActive;

    const { data } = await supabase
      .from('products')
      .update({ isActive: updatedState })
      .eq('id', product.id)
      .select();

    if (data) {
      setProduct((prev) => ({ ...prev, isActive: updatedState }));
      alert('Product visibility updated');
    }
  };

  const handleSaveInventory = async () => {
    if (!canModifyProducts) {
      alert('Only SUPERADMIN can change product inventory.');
      return;
    }

    if (product.flag_delete) {
      alert('Recover this product before changing inventory.');
      return;
    }

    const updatedInventory = {
      aura: {
        available: parseInt(newInventory.aura?.available, 10) || 0,
        sold: parseInt(newInventory.aura?.sold, 10) || 0,
      },
      makati: {
        available: parseInt(newInventory.makati?.available, 10) || 0,
        sold: parseInt(newInventory.makati?.sold, 10) || 0,
      },
      sta_mesa: {
        available: parseInt(newInventory.sta_mesa?.available, 10) || 0,
        sold: parseInt(newInventory.sta_mesa?.sold, 10) || 0,
      },
    };

    const { data, error } = await supabase
      .from('inventory')
      .update(updatedInventory)
      .eq('product_id', product.id)
      .select();

    if (data) {
      alert('Inventory updated successfully');
      setShowInventoryDialog(false);
    } else {
      alert(`Error updating inventory: ${error.message}`);
    }
  };

  const branches = [
    { name: 'Aura', key: 'aura' },
    { name: 'Makati', key: 'makati' },
    { name: 'Sta Mesa', key: 'sta_mesa' },
  ];

  const deleteProduct = async () => {
    if (!canManageDeletedProducts) {
      alert('Only ITADMIN can delete products.');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ flag_delete: true })
      .eq('id', product.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Product deleted successfully.');
    closeDetails();
  };

  const recoverProduct = async () => {
    if (!canManageDeletedProducts) {
      alert('Only ITADMIN can recover deleted products.');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ flag_delete: false })
      .eq('id', product.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Product recovered successfully.');
    closeDetails();
  };

  return (
    <>
      <Head>
        <title>Product Details | Admin | SM Market</title>
      </Head>
      <Stack>
        {/* ACTIONS */}
        <Flex p={4} bg='#fff' rounded='md' gap={2}>
          <Button
            display={canModifyProducts ? 'flex' : 'none'}
            disabled={product.flag_delete}
            size='xs'
            colorPalette='blue'
            onClick={toggleVisibility}
          >
            <LuEye />
            Toggle Visibility
          </Button>

          <Button
            display={canModifyProducts ? 'flex' : 'none'}
            disabled={product.flag_delete}
            size='xs'
            variant='outline'
            onClick={() => setShowInventoryDialog(true)}
          >
            <LuBoxes />
            Inventory
          </Button>
          <Button
            display={canModifyProducts ? 'flex' : 'none'}
            disabled={product.flag_delete}
            size='xs'
            variant='outline'
            onClick={() => router.push(`/admin/products/edit/${product.id}`)}
          >
            <LuPen />
            Edit
          </Button>
          {product.flag_delete ? (
            <Button
              display={canManageDeletedProducts ? 'flex' : 'none'}
              colorPalette='green'
              size='xs'
              variant='outline'
              onClick={recoverProduct}
            >
              <LuRefreshCcw />
              Recover
            </Button>
          ) : (
            <Button
              display={canManageDeletedProducts ? 'flex' : 'none'}
              colorPalette='red'
              size='xs'
              variant='outline'
              onClick={deleteProduct}
            >
              <LuTrash />
              Delete
            </Button>
          )}
        </Flex>

        {/* PRODUCT CARD */}
        <Card.Root>
          <Card.Header p={2}>
            <HStack alignItems='center' justifyContent='space-between'>
              <Card.Title>
                {product.title}{' '}
                <Badge colorPalette={product.isActive ? 'green' : 'yellow'}>
                  {product.isActive ? 'Active' : 'Archived'}
                </Badge>
                {product.flag_delete ? (
                  <Badge ml={2} colorPalette='red'>
                    Deleted
                  </Badge>
                ) : null}
              </Card.Title>
              <CloseButton
                onClick={() => {
                  setProduct(null);
                  closeDetails();
                }}
              />
            </HStack>
          </Card.Header>

          <Separator />

          <Card.Body p={0}>
            <Stack gap={4} p={0} overflowY='auto' height='70dvh'>
              {/* INVENTORY TABLE */}
              <Stack>
                <Table.Root interactive striped size='sm'>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Branch</Table.ColumnHeader>
                      <Table.ColumnHeader>Available</Table.ColumnHeader>
                      <Table.ColumnHeader>Sold</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {inventory &&
                      branches.map((b) => (
                        <Table.Row key={b.key}>
                          <Table.Cell>{b.name}</Table.Cell>
                          <Table.Cell>
                            {inventory[b.key]?.available || 0}
                          </Table.Cell>
                          <Table.Cell>{inventory[b.key]?.sold || 0}</Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
              </Stack>

              {/* DETAILS */}
              <Stack gap={4} px={4}>
                <Heading size='md'>Details</Heading>

                <Field.Root>
                  <Field.Label>Name</Field.Label>
                  <Input value={product.title} readOnly />
                </Field.Root>

                <HStack gap={4}>
                  <Field.Root>
                    <Field.Label>Price</Field.Label>
                    <Input value={product.price} readOnly />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Compare At</Field.Label>
                    <Input value={product.compare_at_price} readOnly />
                  </Field.Root>
                </HStack>

                <HStack gap={4}>
                  <Field.Root>
                    <Field.Label>Category</Field.Label>
                    <Input value={product.category} readOnly />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Subcategory</Field.Label>
                    <Input value={product.subcategory} readOnly />
                  </Field.Root>
                </HStack>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea value={product.description} readOnly />
                </Field.Root>

                {/* MEDIA */}
                <Heading size='md'>Media</Heading>
                <SimpleGrid columns={3} gap={4}>
                  {product.images?.map((image) => (
                    <Image
                      key={image}
                      borderRadius={4}
                      height='200px'
                      w='full'
                      objectFit='contain'
                      border='1px solid lightgray'
                      src={image}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* INVENTORY DIALOG */}
        <Dialog.Root
          open={showInventoryDialog}
          onOpenChange={(e) => setShowInventoryDialog(e.open)}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header p={4}>
                  <Dialog.Title>Manage Inventory</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body p={0}>
                  <ManageInventory
                    update={setNewInventory}
                    product_id={product.id}
                  />
                </Dialog.Body>

                <Dialog.Footer p={4}>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setShowInventoryDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    colorPalette='blue'
                    disabled={!canModifyProducts || product.flag_delete}
                    onClick={handleSaveInventory}
                  >
                    Save
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Stack>
    </>
  );
}
