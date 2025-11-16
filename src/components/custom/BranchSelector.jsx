'use client';

import { Box, Button, Card, CloseButton, Dialog, Flex, Heading, Icon, Portal, Stack, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { LuMapPin } from 'react-icons/lu';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false },
);

let L;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet.default;

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });
  });
}

const branches = [
  {
    name: 'SM Aura Premier',
    city: 'Metro Manila, Taguig, PH',
    code: "aura",
    coords: [14.5523, 121.048],
  },
  {
    name: 'SM Makati',
    city: 'Metro Manila, Makati, PH',
    code: "makati",
    coords: [14.5535, 121.0244],
  },
  {
    name: 'SM Sta. Mesa',
    city: 'Metro Manila, Manila, PH',
    code: "sta_mesa",
    coords: [14.6026, 121.0178],
  },
];

export default function BranchSelector() {
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches[1]);

  useEffect(() => {
    const saved = localStorage.getItem('branch_location');
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = branches.find((b) => b.name === parsed.branch_name);
      if (found) setSelectedBranch(found);
    }
  }, []);
  
  return (
    <Dialog.Root
      size='xl'
      open={mapOpen}
      onOpenChange={(e) => setMapOpen(e.open)}
    >
      <Dialog.Trigger asChild>
        <Flex
          ml='auto'
          order={{ base: 2, md: 2 }}
          alignItems='center'
          gap={2}
          color='#fff'
          cursor='pointer'
        >
          <Icon as={LuMapPin} size='xl' color='#fff' />
          <Stack gap={0} display={{ base: 'none', md: 'block' }}>
            <Text fontSize='14px' fontWeight='bold'>
              {selectedBranch.name}
            </Text>
            <Text fontSize='10px'>{selectedBranch.city}</Text>
          </Stack>
        </Flex>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Select Branch</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Flex direction={{ base: 'column', md: 'row' }} gap={4} w="100%" h="100%">
                <Stack w={{ base: '100%', md: '40%' }} gap={3}>
                  {branches.map((branch) => (
                    <Card.Root
                      key={branch.name}
                      variant={selectedBranch.name === branch.name ? 'solid' : 'outline'}
                      colorPalette="blue"
                      cursor="pointer"
                      transition="0.2s"
                      onClick={() => {
                        setSelectedBranch(branch);
                        const branchData = {
                          branch_name: branch.name,
                          branch_address: branch.city,
                          branch_code: branch.code
                        };
                        localStorage.setItem(
                          'branch_location',
                          JSON.stringify(branchData),
                        );
                      }}
                    >
                      <Card.Body p={{base: 2, lg: 4}}>
                        <Heading size="md">{branch.name}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {branch.city}
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Stack>

                <Box w={{ base: 'full', md: '60%' }} h={{base: "200px", lg: "400px"}}>
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      key={selectedBranch.name}
                      center={selectedBranch.coords}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      />

                      <Marker position={selectedBranch.coords}>
                        <Popup>
                          <b>{selectedBranch.name}</b>
                          <br />
                          {selectedBranch.city}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </Box>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                size='xl'
                rounded="full"
                colorPalette='blue'
                onClick={() => {
                  setMapOpen(false);
                }}
              >
                Select Branch
              </Button>
            </Dialog.Footer>
            
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
