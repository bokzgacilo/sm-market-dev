import { categories } from '@/constants/Categories';
import {
  Accordion,
  Flex,
  Heading,
  Icon,
  Image,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';

export default function SideNavigation({ closeNav, ...props }) {
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
          <Accordion.Root key={item.label} collapsible variant="plain">
            <Accordion.Item>
              <Accordion.ItemTrigger
                pr={4}
                _open={{
                  color: "blue",
                  borderBottom: "1px solid",
                  borderColor: "border"
                }}
              >
                <Flex w="full" alignItems='center' px={4} cursor='pointer'>
                  <Image
                    mr={6}
                    alt={item.label}
                    width='40px'
                    height='40px'
                    src={`/images/nav-icons/${item.path}.webp`}
                  />
                  <Text
                    textAlign='left'
                    fontSize='16px'
                    fontWeight='bold'
                    maxW="140px"
                    mr="auto"
                  >
                    {item.label}
                  </Text>
                </Flex>
                <Accordion.ItemIndicator />

              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Stack gap={0}>
                  {item.subcategories.map((sub) => (
                    <Link
                      key={sub.label} href={`/${item.path}/${sub.path}`}
                      cursor="pointer"
                    >
                      <Flex
                        alignItems="center"
                        p={4}
                        _hover={{
                          textDecoration: "underline",
                          color: "blue"
                        }}
                      >
                        <Text fontWeight="semibold" fontSize="14px">{sub.label}</Text>
                        <Icon
                          ml="auto"
                        >
                          <LuChevronRight />
                        </Icon>
                      </Flex>
                    </Link>

                  ))}
                </Stack>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
          // <Link key={item.label} href={`/${item.path}`} onClick={closeNav}>
          // <Flex alignItems='center' px={4} cursor='pointer'>
          //   <Image
          //     mr={6}
          //     alt={item.label}
          //     width='40px'
          //     height='40px'
          //     src={`/images/nav-icons/${item.path}.webp`}
          //   />
          //   <Text
          //     maxW='130px'
          //     textAlign='left'
          //     fontSize='14px'
          //     fontWeight='semibold'
          //     mr='auto'
          //   >
          //     {item.label}
          //   </Text>
          //   <Icon size='md' color='#0030FF'>
          //     <GoChevronRight />
          //   </Icon>
          // </Flex>
          // </Link>
        ))}
      </Stack>
    </Stack>
  );
}
