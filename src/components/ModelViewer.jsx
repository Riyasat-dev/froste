import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Garment({ modelPath }) {
  const { scene } = useGLTF(modelPath);

  return (
    <Center>
      <primitive object={scene.clone()} />
    </Center>
  );
}

export default function ModelViewer({ modelPath }) {
  return (
    <div className="w-full h-[650px] bg-[#eeece7] rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 5]} intensity={2} />

        <Suspense fallback={null}>
          <Garment modelPath={modelPath} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1}
          maxDistance={6}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
