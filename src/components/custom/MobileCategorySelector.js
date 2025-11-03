import {
  CloseButton,
  Drawer,
  Icon,
  Portal,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { TfiMenu } from 'react-icons/tfi';
import SideNavigation from './side-navigation';

export default function MobileCategorySelector() {
  const [open, setOpen] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    isMobile && (
      <Drawer.Root size='md' open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Drawer.Trigger asChild>
          <Icon as={TfiMenu} size='xl' cursor='pointer' />
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Body p={0}>
                <SideNavigation />
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    )
  );
}
