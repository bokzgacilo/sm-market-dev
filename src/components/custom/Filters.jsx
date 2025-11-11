import { Flex, HStack, Button, IconButton, Separator, NativeSelect } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiFilter } from "react-icons/fi";

export default function Filters({router}) {
  const { query, pathname } = router;
  const currentType = query.type || "all";

  const handleClick = (type) => {
    router.push({
      pathname,
      query: { ...query, type: type }, // always include type, even "all"
    }, undefined, { shallow: true });
  };

  const handleChange = (e) => {
    const sortBy = e.target.value;
    router.push(
      {
        pathname,
        query: { ...query, sortBy },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <HStack>
      <Flex direction='row' gap={2}>
        <Button
          variant={currentType === "all" ? "solid" : "outline"}
          size="sm"
          rounded="full"
          colorPalette="blue"
          onClick={() => handleClick("all")}
        >
          All
        </Button>
        <Button
          variant={currentType === "new" ? "solid" : "outline"}
          size="sm"
          rounded="full"
          colorPalette="blue"
          onClick={() => handleClick("new")}
        >
          New
        </Button>
        <Button
          variant={currentType === "sale" ? "solid" : "outline"}
          size="sm"
          rounded="full"
          colorPalette="blue"
          onClick={() => handleClick("sale")}
        >
          Sale
        </Button>
      </Flex>
      <Flex gap={4} ml='auto' w='250px'>
        {/* <IconButton rounded='full' variant='outline'>
          <FiFilter />
        </IconButton> */}
        <Separator orientation='vertical' />
        <NativeSelect.Root variant='subtle'>
          <NativeSelect.Field value={query.sortBy || ""} onChange={handleChange}>
            <option value="price_asc">Prices: Low to High</option>
            <option value="price_desc">Prices: High to Low</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Flex>
    </HStack>
  )
}