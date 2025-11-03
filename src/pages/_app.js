import Layout from '@/components/layout';
import { Provider } from '@/components/ui/provider';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/globals.css';
import { Theme } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from './admin/layout';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <Provider>
        <Theme appearance='light'>
          {
            isAdminRoute ?
              <AdminLayout>
                <Component {...pageProps} />
              </AdminLayout>
              :
              <Layout>
                <Component {...pageProps} />
              </Layout>
          }
        </Theme>
      </Provider>
    </AuthProvider>
  );
}
