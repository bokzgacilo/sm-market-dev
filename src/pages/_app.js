import Layout from '@/components/layout';
import { Provider } from '@/components/ui/provider';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/globals.css';
import { Theme } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from './admin/layout';
import { useEffect, useState } from 'react';
import { CartProvider } from '@/context/CartContext';

export default function App({ Component, pageProps }) {
  const noAdminLayout = ["/admin/signin"];
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin/');
  const useLayout = isAdminRoute && !noAdminLayout.includes(router.pathname);
  const [authId, setAuthId] = useState(null)

  useEffect(() => {
    if (localStorage.getItem("auth_id")) {
      setAuthId(localStorage.getItem("auth_id"))
    }
  }, [])

  return (
    <Provider>
      <Theme appearance="light">
        {isAdminRoute ? (
          useLayout ? (
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          ) : (
            <Component {...pageProps} />
          )
        ) : (
          <CartProvider>
            <Layout auth={authId}>
              <Component auth={authId} {...pageProps} />
            </Layout>
          </CartProvider>
        )}
      </Theme>
    </Provider>
  );
}
