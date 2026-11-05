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
    depth: 0.42,
    bevel: 0.12,
    rough: 0.45,
    half: [
      [0.3, 0.4], // neck
      [0.72, 0.34], // shoulder
      [0.85, 0.0], // underarm
      [0.82, -1.1], // waist
      [0.85, -2.0], // hem
    ],
  },
  coat: {
    hem: -2.8,
    depth: 0.24,
    bevel: 0.06,
    rough: 0.95,
    half: [
      [0.28, 0.38],
      [0.75, 0.32],
      [0.8, -0.1],
      [0.78, -1.4],
      [0.85, -2.8],
    ],
  },
  knit: {
    hem: -1.75,
    depth: 0.28,
    bevel: 0.08,
    rough: 1,
    half: [
      [0.28, 0.38],
      [0.7, 0.32],
      [0.75, -0.1],
      [0.72, -1.0],
      [0.75, -1.75],
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
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          Math.sin(i * 0.2) * 0.5,
        ),
      );
    }
    return new THREE.CatmullRomCurve3(pts, true);
  }, [seed]);

  const tube = useMemo(
    () => new THREE.TubeGeometry(points, 64, 0.003, 8, true),
    [points],
  );

  return (
    <mesh geometry={tube}>
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function Sleeve({ side, type, color, dark, spec }) {
  const isPuffer = type === "puffer";
  const isCoat = type === "coat";
  const length = isCoat ? 2.3 : isPuffer ? 1.8 : 1.65;
  const radius = isPuffer ? 0.32 : isCoat ? 0.22 : 0.24;
  const px = side * (isPuffer ? 0.8 : isCoat ? 0.72 : 0.68);
  const py = 0.05;
  const rz = side * (isPuffer ? 0.22 : 0.15);

  return (
    <group position={[px, py, 0]} rotation={[0, 0, rz]}>
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 0.85, length, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={spec.rough}
          metalness={isPuffer ? 0.08 : 0}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius, 20, 16]} />
        <meshStandardMaterial color={color} roughness={spec.rough} />
      </mesh>
      {isPuffer &&
        [-0.4, -0.9, -1.4].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius + 0.01, 0.02, 12, 24]} />
            <meshStandardMaterial color={dark} roughness={0.7} />
          </mesh>
        ))}
      <mesh position={[0, -length, 0]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.8, 0.12, 20]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
    </group>
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

  const dark = useMemo(
    () => new THREE.Color(color).multiplyScalar(0.7),
    [color],
  );
  const front = spec.depth / 2 + spec.bevel * 0.8 + 0.004;
  const bodyHalf = spec.half[spec.half.length - 1][0];

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={color}
          roughness={spec.rough}
          metalness={type === "puffer" ? 0.08 : 0}
        />
      </mesh>

      <mesh
        position={[0, 0.33, 0]}
        scale={type === "coat" ? [0.36, 0.15, 0.17] : [0.42, 0.17, 0.25]}
      >
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>

      <Sleeve side={1} type={type} color={color} dark={dark} spec={spec} />
      <Sleeve side={-1} type={type} color={color} dark={dark} spec={spec} />

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
            <meshStandardMaterial
              color="#8f8f8f"
              metalness={0.8}
              roughness={0.35}
            />
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
              <meshStandardMaterial
                color={dark}
                roughness={1}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}

      {type === "knit" && (
        <mesh position={[0, spec.hem + 0.13, 0]}>
          <boxGeometry
            args={[
              bodyHalf * 2 + spec.bevel * 2 + 0.04,
              0.26,
              spec.depth + spec.bevel * 1.6 + 0.04,
            ]}
          />
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

function Scene({
  type,
  color,
  tilt,
  active,
  seed,
  snow,
  cy,
  model,
  enableControls,
}) {
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

  // Set initial pose on pivot once when component mounts or tilt changes
  useEffect(() => {
    if (pivot.current) {
      pivot.current.rotation.z = tilt;
      pivot.current.rotation.y = -tilt * 2.2;
      pivot.current.position.y = PIVOT_Y;
    }
  }, [tilt]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const P = pivot.current;
    if (!P) return;

    const S = shadowPivot.current;
    if (S && shadowMat.current) {
      S.rotation.z = P.rotation.z;
      S.position.y = P.position.y - 1.8;
      shadowMat.current.opacity = shadowBase;
    }

    if (keyLight.current) {
      keyLight.current.intensity = damp(
        keyLight.current.intensity,
        active ? 2.8 : 2.0,
        3,
        dt,
      );
    }
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
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
      )}

      {snow && (
        <Sparkles
          count={50}
          scale={[6, 6, 3]}
          position={[0, cy, 0.5]}
          size={2}
          speed={0.2}
          opacity={0.6}
          color="#ffffff"
        />
      )}

      <Float speed={0} rotationIntensity={0} floatIntensity={0}>
        <TextileFiber color={color} seed={seed} />
        <TextileFiber color="#ffffff" seed={seed + 10} />
      </Float>

      <group ref={shadowPivot} position={[0.16, 0, -1.2]}>
        <mesh>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial
            ref={shadowMat}
            map={blobTex}
            color="#292824"
            transparent
            opacity={shadowBase}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={pivot} position={[0, PIVOT_Y, 0]}>
        <GarmentSwitch type={type} color={color} model={model} />
      </group>
    </>
  );
}

const CAMERA_Z = { puffer: 8.5, coat: 8.0, knit: 7.5 };

export default function HangingGarment({
  type = "puffer",
  color = "#cbbfae",
  tilt = -0.2,
  active = false,
  seed = 0,
  snow = false,
  zoomOut = 1,
  model = null,
  enableControls = true,
}) {
  // const bottom = model ? model.bottom : SPECS[type].hem;
  const cy = 0;
  const camZ = model ? 7.5 * zoomOut : CAMERA_Z[type] * zoomOut;

  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, camZ], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <Scene
        type={type}
        color={color}
        tilt={tilt}
        active={active}
        seed={seed}
        snow={snow}
        cy={cy}
        model={model}
        enableControls={enableControls}
      />
    </Canvas>
  );
}

// export { SPECS, Garment };
