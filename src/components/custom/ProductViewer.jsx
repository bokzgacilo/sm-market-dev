'use client';
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Popover,
  Portal,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useRef } from 'react';
import {
  LuCircleHelp,
  LuHand,
  LuMouse,
  LuMousePointerClick,
  LuMove3D,
  LuZoomIn,
  LuZoomOut,
} from 'react-icons/lu';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

function ControlChip({ children }) {
  return (
    <Flex
      align='center'
      justify='center'
      minW='24px'
      h='24px'
      px={2}
      rounded='md'
      borderWidth='1px'
      borderColor='blue.200'
      bg='white'
      color='blue.700'
      fontSize='xs'
      fontWeight='semibold'
      boxShadow='xs'
      flexShrink={0}
    >
      {children}
    </Flex>
  );
}

function HelpRow({ icon, children, muted = false }) {
  return (
    <HStack align='start' gap={3}>
      <Flex
        align='center'
        justify='center'
        boxSize={8}
        rounded='lg'
        borderWidth='1px'
        borderColor='gray.200'
        color='gray.600'
        bg='white'
        flexShrink={0}
      >
        <Icon as={icon} boxSize={4} />
      </Flex>
      <Text fontSize='sm' color={muted ? 'fg.muted' : 'fg'}>
        {children}
      </Text>
    </HStack>
  );
}

export default function ProductViewer({ modelUrl }) {
  const controlsRef = useRef(null);
  const minDistance = 1.5;
  const maxDistance = 8;

  const handleZoom = useCallback((direction) => {
    const controls = controlsRef.current;

    if (!controls) return;

    const offset = controls.object.position.clone().sub(controls.target);
    const currentDistance = offset.length();
    const nextDistance = Math.min(
      maxDistance,
      Math.max(minDistance, currentDistance + direction * 0.75),
    );

    offset.setLength(nextDistance);
    controls.object.position.copy(controls.target).add(offset);
    controls.update();
  }, []);

  return (
    <Box
      position='relative'
      height={{ base: '250px', lg: '500px' }}
      bg='gray.300'
      rounded={{ base: 0, lg: 'md' }}
      overflow='hidden'
    >
      <VStack position='absolute' bottom={3} right={3} zIndex={2} gap={2}>
        <IconButton
          aria-label='Zoom in on 3D model'
          size='sm'
          rounded='full'
          variant='solid'
          colorPalette='blue'
          boxShadow='sm'
          onClick={() => handleZoom(-1)}
        >
          <LuZoomIn />
        </IconButton>
        <IconButton
          aria-label='Zoom out on 3D model'
          size='sm'
          rounded='full'
          variant='solid'
          colorPalette='blue'
          boxShadow='sm'
          onClick={() => handleZoom(1)}
        >
          <LuZoomOut />
        </IconButton>
      </VStack>

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
              <Popover.Content maxW='420px' rounded='2xl' boxShadow='xl'>
                <Popover.Arrow>
                  <Popover.ArrowTip />
                </Popover.Arrow>

                <Popover.Body>
                  <Stack gap={6}>
                    <HStack align='start' gap={3}>
                      <Flex
                        align='center'
                        justify='center'
                        boxSize={12}
                        rounded='full'
                        bg='blue.50'
                        color='blue.600'
                        flexShrink={0}
                      >
                        <Icon as={LuMove3D} boxSize={5} />
                      </Flex>
                      <Box flex='1'>
                        <Text fontWeight='semibold' fontSize='lg'>
                          Rotate product
                        </Text>
                        <Stack gap={2} mt={2}>
                          <HelpRow icon={LuMousePointerClick}>
                            Click and drag
                          </HelpRow>
                          <HelpRow icon={LuHand}>Touch and drag</HelpRow>
                        </Stack>
                      </Box>
                    </HStack>

                    <HStack align='start' gap={3}>
                      <Flex
                        align='center'
                        justify='center'
                        boxSize={12}
                        rounded='full'
                        bg='blue.50'
                        color='blue.600'
                        flexShrink={0}
                      >
                        <Icon as={LuZoomIn} boxSize={5} />
                      </Flex>
                      <Box flex='1'>
                        <Text fontWeight='semibold' fontSize='lg'>
                          Zoom in and out
                        </Text>
                        <Stack gap={3} mt={2}>
                          <HStack align='start' gap={3}>
                            {/* <HStack gap={1} flexShrink={0}>
                              <ControlChip>+</ControlChip>
                              <ControlChip>-</ControlChip>
                            </HStack> */}
                            <Text fontSize='sm' color='fg.muted'>
                              Use the + and - buttons on the viewer
                            </Text>
                          </HStack>

                          <Box>
                            <HelpRow icon={LuMouse}>
                              Scroll for{' '}
                              <Text as='span' fontWeight='semibold'>
                                quick zooming
                              </Text>
                            </HelpRow>
                            <Text fontSize='sm' color='fg.muted' pl={11} mt={1}>
                              Scroll up to zoom in, scroll down to zoom out
                            </Text>
                          </Box>

                          <Box>
                            <HelpRow icon={LuHand}>
                              Pinch for{' '}
                              <Text as='span' fontWeight='semibold'>
                                fine zooming
                              </Text>
                            </HelpRow>
                            <Text fontSize='sm' color='fg.muted' pl={11} mt={1}>
                              Pinch in to zoom in, pinch out to zoom out
                            </Text>
                          </Box>
                        </Stack>
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
            ref={controlsRef}
            autoRotate={false}
            enablePan={false}
            enableZoom={true}
            minDistance={minDistance}
            maxDistance={maxDistance}
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
