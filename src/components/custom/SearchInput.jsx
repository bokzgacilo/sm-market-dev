import { Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function SearchInput() {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (router.isReady) {
      setQuery(q || ""); // if ?q exists, use it; otherwise blank
    }
  }, [router.isReady, q]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, q: query || undefined },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  return (
    <Input
      size="xl"
      backgroundColor="#fff"
      type="search"
      placeholder="Search for items here..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleSearch}
    />
  );
}