import {
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  Field,
  IconButton,
  Input,
  NativeSelect,
  Pagination,
  Portal,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tabs,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuKeyRound,
  LuRefreshCcw,
  LuTrash,
} from 'react-icons/lu';
import { supabase } from '@/helper/supabase';
import { useAdmin } from './layout';

const emptyAddress = {
  address_line: '',
  barangay: '',
  city: '',
  province: '',
};

export default function Customers() {
  const { userRole } = useAdmin();
  const canManageAccounts = userRole === 'ITADMIN';
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [open, setOpen] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);
  const [recoveringCustomer, setRecoveringCustomer] = useState(false);
  const [customerView, setCustomerView] = useState('active');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const customersPerPage = 10;
  const start = (page - 1) * customersPerPage;
  const end = start + customersPerPage - 1;

  const fetchAllCustomers = useCallback(async () => {
    const isDeletedView = customerView === 'deleted';
    let query = supabase
      .from('users')
      .select(
        'id, last_name, first_name, email, dob, phone, gender, flag_delete',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(start, end);

    query = isDeletedView
      ? query.eq('flag_delete', true)
      : query.or('flag_delete.is.null,flag_delete.eq.false');

    const { data, count } = await query;
    setCustomers(data || []);
    setTotalCount(count || 0);
  }, [customerView, end, start]);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  const fetchCustomer = async (customerId) => {
    setOpen(true);
    setCustomer(null);
    setLoadingCustomer(true);

    const { data, error } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, shipping_address, gender, email, phone, dob, created_at, updated_at, flag_delete',
      )
      .eq('id', customerId)
      .single();

    if (error) {
      alert(error.message);
      setOpen(false);
    } else {
      setCustomer({
        ...data,
        shipping_address: {
          ...emptyAddress,
          ...(data.shipping_address || {}),
        },
      });
    }

    setLoadingCustomer(false);
  };

  const updateCustomerField = (field, value) => {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
    }));
  };

  const updateAddressField = (field, value) => {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      shipping_address: {
        ...currentCustomer.shipping_address,
        [field]: value,
      },
    }));
  };

  const saveCustomer = async () => {
    if (!customer) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can edit customer accounts.');
      return;
    }

    setSavingCustomer(true);

    const { error } = await supabase
      .from('users')
      .update({
        first_name: customer.first_name,
        last_name: customer.last_name,
        shipping_address: customer.shipping_address,
        gender: customer.gender,
        phone: customer.phone,
        dob: customer.dob,
      })
      .eq('id', customer.id);

    setSavingCustomer(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers((currentCustomers) =>
      currentCustomers.map((currentCustomer) =>
        currentCustomer.id === customer.id
          ? {
              ...currentCustomer,
              first_name: customer.first_name,
              last_name: customer.last_name,
              gender: customer.gender,
              phone: customer.phone,
              dob: customer.dob,
            }
          : currentCustomer,
      ),
    );
    alert('Customer updated successfully.');
  };

  const resetPassword = async () => {
    if (!customer?.email) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can reset passwords.');
      return;
    }

    setResettingPassword(true);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      customer.email,
      redirectTo ? { redirectTo } : undefined,
    );

    setResettingPassword(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Password reset email sent successfully.');
  };

  const deleteCustomer = async () => {
    if (!customer) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can delete customer accounts.');
      return;
    }

    const shouldDelete = window.confirm(
      'Delete this customer? This will move the account to deleted users.',
    );

    if (!shouldDelete) return;

    setDeletingCustomer(true);

    const { error } = await supabase
      .from('users')
      .update({ flag_delete: true })
      .eq('id', customer.id);

    setDeletingCustomer(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers((currentCustomers) =>
      currentCustomers.filter(
        (currentCustomer) => currentCustomer.id !== customer.id,
      ),
    );
    setCustomer(null);
    setOpen(false);
    alert('Customer deleted successfully.');
  };

  const recoverCustomer = async () => {
    if (!customer) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can recover customer accounts.');
      return;
    }

    setRecoveringCustomer(true);

    const { error } = await supabase
      .from('users')
      .update({ flag_delete: false })
      .eq('id', customer.id);

    setRecoveringCustomer(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers((currentCustomers) =>
      currentCustomers.filter(
        (currentCustomer) => currentCustomer.id !== customer.id,
      ),
    );
    setCustomer(null);
    setOpen(false);
    alert('Customer account recovered successfully.');
  };

  const formatDateTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head>
        <title>Customers | Admin | SM Market</title>
      </Head>
      <Dialog.Root size='xl' open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Customer Details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {loadingCustomer ? (
                  <Stack alignItems='center' py={10}>
                    <Spinner />
                    <Text>Loading customer...</Text>
                  </Stack>
                ) : customer ? (
                  <Stack gap={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root>
                        <Field.Label>First Name</Field.Label>
                        <Input
                          value={customer.first_name || ''}
                          disabled={!canManageAccounts}
                          onChange={(e) =>
                            updateCustomerField(
                              'first_name',
                              e.currentTarget.value,
                            )
                          }
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Last Name</Field.Label>
                        <Input
                          value={customer.last_name || ''}
                          disabled={!canManageAccounts}
                          onChange={(e) =>
                            updateCustomerField(
                              'last_name',
                              e.currentTarget.value,
                            )
                          }
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input value={customer.email || ''} readOnly />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Phone</Field.Label>
                        <Input
                          value={customer.phone || ''}
                          disabled={!canManageAccounts}
                          onChange={(e) =>
                            updateCustomerField('phone', e.currentTarget.value)
                          }
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Gender</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={customer.gender || ''}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateCustomerField(
                                'gender',
                                e.currentTarget.value,
                              )
                            }
                          >
                            <option value=''>Select gender</option>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                            <option value='other'>Other</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Date of Birth</Field.Label>
                        <Input
                          type='date'
                          value={customer.dob || ''}
                          disabled={!canManageAccounts}
                          onChange={(e) =>
                            updateCustomerField('dob', e.currentTarget.value)
                          }
                        />
                      </Field.Root>
                    </SimpleGrid>

                    <Separator />

                    <Stack gap={4}>
                      <Text fontWeight='medium'>Shipping Address</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Field.Root>
                          <Field.Label>Street/Building/Unit/Room</Field.Label>
                          <Input
                            value={customer.shipping_address.address_line || ''}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateAddressField(
                                'address_line',
                                e.currentTarget.value,
                              )
                            }
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Barangay</Field.Label>
                          <Input
                            value={customer.shipping_address.barangay || ''}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateAddressField(
                                'barangay',
                                e.currentTarget.value,
                              )
                            }
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>City</Field.Label>
                          <Input
                            value={customer.shipping_address.city || ''}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateAddressField('city', e.currentTarget.value)
                            }
                          />
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Province</Field.Label>
                          <Input
                            value={customer.shipping_address.province || ''}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateAddressField(
                                'province',
                                e.currentTarget.value,
                              )
                            }
                          />
                        </Field.Root>
                      </SimpleGrid>
                    </Stack>

                    <Separator />

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root>
                        <Field.Label>Created At</Field.Label>
                        <Input
                          value={formatDateTime(customer.created_at)}
                          readOnly
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Updated At</Field.Label>
                        <Input
                          value={formatDateTime(customer.updated_at)}
                          readOnly
                        />
                      </Field.Root>
                    </SimpleGrid>
                  </Stack>
                ) : null}
              </Dialog.Body>
              <Dialog.Footer justifyContent='space-between'>
                {customer?.flag_delete ? (
                  <Button
                    colorPalette='green'
                    loading={recoveringCustomer}
                    disabled={
                      !customer || loadingCustomer || !canManageAccounts
                    }
                    onClick={recoverCustomer}
                  >
                    <LuRefreshCcw />
                    Reactivate Customer
                  </Button>
                ) : (
                  <>
                    <Stack direction='row'>
                      <Button
                        variant='outline'
                        loading={resettingPassword}
                        disabled={
                          !customer || loadingCustomer || !canManageAccounts
                        }
                        onClick={resetPassword}
                      >
                        <LuKeyRound />
                        Reset Password
                      </Button>
                      <Button
                        colorPalette='red'
                        variant='outline'
                        loading={deletingCustomer}
                        disabled={
                          !customer || loadingCustomer || !canManageAccounts
                        }
                        onClick={deleteCustomer}
                      >
                        <LuTrash />
                        Deactivate Customer
                      </Button>
                    </Stack>
                    <Button
                      colorPalette='blue'
                      loading={savingCustomer}
                      disabled={
                        !customer || loadingCustomer || !canManageAccounts
                      }
                      onClick={saveCustomer}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Stack py={4}>
        <Card.Root>
          <Card.Header p={4}>
            <Card.Title fontSize='xl'>Customers</Card.Title>
          </Card.Header>
          <Card.Body p={0}>
            <Tabs.Root
              value={customerView}
              onValueChange={(e) => {
                setCustomerView(e.value);
                setPage(1);
              }}
              px={4}
              pb={4}
            >
              <Tabs.List>
                <Tabs.Trigger value='active'>Active Customers</Tabs.Trigger>
                <Tabs.Trigger value='deleted'>
                  Deactivated Customers
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            <Table.Root interactive striped size='sm'>
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
                {customers.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign='center'>
                      No {customerView === 'deleted' ? 'deleted' : 'active'}{' '}
                      customers found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  customers.map((customer) => (
                    <Table.Row
                      cursor='pointer'
                      key={customer.id}
                      onClick={() => fetchCustomer(customer.id)}
                    >
                      <Table.Cell>
                        {customer.first_name} {customer.last_name}
                      </Table.Cell>
                      <Table.Cell>{customer.email}</Table.Cell>
                      <Table.Cell>{customer.phone}</Table.Cell>
                      <Table.Cell>{customer.gender}</Table.Cell>
                      <Table.Cell>{customer.dob}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer py={2} px={0}>
            <Pagination.Root
              count={totalCount}
              page={page}
              pageSize={customersPerPage}
              onPageChange={(e) => setPage(e.page)}
            >
              <ButtonGroup variant='ghost' size='sm'>
                <Pagination.PrevTrigger asChild>
                  <IconButton>
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.Items
                  render={(page) => (
                    <IconButton
                      variant={{ base: 'ghost', _selected: 'outline' }}
                    >
                      {page.value}
                    </IconButton>
                  )}
                />
                <Pagination.NextTrigger asChild>
                  <IconButton>
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </Pagination.Root>
          </Card.Footer>
        </Card.Root>
      </Stack>
    </>
  );
}
