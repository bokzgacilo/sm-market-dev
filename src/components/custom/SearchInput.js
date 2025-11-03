import { Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Input
      size='xl'
      backgroundColor='#fff'
      type='search'
      placeholder='Search for items here...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleSearch}
    />
  );
}
