import { useRef, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader, Vector3 } from "three";

function latLngToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Globe({ focused, lat, lng }) {
  const globeRef = useRef();
  const { camera } = useThree();

  const texture = useLoader(TextureLoader, "/textures/earth.jpg");

  const targetPosition = useMemo(() => {
    if (!focused) return null;
    return latLngToVector3(lat, lng, 1);
  }, [focused, lat, lng]);

  useFrame(() => {
    if (!globeRef.current) return;

    if (!focused) {
      globeRef.current.rotation.y += 0.002;
      camera.position.z = 3;
      return;
    }

    const targetRotationY = Math.atan2(
      targetPosition.x,
      targetPosition.z
    );

    globeRef.current.rotation.y +=
      (targetRotationY - globeRef.current.rotation.y) * 0.05;

    camera.position.z += (2.2 - camera.position.z) * 0.05;
  });

  return (
    <>
      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Location pin */}
      {focused && targetPosition && (
        <mesh position={targetPosition.clone().multiplyScalar(1.02)}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
}
