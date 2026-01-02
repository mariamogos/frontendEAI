// import { useRef } from "react";
// import { useFrame } from "@react-three/fiber";
// import * as THREE from "three";

// export default function CameraRig() {
//   const ref = useRef();
//   const target = new THREE.Vector3(0, 0, 0);

//   useFrame(({ camera, mouse }) => {
//     camera.position.z = THREE.MathUtils.lerp(
//       camera.position.z,
//       3 + mouse.y * 1.5,
//       0.05
//     );

//     camera.rotation.x = mouse.y * 0.1;
//     camera.rotation.y = -mouse.x * 0.1;

//     camera.lookAt(target);
//   });

//   return null;
// }
