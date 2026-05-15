import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('auth_admin')) {
      router.replace('/admin/products');
    } else {
      router.replace('/admin/signin');
    }
  }, [router]);

  return (
    <Head>
      <title>Dashboard | Admin | SM Market</title>
    </Head>
  );
}
