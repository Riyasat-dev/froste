import { Component, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------
   3D Fiber / Fabric Experience - FROSTÉ
   Sculptural floating textile presentation.
   ------------------------------------------------------------------ */

// Right-half silhouette points
const SPECS = {
  puffer: {
    hem: -2.0,
    depth: 0.34,
    bevel: 0.09,
    rough: 0.45,
    half: [
      [0.3, 0.4],
      [0.62, 0.34],
      [0.95, 0.1],
      [1.25, -0.6],
      [1.55, -1.4],
      [1.2, -1.52],
      [0.84, -0.5],
      [0.8, -1.1],
      [0.84, -1.75],
    ],
  },
  coat: {
    hem: -2.8,
    depth: 0.2,
    bevel: 0.045,
    rough: 0.95,
    half: [
      [0.28, 0.38],
      [0.7, 0.3],
      [1.0, 0.12],
      [1.15, -0.6],
      [1.28, -1.7],
      [1.04, -1.76],
      [0.8, -0.55],
      [0.76, -1.4],
      [0.9, -2.6],
    ],
  },
  knit: {
    hem: -1.75,
    depth: 0.24,
    bevel: 0.06,
    rough: 1,
    half: [
      [0.28, 0.38],
      [0.65, 0.3],
      [0.98, 0.08],
      [1.12, -0.7],
      [1.28, -1.55],
      [1.0, -1.62],
      [0.76, -0.5],
      [0.74, -1.55],
    ],
  },
};

function buildOutline(spec) {
  const right = spec.half;
  const left = right.map(([x, y]) => [-x, y]).reverse();
  const pts = [[0, 0.2], ...right, [0, spec.hem], ...left].map(
    ([x, y]) => new THREE.Vector3(x, y, 0),
  );
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  return curve
    .getPoints(220)
    .slice(0, -1)
    .map((p) => new THREE.Vector2(p.x, p.y));
}

function TextileFiber({ color, seed }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const r = 1.8 + Math.sin(i * 0.5 + seed) * 0.4;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, Math.sin(i * 0.2) * 0.5));
    }
    return new THREE.CatmullRomCurve3(pts, true);
  }, [seed]);

  const tube = useMemo(() => new THREE.TubeGeometry(points, 64, 0.003, 8, true), [points]);

  return (
    <mesh geometry={tube}>
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function Garment({ type, color }) {
  const spec = SPECS[type];

  const { geo, shadowGeo } = useMemo(() => {
    const shape = new THREE.Shape(buildOutline(spec));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: spec.depth,
      bevelEnabled: true,
      bevelThickness: spec.bevel * 0.8,
      bevelSize: spec.bevel,
      bevelSegments: 6,
      curveSegments: 1,
      steps: 1,
    });
    g.translate(0, 0, -spec.depth / 2);
    return { geo: g, shadowGeo: new THREE.ShapeGeometry(shape) };
  }, [spec]);

  useEffect(
    () => () => {
      geo.dispose();
      shadowGeo.dispose();
    },
    [geo, shadowGeo],
  );

  const dark = useMemo(() => new THREE.Color(color).multiplyScalar(0.7), [color]);
  const front = spec.depth / 2 + spec.bevel * 0.8 + 0.004;
  const bodyHalf = spec.half[spec.half.length - 1][0];

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={spec.rough} metalness={type === "puffer" ? 0.08 : 0} />
      </mesh>

      <mesh position={[0, 0.33, 0]} scale={type === "coat" ? [0.36, 0.15, 0.17] : [0.42, 0.17, 0.25]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>

      {type === "puffer" && (
        <>
          {[-0.2, -0.58, -0.96, -1.34, -1.7].map((y) => (
            <mesh key={y} position={[0, y, front]}>
              <boxGeometry args={[bodyHalf * 2 - 0.06, 0.022, 0.012]} />
              <meshStandardMaterial color={dark} roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, (0.2 + spec.hem) / 2, front + 0.004]}>
            <boxGeometry args={[0.03, Math.abs(spec.hem - 0.2), 0.012]} />
            <meshStandardMaterial color="#8f8f8f" metalness={0.8} roughness={0.35} />
          </mesh>
        </>
      )}

      {type === "coat" && (
        <>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, 0.8, front]}>
              <shapeGeometry
                args={[
                  new THREE.Shape([
                    new THREE.Vector2(s * 0.34, -0.4),
                    new THREE.Vector2(s * 0.08, -1.25),
                    new THREE.Vector2(s * 0.0, -0.62),
                  ]),
                ]}
              />
              <meshStandardMaterial color={dark} roughness={1} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      )}

      {type === "knit" && (
        <mesh position={[0, spec.hem + 0.13, 0]}>
          <boxGeometry args={[bodyHalf * 2 + spec.bevel * 2 + 0.04, 0.26, spec.depth + spec.bevel * 1.6 + 0.04]} />
          <meshStandardMaterial color={dark} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

function ModelGarment({ url, color }) {
  const { scene } = useGLTF(url);

  const { root, mats } = useMemo(() => {
    const root = scene.clone(true);
    const mats = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material.clone();
      mats.push(m);
      o.material = m;
    });
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    root.position.sub(center);
    return { root, mats };
  }, [scene]);

  useEffect(() => {
    const base = new THREE.Color(color);
    mats.forEach((m) => {
      const role = m.userData.role;
      const rough = m.userData.rough ?? 0.8;
      if (role === "fixed") {
        m.roughness = rough;
      } else if (role === "metal") {
        m.color.set("#9a9a9a");
        m.roughness = 0.35;
        m.metalness = 0.85;
      } else {
        const k = role === "trim" ? 0.85 : role === "tape" ? 0.55 : 1;
        m.color.copy(base).multiplyScalar(k);
        m.roughness = rough;
        m.metalness = 0.04;
      }
    });
  }, [mats, color]);

  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  return <primitive object={root} />;
}

class ModelBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn("GLB failed to load, using procedural garment instead:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function GarmentSwitch({ type, color, model }) {
  const procedural = <Garment type={type} color={color} />;
  if (!model) return procedural;
  return (
    <ModelBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <group scale={model.shoulderScale ?? 1}>
          <ModelGarment url={model.url} color={color} />
        </group>
      </Suspense>
    </ModelBoundary>
  );
}

const PIVOT_Y = 0;
const damp = THREE.MathUtils.damp;

function Scene({ type, color, tilt, active, seed, snow, cy, model, enableControls }) {
  const shadowBase = 0.12;
  const blobTex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }, []);
  useEffect(() => () => blobTex.dispose(), [blobTex]);

  const pivot = useRef();
  const shadowPivot = useRef();
  const shadowMat = useRef();
  const keyLight = useRef();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const P = pivot.current;
    if (!P) return;

    const floatY = Math.sin(t * 0.6 + seed) * 0.1;
    const sway = Math.sin(t * 0.8 + seed) * 0.03;
    const targetZ = active ? Math.sin(t * 1.2 + seed) * 0.008 : tilt + sway;
    const targetYaw = active ? t * 0.3 : -tilt * 2.2 + sway * 2;
    const targetScale = active ? 1.08 : 1;

    P.rotation.z = damp(P.rotation.z, targetZ, 3.2, dt);
    P.rotation.y = damp(P.rotation.y, targetYaw, 3.2, dt);
    P.position.y = damp(P.position.y, PIVOT_Y + floatY, 3.5, dt);
    const s = damp(P.scale.x, targetScale, 3.5, dt);
    P.scale.set(s, s, s);

    const S = shadowPivot.current;
    S.rotation.z = P.rotation.z;
    S.scale.set(Math.max(0.55, Math.abs(Math.cos(P.rotation.y))) * s, s, 1);
    S.position.y = P.position.y - 1.8;
    shadowMat.current.opacity = shadowBase;

    keyLight.current.intensity = damp(keyLight.current.intensity, active ? 2.8 : 2.0, 3, dt);
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#d8d0c3", 1.2]} />
      <directionalLight ref={keyLight} position={[2.5, 3, 5]} intensity={2.0} />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} />

      {enableControls && (
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate={false}
        />
      )}

      {snow && (
        <Sparkles count={50} scale={[6, 6, 3]} position={[0, cy, 0.5]} size={2} speed={0.2} opacity={0.6} color="#ffffff" />
      )}

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <TextileFiber color={color} seed={seed} />
        <TextileFiber color="#ffffff" seed={seed + 10} />
      </Float>

      <group ref={shadowPivot} position={[0.16, 0, -1.2]}>
        <mesh>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial ref={shadowMat} map={blobTex} color="#292824" transparent opacity={shadowBase} depthWrite={false} />
        </mesh>
      </group>

      <group ref={pivot} position={[0, PIVOT_Y, 0]}>
        <GarmentSwitch type={type} color={color} model={model} />
      </group>
    </>
  );
}

const CAMERA_Z = { puffer: 8.5, coat: 8.0, knit: 7.5 };

export default function HangingGarment({ type = "puffer", color = "#cbbfae", tilt = -0.2, active = false, seed = 0, snow = false, zoomOut = 1, model = null, enableControls = false }) {
  const bottom = model ? model.bottom : SPECS[type].hem;
  const cy = 0;
  const camZ = model
    ? 7.5 * zoomOut
    : CAMERA_Z[type] * zoomOut;

  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, camZ], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <Scene type={type} color={color} tilt={tilt} active={active} seed={seed} snow={snow} cy={cy} model={model} enableControls={enableControls} />
    </Canvas>
  );
}

export { SPECS, Garment };
