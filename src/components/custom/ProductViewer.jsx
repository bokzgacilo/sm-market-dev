'use client';
import {
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  IconButton,
  Popover,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import {
  LuCircleHelp,
  LuHand,
  LuMousePointerClick,
  LuMove3D,
  LuZoomIn,
} from 'react-icons/lu';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export default function ProductViewer({ modelUrl }) {
  return (
    <Box
      position='relative'
      height={{ base: '250px', lg: '500px' }}
      bg='gray.300'
      rounded={{ base: 0, lg: 'md' }}
      overflow='hidden'
    >
      <Box position='absolute' top={3} right={3} zIndex={2}>
        <Popover.Root positioning={{ placement: 'bottom-end' }}>
          <Popover.Trigger asChild>
            <IconButton
              aria-label='Show 3D viewer controls'
              size='sm'
              rounded='full'
              variant='solid'
              colorPalette='blue'
              boxShadow='sm'
            >
              <LuCircleHelp />
            </IconButton>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content maxW='320px'>
                <Popover.Arrow>
                  <Popover.ArrowTip />
                </Popover.Arrow>

                <Popover.Body>
                  <Stack gap={4}>
                    <HStack align='start' gap={3}>
                      <Flex
                        align='center'
                        justify='center'
                        boxSize={9}
                        rounded='full'
                        bg='blue.50'
                        color='blue.600'
                        flexShrink={0}
                      >
                        <Icon as={LuMove3D} boxSize={4} />
                      </Flex>
                      <Box>
                        <Text fontWeight='medium'>Rotate product</Text>
                        <Text fontSize='sm' color='fg.muted'>
                          <Icon as={LuMousePointerClick} boxSize={3.5} mr={1} />
                          Click and drag
                        </Text>
                        <Text fontSize='sm' color='fg.muted'>
                          <Icon as={LuHand} boxSize={3.5} mr={1} />
                          Touch and drag
                        </Text>
                      </Box>
                    </HStack>

                    <HStack align='start' gap={3}>
                      <Flex
                        align='center'
                        justify='center'
                        boxSize={9}
                        rounded='full'
                        bg='blue.50'
                        color='blue.600'
                        flexShrink={0}
                      >
                        <Icon as={LuZoomIn} boxSize={4} />
                      </Flex>
                      <Box>
                        <Text fontWeight='medium'>Zoom in and out</Text>
                        <Text fontSize='sm' color='fg.muted'>
                          Scroll up to zoom in, scroll down to zoom out
                        </Text>
                        <Text fontSize='sm' color='fg.muted'>
                          Pinch in to zoom in, pinch out to zoom out
                        </Text>
                      </Box>
                    </HStack>
                  </Stack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Box>

      {modelUrl ? (
        <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
          <ambientLight intensity={0} />
          <directionalLight position={[10, 10, 50]} />
          <Suspense fallback={null}>
            <Model url={modelUrl} />
            <Environment preset='city' />
          </Suspense>
          <OrbitControls
            autoRotate={false}
            enablePan={false}
            enableZoom={true}
          />
        </Canvas>
      ) : (
        <Box p={4}>
          <Text>No model loaded.</Text>
        </Box>
      )}
    </Box>
  );
}
