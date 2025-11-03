import {
  Flex,
  Heading,
  Icon,
  Image,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GoChevronRight } from 'react-icons/go';
import { supabase } from '@/helper/supabase';

export default function SideNavigation({closeNav, ...props}) {
  const [categoriesArray, setCategoriesArray] = useState([]);

  useEffect(() => {
    const getAllCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug');

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        const formatted = data.map((cat) => ({
          icon: `/images/nav-icons/${cat.slug}.webp`,
          label: cat.name,
          path: cat.slug,
        }));

        setCategoriesArray(formatted);
      }
    };

    getAllCategories();
  }, []);

  return (
    <Stack p={4} backgroundColor='#fff' {...props}>
      <Heading mt={{ base: 0, md: 8 }} color='#0030FF'>
        Browse Products
      </Heading>
      <Separator my={4} />
      <Heading mb={4} size='sm'>
        Shop by Category
      </Heading>
      <Stack gap={4} overflowY='auto' flex={1}>
        {categoriesArray.map((item) => (
          <Link key={item.label} href={`/${item.path}`} onClick={closeNav}>
            <Flex alignItems='center' px={4} cursor='pointer'>
              <Image
                mr={6}
                alt={item.label}
                width='40px'
                height='40px'
                src={item.icon}
              />
              <Text
                maxW='130px'
                textAlign='left'
                fontSize='14px'
                fontWeight='semibold'
                mr='auto'
              >
                {item.label}
              </Text>
              <Icon size='md' color='#0030FF'>
                <GoChevronRight />
              </Icon>
            </Flex>
          </Link>
        ))}
      </Stack>
    </Stack>
  );
}
