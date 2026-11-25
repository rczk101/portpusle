import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { projects } from './data'

function Core() {
  const a = useRef<THREE.Mesh>(null!)
  const b = useRef<THREE.Mesh>(null!)
  useFrame((_, d) => {
    a.current.rotation.y += d * 0.3
    a.current.rotation.x += d * 0.12
    b.current.rotation.y -= d * 0.5
  })
  return (
    <Float speed={2} floatIntensity={0.6}>
      <mesh ref={a}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#ec4899" emissiveIntensity={0.8} wireframe />
      </mesh>
      <mesh ref={b}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.4} flatShading />
      </mesh>
    </Float>
  )
}

function Ring({ r, tilt, speed, color }: { r: number; tilt: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, d) => { ref.current.rotation.z += d * speed })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[r, 0.008, 8, 160]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </mesh>
  )
}

function Orbiter({ i }: { i: number }) {
  const ref = useRef<THREE.Group>(null!)
  const p = projects[i]
  const r = 2.3 + i * 0.3
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.25 + p.score / 300) + i * 1.7
    ref.current.position.set(Math.cos(t) * r, Math.sin(t * 0.7) * 0.8, Math.sin(t) * r)
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.09 + p.score / 1000, 20, 20]} />
        <meshBasicMaterial color={p.color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2 + p.score / 800, 20, 20]} />
        <meshBasicMaterial color={p.color} transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function Particles() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(900 * 3)
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 16
    return arr
  }, [])
  useFrame((_, d) => { ref.current.rotation.y += d * 0.02 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#c4b5fd" transparent opacity={0.7} />
    </points>
  )
}

function Rig() {
  useFrame((state) => {
    const { pointer, camera } = state
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04
    camera.position.y += (pointer.y * 0.8 + 1.2 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1.2, 6.5], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#ec4899" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#8b5cf6" />
      <Stars radius={60} depth={40} count={1500} factor={3} fade speed={1} />
      <Particles />
      <Core />
      <Ring r={2.4} tilt={0.2} speed={0.2} color="#8b5cf6" />
      <Ring r={3.1} tilt={-0.35} speed={-0.15} color="#ec4899" />
      <Ring r={3.8} tilt={0.5} speed={0.1} color="#f97316" />
      {projects.map((_, i) => <Orbiter key={i} i={i} />)}
      <Rig />
    </Canvas>
  )
}
