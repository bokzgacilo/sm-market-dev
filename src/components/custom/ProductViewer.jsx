"use client";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Popover,
  Portal,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Environment,
  Html,
  Line,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LuArrowDown,
  LuArrowLeft,
  LuArrowRight,
  LuArrowUp,
  LuCircleHelp,
  LuHand,
  LuMouse,
  LuMousePointerClick,
  LuMove3D,
  LuRuler,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import { Box3 as ThreeBox3, Vector3 } from "three";

function formatMeasurement(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function formatDimension(dimension) {
  if (!dimension) return "0.00";
  if (typeof dimension === "number") return formatMeasurement(dimension);
  if (typeof dimension === "string") return dimension;

  const value = Number(dimension.value);
  const formattedValue = Number.isFinite(value)
    ? Number.isInteger(value)
      ? String(value)
      : String(value)
    : "0.00";

  return dimension.unit
    ? `${formattedValue} ${dimension.unit}`
    : formattedValue;
}

function parseProductMeasurements(description) {
  if (!description || typeof description !== "string") return null;

  const unitPattern = "(cm|mm|m|in|inch|inches|ft|feet)";
  const numberPattern = "(\\d+(?:\\.\\d+)?)";
  const text = description.replace(/[×✕]/g, "x").replace(/\s+/g, " ").trim();

  const labeledMeasurements = {};
  const labeledPattern = new RegExp(
    `\\b(length|len|l|width|wide|w|depth|deep|d|height|high|h)\\b\\s*[:=\\-]?\\s*${numberPattern}\\s*${unitPattern}?`,
    "gi"
  );
  let labeledMatch = labeledPattern.exec(text);

  while (labeledMatch !== null) {
    const label = labeledMatch[1].toLowerCase();
    const key =
      label === "length" || label === "len" || label === "l"
        ? "length"
        : label === "height" || label === "high" || label === "h"
          ? "height"
          : "width";

    labeledMeasurements[key] = {
      value: Number(labeledMatch[2]),
      unit: labeledMatch[3] || "",
    };

    labeledMatch = labeledPattern.exec(text);
  }

  if (
    labeledMeasurements.length &&
    labeledMeasurements.width &&
    labeledMeasurements.height
  ) {
    const fallbackUnit =
      labeledMeasurements.length.unit ||
      labeledMeasurements.width.unit ||
      labeledMeasurements.height.unit;

    return {
      length: {
        ...labeledMeasurements.length,
        unit: labeledMeasurements.length.unit || fallbackUnit,
      },
      width: {
        ...labeledMeasurements.width,
        unit: labeledMeasurements.width.unit || fallbackUnit,
      },
      height: {
        ...labeledMeasurements.height,
        unit: labeledMeasurements.height.unit || fallbackUnit,
      },
    };
  }

  const triplePattern = new RegExp(
    `${numberPattern}\\s*${unitPattern}?\\s*(?:x|by)\\s*${numberPattern}\\s*${unitPattern}?\\s*(?:x|by)\\s*${numberPattern}\\s*${unitPattern}?`,
    "i"
  );
  const tripleMatch = text.match(triplePattern);

  if (!tripleMatch) return null;

  const unit = tripleMatch[2] || tripleMatch[4] || tripleMatch[6] || "";

  return {
    length: { value: Number(tripleMatch[1]), unit },
    width: { value: Number(tripleMatch[3]), unit },
    height: { value: Number(tripleMatch[5]), unit },
  };
}

function normalizeProductMeasurements(measurements) {
  if (!measurements) return null;

  const source = measurements.measurements || measurements;
  const length = Number(source.length);
  const width = Number(source.width);
  const height = Number(source.height);

  if (
    !Number.isFinite(length) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }

  return { length, width, height };
}

function Model({
  url,
  showMeasurements,
  measurementLabels,
  onMeasurementsChange,
  onModelReady,
}) {
  const { scene } = useGLTF(url);
  const measurements = useMemo(() => {
    const bounds = new ThreeBox3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());

    return {
      bounds,
      center,
      size,
      length: size.x,
      width: size.z,
      height: size.y,
    };
  }, [scene]);

  useEffect(() => {
    onMeasurementsChange?.({
      length: measurements.length,
      width: measurements.width,
      height: measurements.height,
    });
  }, [measurements, onMeasurementsChange]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      onModelReady?.();
    });

    return () => cancelAnimationFrame(frameId);
  }, [onModelReady]);

  return (
    <>
      <primitive object={scene} scale={1} />
      {showMeasurements ? (
        <MeasurementOverlay
          measurements={measurements}
          labels={measurementLabels}
        />
      ) : null}
    </>
  );
}

function MeasurementLabel({ position, children }) {
  return (
    <Html position={position} center>
      <div
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          background: "#ffffff",
          border: "1px solid #bfdbfe",
          color: "#1d4ed8",
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: 1.2,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.18)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function MeasurementOverlay({ measurements, labels }) {
  const { bounds, center, height, length, width } = measurements;
  const min = bounds.min;
  const max = bounds.max;
  const pad = Math.max(length, width, height) * 0.08 || 0.12;
  const labelPad = pad * 1.7;
  const color = "#2563eb";

  const lengthLine = [
    [min.x, min.y - pad, max.z + pad],
    [max.x, min.y - pad, max.z + pad],
  ];
  const widthLine = [
    [max.x + pad, min.y - pad, min.z],
    [max.x + pad, min.y - pad, max.z],
  ];
  const heightLine = [
    [max.x + pad, min.y, min.z - pad],
    [max.x + pad, max.y, min.z - pad],
  ];

  return (
    <>
      <Line points={lengthLine} color={color} lineWidth={2} />
      <Line points={widthLine} color={color} lineWidth={2} />
      <Line points={heightLine} color={color} lineWidth={2} />
      <MeasurementLabel
        position={[center.x, min.y - labelPad, max.z + labelPad]}
      >
        Length {formatDimension(labels?.length ?? length)} cm
      </MeasurementLabel>
      <MeasurementLabel
        position={[max.x + labelPad, min.y - labelPad, center.z]}
      >
        Width {formatDimension(labels?.width ?? width)} cm
      </MeasurementLabel>
      <MeasurementLabel
        position={[max.x + labelPad, center.y, min.z - labelPad]}
      >
        Height {formatDimension(labels?.height ?? height)} cm
      </MeasurementLabel>
    </>
  );
}

function HelpRow({ icon, children, muted = false }) {
  return (
    <HStack align="start" gap={3}>
      <Flex
        align="center"
        justify="center"
        boxSize={8}
        rounded="lg"
        borderWidth="1px"
        borderColor="gray.200"
        color="gray.600"
        bg="white"
        flexShrink={0}
      >
        <Icon as={icon} boxSize={4} />
      </Flex>
      <Text fontSize="sm" color={muted ? "fg.muted" : "fg"}>
        {children}
      </Text>
    </HStack>
  );
}

export default function ProductViewer({
  modelUrl,
  description,
  productMeasurements,
}) {
  const controlsRef = useRef(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(Boolean(modelUrl));
  const savedProductMeasurements = useMemo(
    () => normalizeProductMeasurements(productMeasurements),
    [productMeasurements]
  );
  const parsedProductMeasurements = useMemo(
    () => parseProductMeasurements(description),
    [description]
  );
  const measurementLabels =
    savedProductMeasurements || parsedProductMeasurements;
  const displayMeasurements = measurementLabels || measurements;
  const minDistance = 1.5;
  const maxDistance = 18;

  useEffect(() => {
    setIsModelLoading(Boolean(modelUrl));
  }, [modelUrl]);

  const handleModelReady = useCallback(() => {
    setIsModelLoading(false);
  }, []);

  const handleZoom = useCallback((direction) => {
    const controls = controlsRef.current;

    if (!controls) return;

    const offset = controls.object.position.clone().sub(controls.target);
    const currentDistance = offset.length();
    const nextDistance = Math.min(
      maxDistance,
      Math.max(minDistance, currentDistance + direction * 0.75)
    );

    offset.setLength(nextDistance);
    controls.object.position.copy(controls.target).add(offset);
    controls.update();
  }, []);

  const handleMoveCamera = useCallback((horizontal, vertical) => {
    const controls = controlsRef.current;

    if (!controls) return;

    const camera = controls.object;
    const forward = new Vector3();
    camera.getWorldDirection(forward);

    const right = new Vector3().crossVectors(forward, camera.up).normalize();
    const up = camera.up.clone().normalize();
    const distance = camera.position.distanceTo(controls.target);
    const step = Math.max(distance * 0.08, 0.1);
    const movement = right
      .multiplyScalar(horizontal * step)
      .add(up.multiplyScalar(vertical * step));

    camera.position.add(movement);
    controls.target.add(movement);
    controls.update();
  }, []);

  return (
    <Box
      position="relative"
      height={{ base: "550px", lg: "700px" }}
      bg="gray.300"
      // rounded={{ base: 0, lg: "md" }}
      overflow="hidden"
    >
      {modelUrl ? (
        <HStack position="absolute" top={3} left={3} zIndex={2} gap={2}>
          <Button
            size="sm"
            rounded="full"
            variant={showMeasurements ? "solid" : "surface"}
            colorPalette="blue"
            boxShadow="sm"
            onClick={() => setShowMeasurements((current) => !current)}
          >
            <LuRuler />
            Measurements
          </Button>
          <Button
            size="sm"
            rounded="full"
            variant={showCameraControls ? "solid" : "surface"}
            colorPalette="blue"
            boxShadow="sm"
            onClick={() => setShowCameraControls((current) => !current)}
          >
            <LuMove3D />
            Move
          </Button>
        </HStack>
      ) : null}

      {showCameraControls ? (
        <Box
          position="absolute"
          right={3}
          bottom={24}
          zIndex={2}
          p={2}
          rounded="lg"
          bg="white"
          borderWidth="1px"
          borderColor="blue.200"
          boxShadow="md"
        >
          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 32px)"
            gridTemplateRows="repeat(3, 32px)"
            gap={1}
          >
            <Box />
            <IconButton
              aria-label="Move camera up"
              size="xs"
              rounded="md"
              variant="surface"
              colorPalette="blue"
              onClick={() => handleMoveCamera(0, 1)}
            >
              <LuArrowUp />
            </IconButton>
            <Box />
            <IconButton
              aria-label="Move camera left"
              size="xs"
              rounded="md"
              variant="surface"
              colorPalette="blue"
              onClick={() => handleMoveCamera(-1, 0)}
            >
              <LuArrowLeft />
            </IconButton>
            <IconButton
              aria-label="Reset camera movement"
              size="xs"
              rounded="md"
              variant="outline"
              colorPalette="blue"
              onClick={() => {
                const controls = controlsRef.current;

                if (!controls) return;

                controls.target.set(0, 0, 0);
                controls.update();
              }}
            >
              <LuMove3D />
            </IconButton>
            <IconButton
              aria-label="Move camera right"
              size="xs"
              rounded="md"
              variant="surface"
              colorPalette="blue"
              onClick={() => handleMoveCamera(1, 0)}
            >
              <LuArrowRight />
            </IconButton>
            <Box />
            <IconButton
              aria-label="Move camera down"
              size="xs"
              rounded="md"
              variant="surface"
              colorPalette="blue"
              onClick={() => handleMoveCamera(0, -1)}
            >
              <LuArrowDown />
            </IconButton>
            <Box />
          </Box>
        </Box>
      ) : null}

      {showMeasurements && displayMeasurements ? (
        <Box
          position="absolute"
          left={3}
          bottom={3}
          zIndex={2}
          px={3}
          py={2}
          rounded="md"
          bg="white"
          borderWidth="1px"
          borderColor="blue.200"
          boxShadow="md"
        >
          <Text fontSize="xs" color="fg.muted" fontWeight="medium">
            {measurementLabels ? "Product measurements" : "Model units"}
          </Text>
          <Text fontSize="sm" color="blue.700" fontWeight="semibold">
            {formatDimension(displayMeasurements.length)} x{" "}
            {formatDimension(displayMeasurements.width)} x{" "}
            {formatDimension(displayMeasurements.height)}
          </Text>
        </Box>
      ) : null}

      {modelUrl && isModelLoading ? (
        <Flex
          position="absolute"
          inset={0}
          zIndex={3}
          align="center"
          justify="center"
          direction="column"
          gap={3}
          bg="blackAlpha.500"
          color="white"
          pointerEvents="none"
        >
          <Spinner size="xl" borderWidth="4px" color="white" />
          <Text fontWeight="semibold">Loading 3D model...</Text>
        </Flex>
      ) : null}

      <VStack position="absolute" bottom={3} right={3} zIndex={2} gap={2}>
        <IconButton
          aria-label="Zoom in on 3D model"
          size="sm"
          rounded="full"
          variant="solid"
          colorPalette="blue"
          boxShadow="sm"
          onClick={() => handleZoom(-1)}
        >
          <LuZoomIn />
        </IconButton>
        <IconButton
          aria-label="Zoom out on 3D model"
          size="sm"
          rounded="full"
          variant="solid"
          colorPalette="blue"
          boxShadow="sm"
          onClick={() => handleZoom(1)}
        >
          <LuZoomOut />
        </IconButton>
      </VStack>

      <Box position="absolute" top={3} right={3} zIndex={2}>
        <Popover.Root positioning={{ placement: "bottom-end" }}>
          <Popover.Trigger asChild>
            <IconButton
              aria-label="Show 3D viewer controls"
              size="sm"
              rounded="full"
              variant="solid"
              colorPalette="blue"
              boxShadow="sm"
            >
              <LuCircleHelp />
            </IconButton>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content maxW="420px" rounded="2xl" boxShadow="xl">
                <Popover.Arrow>
                  <Popover.ArrowTip />
                </Popover.Arrow>

                <Popover.Body>
                  <Stack gap={6}>
                    <HStack align="start" gap={3}>
                      <Flex
                        align="center"
                        justify="center"
                        boxSize={12}
                        rounded="full"
                        bg="blue.50"
                        color="blue.600"
                        flexShrink={0}
                      >
                        <Icon as={LuMove3D} boxSize={5} />
                      </Flex>
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize="lg">
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

                    <HStack align="start" gap={3}>
                      <Flex
                        align="center"
                        justify="center"
                        boxSize={12}
                        rounded="full"
                        bg="blue.50"
                        color="blue.600"
                        flexShrink={0}
                      >
                        <Icon as={LuZoomIn} boxSize={5} />
                      </Flex>
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize="lg">
                          Zoom in and out
                        </Text>
                        <Stack gap={3} mt={2}>
                          <HStack align="start" gap={3}>
                            {/* <HStack gap={1} flexShrink={0}>
                              <ControlChip>+</ControlChip>
                              <ControlChip>-</ControlChip>
                            </HStack> */}
                            <Text fontSize="sm" color="fg.muted">
                              Use the + and - buttons on the viewer
                            </Text>
                          </HStack>

                          <Box>
                            <HelpRow icon={LuMouse}>
                              Scroll for{" "}
                              <Text as="span" fontWeight="semibold">
                                quick zooming
                              </Text>
                            </HelpRow>
                            <Text fontSize="sm" color="fg.muted" pl={11} mt={1}>
                              Scroll up to zoom in, scroll down to zoom out
                            </Text>
                          </Box>

                          <Box>
                            <HelpRow icon={LuHand}>
                              Pinch for{" "}
                              <Text as="span" fontWeight="semibold">
                                fine zooming
                              </Text>
                            </HelpRow>
                            <Text fontSize="sm" color="fg.muted" pl={11} mt={1}>
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
            <Model
              url={modelUrl}
              showMeasurements={showMeasurements}
              measurementLabels={measurementLabels}
              onMeasurementsChange={setMeasurements}
              onModelReady={handleModelReady}
            />
            <Environment preset="city" />
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
