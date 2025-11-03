import { Flex, Icon } from "@chakra-ui/react";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

export default function AdminNavLink({ href, icon, label, showChevron = true }) {
  return (
    <Link href={href}>
      <Flex
        align="center"
        direction="row"
        gap={4}
        color="#fff"
        p={4}
        borderRadius="md"
        _hover={{ bg: "whiteAlpha.200" }}
      >
        <Icon>{icon}</Icon>
        {label}
        {showChevron && (
          <Icon ml="auto">
            <LuChevronRight />
          </Icon>
        )}
      </Flex>
    </Link>
  );
}
