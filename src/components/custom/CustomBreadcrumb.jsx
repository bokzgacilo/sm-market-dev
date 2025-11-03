import { Breadcrumb, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import formatTitle from '@/helper/slug';

export default function CustomBreadcrumb({ data = {}, ...props }) {
  return (
    <Breadcrumb.Root {...props}>
        <Breadcrumb.List>
          <Flex direction="row" flexWrap="nowrap" alignItems="center" overflowX="auto" gap={2}>
          <Breadcrumb.Item as={Link} href='/'>
            <Text textWrap="nowrap">{formatTitle(data.root || 'Home')}</Text>
          </Breadcrumb.Item>

          {data.first && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item as={Link} href={`/${data.first}`}>
                <Text textWrap="nowrap">
                {formatTitle(data.first)}
                </Text>
              </Breadcrumb.Item>
            </>
          )}
          {data.second && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item as={Link} href={`/${data.first}/${data.second}`}>
                <Text textWrap="nowrap">
                { formatTitle(data.second)}
                </Text>
              </Breadcrumb.Item>
            </>
          )}
          {data.third && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item as={Link} href={`/${data.first}/${data.second}/${data.third}`}>
                  <Text textWrap="nowrap">
                    {formatTitle(data.third)}
                  </Text>
              </Breadcrumb.Item>
            </>
          )}
          </Flex>
        </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
