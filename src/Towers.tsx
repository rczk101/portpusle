import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { projects, stageOf } from './data'

function Tower({ i, x }: { i: number; x: number }) {
  const p = projects[i]
  const mesh = useRef<THREE.Mesh>(null!)
  const [hover, setHover] = useState(false)
  const target = p.score / 12
  const cur = useRef(0.01)

  useFrame((_, d) => {
    cur.current += (target - cur.current) * Math.min(1, d * 2.5)
    mesh.current.scale.y = cur.current
    mesh.current.position.y = cur.current / 2
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={p.color}
          emissive={p.color}
          emissiveIntensity={hover ? 1.1 : 0.45}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <Html position={[0, target + 0.5, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-lg border border-white/20 bg-black/70 px-2 py-1 text-center text-xs text-white">
          <b>{p.name}</b> · {p.score}%
          {hover && <div className="text-[10px] text-white/60">{stageOf(p.score)}</div>}
        </div>
      </Html>
    </group>
  )
}

export default function Towers() {
  const n = projects.length
  return (
    <Canvas camera={{ position: [0, 4, 9], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={['#06050c']} />
      <fog attach="fog" args={['#06050c', 10, 22]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 8, 5]} intensity={80} color="#ec4899" />
      <pointLight position={[-6, 5, -3]} intensity={60} color="#8b5cf6" />
      <gridHelper args={[24, 48, '#6d28d9', '#2a1f4d']} position={[0, 0, 0]} />
      {projects.map((_, i) => (
        <Tower key={i} i={i} x={(i - (n - 1) / 2) * 1.5} />
      ))}
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  )
}
