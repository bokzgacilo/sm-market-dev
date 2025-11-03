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
import { GoChevronRight } from 'react-icons/go';

const categories = [
  {
    label: "Fresh Produce",
    path: "fresh-produce",
  },
  {
    label: "Frozen Goods",
    path: "frozen-goods",
  },
  {
    label: "Beverage",
    path: "beverage",
  },
  {
    label: "Home and Essentials",
    path: "home-and-essentials",
  },
]


export default function SideNavigation({closeNav, ...props}) {
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
        {categories.map((item) => (
          <Link key={item.label} href={`/${item.path}`} onClick={closeNav}>
            <Flex alignItems='center' px={4} cursor='pointer'>
              <Image
                mr={6}
                alt={item.label}
                width='40px'
                height='40px'
                src={`/images/nav-icons/${item.path}.webp`}
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
