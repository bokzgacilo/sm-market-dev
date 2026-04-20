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
  LuMousePointerClick,
  LuMove3D,
  LuZoomIn,
  LuZoomOut,
} from 'react-icons/lu';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
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
                          Use the + and - buttons on the viewer
                        </Text>
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
