import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GarmentSwitch } from "./HangingGarment";

const SPACING = 1.15; // distance between garments
const SCALE = 0.62;
const CAM_Z = 9; // must match the camera in <Canvas>
const damp = THREE.MathUtils.damp;

function RailItem({ item, index, activeIdx, onHover, onPick }) {
  const outer = useRef();
  const pivot = useRef();
  const active = activeIdx === index;
  const seed = index * 1.37;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const d = activeIdx == null ? 0 : index - activeIdx;
    const shift = d === 0 ? 0 : Math.sign(d) * 0.5 * Math.max(0, 1 - (Math.abs(d) - 1) / 3);

    const zNow = outer.current.position.z;
    const k = CAM_Z / (CAM_Z - zNow);
    const railX = outer.current.parent.position.x;
    let tx = index * SPACING + shift;
    if (active) tx = (railX + tx) / k - railX;

    outer.current.position.x = damp(outer.current.position.x, tx, 5, dt);
    outer.current.position.z = damp(outer.current.position.z, active ? 1.2 : 0, 4, dt);

    const yaw = active ? t * 0.3 : 0.95 + Math.sin(seed) * 0.08;
    pivot.current.rotation.y = damp(pivot.current.rotation.y, yaw, 4, dt);
  });

  return (
    <group
      ref={outer}
      position={[index * SPACING, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(index);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 6) return;
        onPick(index);
      }}
    >
      <group ref={pivot}>
        <group scale={SCALE}>
          <GarmentSwitch type={item.type} color={item.hex} model={item.model} />
        </group>
      </group>
    </group>
  );
}

function Rail({ items, activeIdx, onHover, onPick, scrollRef, metaRef }) {
  const { viewport } = useThree();
  const railRef = useRef();
  const smooth = useRef(0);

  const viewW = viewport.width;
  const startX = -viewW / 2 + 1.0;
  const maxScroll = Math.max(0, (items.length - 1) * SPACING + 2.0 - viewW);

  useEffect(() => {
    metaRef.current.viewW = viewW;
    metaRef.current.maxScroll = maxScroll;
    scrollRef.current = Math.min(scrollRef.current, maxScroll);
  }, [viewW, maxScroll, metaRef, scrollRef]);

  useFrame((_, delta) => {
    smooth.current = damp(smooth.current, scrollRef.current, 5, Math.min(delta, 0.05));
    railRef.current.position.x = startX - smooth.current;
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#d8d0c3", 1.2]} />
      <directionalLight position={[2.5, 3, 5]} intensity={2.0} />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} />

      <group ref={railRef} position={[startX, 0, 0]}>
        {items.map((item, i) => (
          <RailItem key={item.id} item={item} index={i} activeIdx={activeIdx} onHover={onHover} onPick={onPick} />
        ))}
      </group>
    </>
  );
}

export default function GarmentRail({ items, activeIdx, onHover, onPick, onMiss, scrollRef, metaRef }) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      onPointerMissed={onMiss}
    >
      <Rail items={items} activeIdx={activeIdx} onHover={onHover} onPick={onPick} scrollRef={scrollRef} metaRef={metaRef} />
    </Canvas>
  );
}
