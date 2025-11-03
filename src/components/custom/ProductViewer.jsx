"use client";
import { Box } from "@chakra-ui/react";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export default function ProductViewer({ modelUrl }) {
  return (
    <Box height={{base: "250px", lg: "500px"}} bg="gray.300" rounded={{base: 0, lg: "md"}}>
      <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
        <ambientLight intensity={0} />
        <directionalLight position={[10, 10, 50]} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          autoRotate={true}
          enablePan={true}
          enableZoom={true}
        />
      </Canvas>
    </Box>
  );
}
