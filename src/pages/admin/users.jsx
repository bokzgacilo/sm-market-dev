import {
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  Field,
  Heading,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Pagination,
  Portal,
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
  LuMail,
  LuPlus,
  LuRefreshCcw,
  LuTrash,
} from 'react-icons/lu';
import { supabase } from '@/helper/supabase';
import { useAdmin } from './layout';

const initialForm = {
  last_name: '',
  first_name: '',
  email: '',
  phone: '',
  role: 'ITADMIN',
};

export default function Users() {
  const { userRole } = useAdmin();
  const canManageAccounts = userRole === 'ITADMIN';
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [recoveringUser, setRecoveringUser] = useState(false);
  const [userView, setUserView] = useState('active');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const usersPerPage = 10;
  const start = (page - 1) * usersPerPage;
  const end = start + usersPerPage - 1;

  const fetchAllUsers = useCallback(async () => {
    const isDeletedView = userView === 'deleted';
    let query = supabase
      .from('system_users')
      .select(
        'id, last_name, first_name, email, phone, username, status, role, created_at, flag_delete',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(start, end);

    query = isDeletedView
      ? query.eq('flag_delete', true)
      : query.or('flag_delete.is.null,flag_delete.eq.false');

    const { data, count } = await query;

    setUsers(data || []);
    setTotalCount(count || 0);
  }, [end, start, userView]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSelectedUser = (field, value) => {
    setSelectedUser((currentUser) => ({
      ...currentUser,
      [field]: value,
    }));
  };

  const fetchUser = async (userId) => {
    setUserDialogOpen(true);
    setSelectedUser(null);
    setLoadingUser(true);

    const { data, error } = await supabase
      .from('system_users')
      .select(
        'id, first_name, last_name, email, phone, role, status, created_at, flag_delete',
      )
      .eq('id', userId)
      .single();

    setLoadingUser(false);

    if (error) {
      alert(error.message);
      setUserDialogOpen(false);
      return;
    }

    setSelectedUser(data);
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can edit user accounts.');
      return;
    }

    setSavingUser(true);

    const { data, error } = await supabase
      .from('system_users')
      .update({
        phone: selectedUser.phone,
        role: selectedUser.role,
      })
      .eq('id', selectedUser.id)
      .select(
        'id, last_name, first_name, email, phone, username, status, role, created_at, flag_delete',
      )
      .single();

    setSavingUser(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedUser(data);
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === data.id ? data : currentUser,
      ),
    );
    alert('User updated successfully.');
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can delete user accounts.');
      return;
    }

    const shouldDelete = window.confirm(
      'Delete this user? This will move the account to inactive users.',
    );

    if (!shouldDelete) return;

    setDeletingUser(true);

    const { error } = await supabase
      .from('system_users')
      .update({ flag_delete: true, status: 'INACTIVE' })
      .eq('id', selectedUser.id);

    setDeletingUser(false);

    if (error) {
      alert(error.message);
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => currentUser.id !== selectedUser.id),
    );
    setSelectedUser(null);
    setUserDialogOpen(false);
    alert('User deleted successfully.');
  };

  const recoverUser = async () => {
    if (!selectedUser) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can recover user accounts.');
      return;
    }

    setRecoveringUser(true);

    const { error } = await supabase
      .from('system_users')
      .update({ flag_delete: false, status: 'ACTIVE' })
      .eq('id', selectedUser.id);

    setRecoveringUser(false);

    if (error) {
      alert(error.message);
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => currentUser.id !== selectedUser.id),
    );
    setSelectedUser(null);
    setUserDialogOpen(false);
    alert('User account recovered successfully.');
  };

  const resetPassword = async () => {
    if (!selectedUser?.email) return;
    if (!canManageAccounts) {
      alert('Only ITADMIN can reset passwords.');
      return;
    }

    setResettingPassword(true);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin/reset-password`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      selectedUser.email,
      redirectTo ? { redirectTo } : undefined,
    );

    setResettingPassword(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Password reset email sent successfully.');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Failed to create user');
        return;
      }

      setForm(initialForm);
      setOpen(false);
      await fetchAllUsers();
      alert('User created successfully!');
    } catch (_error) {
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Users | Admin | SM Market</title>
      </Head>
      <Dialog.Root
        open={userDialogOpen}
        onOpenChange={(e) => {
          setUserDialogOpen(e.open);
          if (!e.open) setSelectedUser(null);
        }}
        size='lg'
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>User Details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {loadingUser ? (
                  <Stack alignItems='center' py={10}>
                    <Spinner />
                    <Text>Loading user...</Text>
                  </Stack>
                ) : selectedUser ? (
                  <Stack gap={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root>
                        <Field.Label>First Name</Field.Label>
                        <Input value={selectedUser.first_name || ''} readOnly />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Last Name</Field.Label>
                        <Input value={selectedUser.last_name || ''} readOnly />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input value={selectedUser.email || ''} readOnly />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Phone</Field.Label>
                        <Input
                          type='tel'
                          value={selectedUser.phone || ''}
                          disabled={!canManageAccounts}
                          onChange={(e) =>
                            updateSelectedUser('phone', e.currentTarget.value)
                          }
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>User Role</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={selectedUser.role || 'ITADMIN'}
                            disabled={!canManageAccounts}
                            onChange={(e) =>
                              updateSelectedUser('role', e.currentTarget.value)
                            }
                          >
                            <option value='ITADMIN'>ITADMIN</option>
                            <option value='SUPERADMIN'>SUPERADMIN</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Status</Field.Label>
                        <Input value={selectedUser.status || ''} readOnly />
                      </Field.Root>
                    </SimpleGrid>
                  </Stack>
                ) : null}
              </Dialog.Body>
              <Dialog.Footer justifyContent='space-between'>
                {selectedUser?.flag_delete ? (
                  <Button
                    colorPalette='green'
                    loading={recoveringUser}
                    disabled={
                      !selectedUser || loadingUser || !canManageAccounts
                    }
                    onClick={recoverUser}
                  >
                    <LuRefreshCcw />
                    Recover Account
                  </Button>
                ) : (
                  <>
                    <HStack>
                      <Button
                        variant='outline'
                        loading={resettingPassword}
                        disabled={
                          !selectedUser || loadingUser || !canManageAccounts
                        }
                        onClick={resetPassword}
                      >
                        <LuKeyRound />
                        Reset Password
                      </Button>
                      <Button
                        colorPalette='red'
                        variant='outline'
                        loading={deletingUser}
                        disabled={
                          !selectedUser || loadingUser || !canManageAccounts
                        }
                        onClick={deleteUser}
                      >
                        <LuTrash />
                        Delete User
                      </Button>
                    </HStack>
                    <Button
                      colorPalette='blue'
                      loading={savingUser}
                      disabled={
                        !selectedUser || loadingUser || !canManageAccounts
                      }
                      onClick={saveUser}
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
        <Dialog.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          size='lg'
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <form onSubmit={handleCreateUser}>
                  <Dialog.Header>
                    <Dialog.Title>Create User</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Field.Root required>
                          <Field.Label>Last Name</Field.Label>
                          <Input
                            value={form.last_name}
                            onChange={(e) =>
                              updateForm('last_name', e.target.value)
                            }
                          />
                        </Field.Root>
                        <Field.Root required>
                          <Field.Label>First Name</Field.Label>
                          <Input
                            value={form.first_name}
                            onChange={(e) =>
                              updateForm('first_name', e.target.value)
                            }
                          />
                        </Field.Root>
                      </SimpleGrid>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Field.Root required>
                          <Field.Label>Email</Field.Label>
                          <Input
                            type='email'
                            value={form.email}
                            onChange={(e) =>
                              updateForm('email', e.target.value)
                            }
                          />
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>Phone</Field.Label>
                          <Input
                            type='tel'
                            value={form.phone}
                            onChange={(e) =>
                              updateForm('phone', e.target.value)
                            }
                          />
                        </Field.Root>
                      </SimpleGrid>
                      <Field.Root required>
                        <Field.Label>User Role</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={form.role}
                            onChange={(e) =>
                              updateForm('role', e.currentTarget.value)
                            }
                          >
                            <option value='ITADMIN'>ITADMIN</option>
                            <option value='SUPERADMIN'>SUPERADMIN</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                      {/* <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Field.Root required>
                          <Field.Label>Username</Field.Label>
                          <Input
                            value={form.username}
                            onChange={(e) =>
                              updateForm('username', e.target.value)
                            }
                          />
                        </Field.Root>
                        <Field.Root required>
                          <Field.Label>Password</Field.Label>
                          <Input
                            type='password'
                            value={form.password}
                            onChange={(e) =>
                              updateForm('password', e.target.value)
                            }
                          />
                        </Field.Root>
                      </SimpleGrid> */}
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='submit' loading={loading}>
                      Add User <LuMail />
                    </Button>
                  </Dialog.Footer>
                </form>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size='sm' />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
        <Card.Root>
          <HStack p={4} alignItems='center' justifyContent='space-between'>
            <Heading>System Users</Heading>
            <Button
              display={canManageAccounts ? 'flex' : 'none'}
              size='xs' onClick={() => setOpen(true)}>
              <LuPlus />
              Add User
            </Button>
          </HStack>
          <Card.Body p={0}>
            <Tabs.Root
              value={userView}
              onValueChange={(e) => {
                setUserView(e.value);
                setPage(1);
              }}
              px={4}
              pb={4}
            >
              <Tabs.List>
                <Tabs.Trigger value='active'>Active Users</Tabs.Trigger>
                <Tabs.Trigger value='deleted'>
                  Deactivated / Deleted Users
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            <Table.Root interactive striped size='sm'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>Phone</Table.ColumnHeader>
                  <Table.ColumnHeader>Role</Table.ColumnHeader>
                  <Table.ColumnHeader>Created At</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} textAlign='center'>
                      No {userView === 'deleted' ? 'inactive' : 'active'} users
                      found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  users.map((user) => (
                    <Table.Row
                      cursor='pointer'
                      key={user.id}
                      onClick={() => fetchUser(user.id)}
                    >
                      <Table.Cell>
                        {user.first_name} {user.last_name}
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{user.phone}</Table.Cell>
                      <Table.Cell>{user.role}</Table.Cell>
                      <Table.Cell>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleString()
                          : ''}
                      </Table.Cell>
                      <Table.Cell>{user.status}</Table.Cell>
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
              pageSize={usersPerPage}
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
