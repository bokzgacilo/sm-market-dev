import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SearchIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // redirect to home
  }, [router]);

  return null;
}
