import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  const planetAtmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
  const planetRingGeometry = new THREE.TorusGeometry(2, 0.01, 10, 128);
  const starBackgroundGeometry = new THREE.SphereGeometry(90, 128, 128);
  const node1Geometry = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3), 2 * Math.sin(planetRingGeometry.parameters.arc / 3), 0);
  const node2Geometry = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3 * 2), 2 * Math.sin(planetRingGeometry.parameters.arc / 3 * 2), 0);
  const node3Geometry = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3 * 3), 2 * Math.sin(planetRingGeometry.parameters.arc / 3 * 3), 0);

  const earthTexture = new THREE.TextureLoader().load("earth.jpg");
  const earthCloudsTexture = new THREE.TextureLoader().load("earth-clouds.png");
  const starsTexture = new THREE.TextureLoader().load("8k-stars-milky-way.jpg");
  const materialEarth = new THREE.MeshStandardMaterial({ map: earthTexture, depthTest: true });
  const materialClouds = new THREE.MeshStandardMaterial({ map: earthCloudsTexture, transparent: true, depthTest: false });
  const materialAtmosphere = new THREE.MeshStandardMaterial({ color: 0x00b3ff, emissive: 0x00b3ff, transparent: true, opacity: 0.1 });
  const materialEarthRing = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: false });
  const materialStars = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });
  const materialNode1 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });
  const materialNode2 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });
  const materialNode3 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });

  const earthMesh = new THREE.Mesh(planetGeometry, materialEarth);
  const earthCloudsMesh = new THREE.Mesh(planetGeometry, materialClouds);
  const earthAtmosphereMesh = new THREE.Mesh(planetAtmosphereGeometry, materialAtmosphere);
  const earthRingMesh = new THREE.Mesh(planetRingGeometry, materialEarthRing);
  const node1Mesh = new THREE.Mesh(node1Geometry, materialNode1);
  const node2Mesh = new THREE.Mesh(node2Geometry, materialNode2);
  const node3Mesh = new THREE.Mesh(node3Geometry, materialNode3);
  const starBackgroundMesh = new THREE.Mesh(starBackgroundGeometry, materialStars);

  const controls = new OrbitControls(camera, renderer.domElement);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  const ambientLight = new THREE.AmbientLight(0x404040);

  const titre = 'Hello !';
  const content1 = 'Je m\'appelle Hugo';
  const content2 = 'Je suis passionné par...';
  const arrayOfTexts = ['Le développement web !', 'L\'espace !', 'Les petits chats !', 'L\'ingénierie !', 'plus d\'idées !'];

  let textMesh: THREE.Mesh | undefined;

  const handleResize = React.useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }, [camera, renderer]);

  const updateMeshHoverEmissiveColor = React.useCallback((meshName: string, emissive: boolean, color: number) => {
    switch (meshName) {
      case 'earthAtmosphere':
        earthAtmosphereMesh.material.color.setHex(color);
        earthAtmosphereMesh.material.emissive.setHex(color);
        earthAtmosphereMesh.material.emissive = emissive ? new THREE.Color(0x00b3ff) : new THREE.Color(0x000000);
        break;
      case 'earthRing':
        //TODO: Add emissive gradient (maybe) ?
        earthRingMesh.material.color.setHex(color);
        break;
      //TODO: Refacto to use dynamic names instead of having 3 cases
      //TODO: Add progressive emissive color using the distance between the mouse and the node
      case 'node1':
        node1Mesh.material.color.setHex(color);
        node1Mesh.material.emissive.setHex(color);
        node1Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'node2':
        node2Mesh.material.color.setHex(color);
        node2Mesh.material.emissive.setHex(color);
        node2Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'node3':
        node3Mesh.material.color.setHex(color);
        node3Mesh.material.emissive.setHex(color);
        node3Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      default:
        break;
    }
  }, [earthAtmosphereMesh.material, earthRingMesh.material.color, node1Mesh.material, node2Mesh.material, node3Mesh.material]);


  const animate = React.useCallback(() => {
    earthMesh.rotation.y += 0.001;
    earthCloudsMesh.rotation.y += 0.0017;
    //TODO: Refacto to use dynamic names instead of calling 3 nodes
    node1Mesh.rotation.z += 0.0005;
    node2Mesh.rotation.z += 0.0005;
    node3Mesh.rotation.z += 0.0005;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }, [camera, controls, earthCloudsMesh.rotation, earthMesh.rotation, node1Mesh.rotation, node2Mesh.rotation, node3Mesh.rotation, renderer, scene]);

  const createTextGeometry = async () => {
    const loader = new FontLoader();
    const font = await loader.loadAsync('fonts/montserrat_thin_regular.json');

    const titleTextGeometry = new TextGeometry(titre, {
      font: font,
      size: 0.22,
      depth: 0.01,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelEnabled: true,
    });

    const contentTextGeometry = new TextGeometry(content1,
      {
        font: font,
        size: 0.15,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      }
    );

    const contentTextGeometry2 = new TextGeometry(content2,
      {
        font: font,
        size: 0.15,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      }
    );

    // Put the content below the title
    contentTextGeometry.translate(0, -0.3, 0);
    contentTextGeometry2.translate(0, -0.5, 0);

    const textGeometry = BufferGeometryUtils.mergeGeometries([titleTextGeometry, contentTextGeometry, contentTextGeometry2]);
    textGeometry.center();
    return bend(textGeometry);
  };

  createTextGeometry().then((textGeometry) => {
    textMesh = new THREE.Mesh(textGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    textMesh.position.set(0, 0, 1.1);
    textMesh.rotateOnAxis(new THREE.Vector3(0, -1, 0), Math.PI / 2);
    textMesh.visible = true;
    textMesh.geometry.center();
    scene.add(textMesh);
  });

  const createCylinderWithText = async () => {

    const loader = new FontLoader();
    const font = await loader.loadAsync('fonts/montserrat_thin_regular.json');

    const arrayOfTextsGeometry = arrayOfTexts.map((text, index) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.1,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      });
      textGeometry.center();
      //Put the text one after the other on the x-axis cnsidering the text has to be aligned to the left
      textGeometry.translate(index * 2, 0, 0);
      return textGeometry;
    });

    const arrayOfTextsGeometriesMerged = bend(BufferGeometryUtils.mergeGeometries(arrayOfTextsGeometry));

    const arrayOfTextMesh = new THREE.Mesh(arrayOfTextsGeometriesMerged, new THREE.MeshStandardMaterial({ color: 0xffffff }));

    arrayOfTextMesh.rotateOnAxis(new THREE.Vector3(0, -1, 0), Math.PI / 2);

    scene.add(arrayOfTextMesh);

  };

  createCylinderWithText();

  const bend = (g: THREE.BufferGeometry) => {
    const pos = g.attributes.position;
    const z = 1.25; // Distance from the center of the planet
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const aspect = x / 10;
      const angle = Math.PI * 2 * aspect;
      pos.setXYZ(i, Math.cos(angle) * z, pos.getY(i), Math.sin(-angle) * z);
    }
    g.computeVertexNormals(); // Recalculate normals for the lighting
    return g;
  }


  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      containerRef.current?.appendChild(renderer.domElement);

      // Camera distance from planet
      camera.position.z = 5;

      // Add inertia
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Lock panning
      controls.enablePan = false;

      // Lock camera rotation to the y axis
      // controls.minPolarAngle = Math.PI / 2;
      // controls.maxPolarAngle = Math.PI / 2;

      //Lock camera distance
      // controls.minDistance = 5;
      // controls.maxDistance = 5;

      //Planet mesh render order
      earthMesh.renderOrder = 0;
      earthCloudsMesh.renderOrder = 1;

      // Planet inclination
      earthMesh.rotation.x = 0.23;
      earthCloudsMesh.rotation.x = 0.23;

      // Renames nodes and change inclination plan
      //TODO: Refacto to use dynamic names instead of instantiating 3 nodes
      node1Mesh.castShadow = true;
      node2Mesh.castShadow = true;
      node3Mesh.castShadow = true;
      node1Mesh.rotation.x = 90;
      node1Mesh.rotation.y = 0.40;
      node2Mesh.rotation.x = 90;
      node2Mesh.rotation.y = 0.40;
      node3Mesh.rotation.x = 90;
      node3Mesh.rotation.y = 0.40;

      // Planet Ring inclination
      earthRingMesh.rotation.x = 90;
      earthRingMesh.rotation.y = 0.40;

      //Milky way inclination
      starBackgroundMesh.rotation.x = 60.2;

      // Enable shadows
      earthMesh.castShadow = true;
      earthCloudsMesh.castShadow = true;
      earthMesh.receiveShadow = true;
      earthCloudsMesh.receiveShadow = true;
      earthRingMesh.receiveShadow = true;
      node1Mesh.receiveShadow = true;
      node2Mesh.receiveShadow = true;
      node3Mesh.receiveShadow = true;
      dirLight.castShadow = true;

      // Add light
      dirLight.position.set(50, 0, 30);

      // Name objects
      earthMesh.name = 'earth';
      earthCloudsMesh.name = 'earthClouds';
      earthAtmosphereMesh.name = 'earthAtmosphere';
      earthRingMesh.name = 'earthRing';
      node1Mesh.name = 'node1';
      node2Mesh.name = 'node2';
      node3Mesh.name = 'node3';

      //Add objects to scene
      scene.add(dirLight);
      scene.add(ambientLight);
      scene.add(earthMesh);
      scene.add(earthCloudsMesh);
      scene.add(earthAtmosphereMesh);
      scene.add(earthRingMesh);
      scene.add(node1Mesh);
      scene.add(node2Mesh);
      scene.add(node3Mesh);
      scene.add(starBackgroundMesh);

      animate();

      let previousObject = '';
      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        //Ignore stars background mesh
        const sceneChildrensWithoutStars = scene.children.filter(child => child !== starBackgroundMesh);
        const intersects = raycaster.intersectObjects(sceneChildrensWithoutStars);

        if (intersects.length <= 0) {
          updateMeshHoverEmissiveColor(previousObject, false, previousObject === 'earthAtmosphere' ? 0x00b3ff : 0xffffff);
          previousObject = '';
        } else if (intersects[0].object.name !== previousObject) {
          updateMeshHoverEmissiveColor(previousObject, false, previousObject === 'earthAtmosphere' ? 0x00b3ff : 0xffffff);
          updateMeshHoverEmissiveColor(intersects[0].object.name, true, 0xffffff);
          previousObject = intersects[0].object.name;
        } else {
          updateMeshHoverEmissiveColor(intersects[0].object.name, true, 0xffffff);
          previousObject = intersects[0].object.name;
        }
      });

      window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        //const intersects = raycaster.intersectObjects(scene.children);
        // if (intersects.length > 0) {
        //   if (intersects[0].object.name === 'earthAtmosphere') {
        //     if (textMesh) {
        //       textMesh.visible = true;
        //     } else {
        //       console.log('textMesh is not defined yet');
        //     }
        //   }
        // }
      });

      window.addEventListener('resize', handleResize);
      // Clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [renderer, scene, camera, controls, earthMesh, earthCloudsMesh, earthAtmosphereMesh, earthRingMesh, node1Mesh, node2Mesh, node3Mesh, starBackgroundMesh, dirLight, ambientLight, mouse, raycaster, textMesh, handleResize, animate, updateMeshHoverEmissiveColor]);

  return (
    <div ref={containerRef} />
  );
};

export default ThreeScene;