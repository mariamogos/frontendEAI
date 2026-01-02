import { useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";

export default function StarsBG() {
  const starTexture = useLoader(TextureLoader, "/textures/stars.jpg");
  const { viewpoint } = useThree();

  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[25, 20]} />
      <meshBasicMaterial map={starTexture} />
    </mesh>
  );
}
