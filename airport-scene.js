const canvas = document.querySelector("#airportSceneCanvas");

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  const settledPixelRatio = Math.min(window.devicePixelRatio, 1.5);
  const resizingPixelRatio = Math.min(window.devicePixelRatio, 1);
  renderer.setPixelRatio(settledPixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const palette = {
    coral: 0xe47d72,
    coralDark: 0xbd5c56,
    cream: 0xfff8e9,
    runway: 0x6f8f91,
    runwayDark: 0x4f7276,
    grass: 0x9dcfb5,
    grassDark: 0x66a28d,
    sky: 0xcfe9e8,
    yellow: 0xf2c96d,
    blue: 0x87b9c7,
    lavender: 0xb9b7d7,
    window: 0x4c7780
  };

  const materials = Object.fromEntries(Object.entries(palette).map(([name, color]) => [
    name,
    new THREE.MeshStandardMaterial({ color, roughness: 0.76, metalness: name === "window" ? 0.08 : 0 })
  ]));

  const castAndReceive = object => {
    object.traverse(child => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    return object;
  };

  const roundedShape = (width, height, radius) => {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  };

  const slab = (width, depth, height, radius, material) => {
    const geometry = new THREE.ExtrudeGeometry(roundedShape(width, depth, radius), {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: Math.min(radius * 0.18, 0.1),
      bevelThickness: Math.min(height * 0.22, 0.08),
      curveSegments: 10
    });
    geometry.center();
    geometry.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geometry, material);
  };

  const island = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.7, 0.55, 64), materials.grass);
  island.position.y = -0.28;
  island.scale.z = 0.72;
  island.receiveShadow = true;
  scene.add(island);

  const runway = slab(10.8, 3.1, 0.18, 0.8, materials.runway);
  runway.position.set(0.6, 0.12, 0.5);
  runway.rotation.y = -0.12;
  runway.receiveShadow = true;
  scene.add(runway);

  const runwayInset = slab(9.9, 2.35, 0.04, 0.62, materials.runwayDark);
  runwayInset.position.set(0.6, 0.23, 0.5);
  runwayInset.rotation.y = -0.12;
  scene.add(runwayInset);

  for (let index = -4; index <= 4; index += 1) {
    const stripe = slab(0.62, 0.09, 0.035, 0.04, materials.cream);
    stripe.position.set(index * 1.08 + 0.6, 0.31, index * -0.13 + 0.5);
    stripe.rotation.y = -0.12;
    scene.add(stripe);
  }

  const taxiCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.7, 0.2, 2.25),
    new THREE.Vector3(-3.2, 0.2, 3.35),
    new THREE.Vector3(-0.8, 0.2, 3.25),
    new THREE.Vector3(1.15, 0.2, 2.55)
  ]);
  const taxiLane = new THREE.Mesh(new THREE.TubeGeometry(taxiCurve, 36, 0.24, 10, false), materials.yellow);
  taxiLane.receiveShadow = true;
  scene.add(taxiLane);

  const terminal = new THREE.Group();
  const terminalBody = slab(3.5, 1.7, 1.15, 0.45, materials.cream);
  terminalBody.rotation.x = Math.PI / 2;
  terminalBody.rotation.z = Math.PI;
  terminalBody.position.y = 0.85;
  terminal.add(terminalBody);

  const terminalRoof = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 2.15, 8, 18), materials.coral);
  terminalRoof.rotation.z = Math.PI / 2;
  terminalRoof.scale.set(1, 0.32, 1.12);
  terminalRoof.position.y = 1.57;
  terminal.add(terminalRoof);

  [-1.05, 0, 1.05].forEach(x => {
    const window = slab(0.62, 0.08, 0.38, 0.14, materials.window);
    window.rotation.x = Math.PI / 2;
    window.position.set(x, 0.93, 0.88);
    terminal.add(window);
  });
  terminal.position.set(-3.4, 0, -2.25);
  terminal.rotation.y = 0.12;
  scene.add(castAndReceive(terminal));

  const tower = new THREE.Group();
  const towerStem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.1, 18), materials.cream);
  towerStem.position.y = 1.05;
  const towerRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.62, 0.7, 18), materials.window);
  towerRoom.position.y = 2.15;
  const towerRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.16, 18), materials.coral);
  towerRoof.position.y = 2.57;
  tower.add(towerStem, towerRoom, towerRoof);
  tower.position.set(-5.2, 0, -1.4);
  scene.add(castAndReceive(tower));

  const createTree = (x, z, scale = 1) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.55, 10), materials.coralDark);
    trunk.position.y = 0.28;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), materials.grassDark);
    crown.scale.set(1, 1.22, 1);
    crown.position.y = 0.78;
    tree.add(trunk, crown);
    tree.scale.setScalar(scale);
    tree.position.set(x, 0, z);
    scene.add(castAndReceive(tree));
  };

  [[-5.8, 1.2, 1], [-4.9, 2.25, 0.84], [4.7, -2.6, 1.15], [5.6, -1.75, 0.78], [4.9, 2.8, 0.9]].forEach(args => createTree(...args));

  const createCloud = (x, y, z, scale) => {
    const cloud = new THREE.Group();
    [[-0.52, 0, 0.46], [0, 0.18, 0.72], [0.58, 0, 0.5], [0.05, -0.1, 0.62]].forEach(([cx, cy, size]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(size, 18, 12), materials.cream);
      puff.position.set(cx, cy, 0);
      cloud.add(puff);
    });
    cloud.position.set(x, y, z);
    cloud.scale.setScalar(scale);
    scene.add(cloud);
    return cloud;
  };

  const cloudA = createCloud(-5.6, 4.9, -5.8, 1.15);
  const cloudB = createCloud(5.1, 5.7, -6.8, 0.88);
  let cloudBAnchorX = 5.1;
  let cloudBAnchorY = 5.7;

  const plane = new THREE.Group();
  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 3.45, 10, 24), materials.coral);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.castShadow = true;
  plane.add(fuselage);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), materials.cream);
  nose.scale.x = 0.72;
  nose.position.x = 2.12;
  plane.add(nose);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 12), materials.window);
  cockpit.scale.set(1.35, 0.66, 0.72);
  cockpit.position.set(0.95, 0.22, 0);
  plane.add(cockpit);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(-0.9, -0.2);
  wingShape.lineTo(0.45, -2.25);
  wingShape.quadraticCurveTo(0.72, -2.42, 0.9, -2.16);
  wingShape.lineTo(0.55, -0.18);
  wingShape.lineTo(0.55, 0.18);
  wingShape.lineTo(0.9, 2.16);
  wingShape.quadraticCurveTo(0.72, 2.42, 0.45, 2.25);
  wingShape.lineTo(-0.9, 0.2);
  wingShape.closePath();
  const wings = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.08,
    bevelThickness: 0.06
  }), materials.cream);
  wings.geometry.center();
  wings.rotation.x = Math.PI / 2;
  wings.position.x = -0.05;
  plane.add(wings);

  const tailWing = slab(1.25, 1.85, 0.15, 0.22, materials.yellow);
  tailWing.position.x = -1.55;
  plane.add(tailWing);

  const tailFin = slab(0.72, 0.12, 0.9, 0.18, materials.yellow);
  tailFin.rotation.x = Math.PI / 2;
  tailFin.position.set(-1.62, 0.52, 0);
  plane.add(tailFin);

  const propeller = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), materials.coralDark);
  const blade = slab(0.14, 1.25, 0.08, 0.06, materials.lavender);
  blade.rotation.x = Math.PI / 2;
  propeller.add(hub, blade);
  propeller.position.x = 2.53;
  propeller.rotation.y = Math.PI / 2;
  plane.add(propeller);

  plane.position.set(1.25, 3.2, -0.25);
  plane.rotation.set(-0.04, -0.32, 0.06);
  plane.scale.setScalar(0.92);
  scene.add(castAndReceive(plane));

  const ambient = new THREE.HemisphereLight(palette.sky, palette.grassDark, 2.4);
  const sun = new THREE.DirectionalLight(0xffe3b0, 4.6);
  sun.position.set(-6, 11, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  scene.add(ambient, sun);

  camera.position.set(11.5, 9.5, 13.5);
  camera.lookAt(0, 0.8, 0);
  scene.add(camera);
  camera.add(cloudB);

  let renderedWidth = 0;
  let renderedHeight = 0;

  const applyResize = (resizeBuffer = true) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const aspect = width / height;
    const compactProgress = Math.max(0, Math.min(1, (1200 - width) / 700));
    const widthDrivenViewHeight = 12.7 + compactProgress * 3.3;
    const heightDrivenViewHeight = height / 52;
    const viewHeight = Math.max(widthDrivenViewHeight, heightDrivenViewHeight);
    cloudA.visible = width >= 600;
    camera.left = -(viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    const cloudBHorizontalAnchor = width < 600 ? 0.68 : 0.74;
    cloudBAnchorX = camera.left + (camera.right - camera.left) * cloudBHorizontalAnchor;
    cloudBAnchorY = camera.bottom + (camera.top - camera.bottom) * 0.86;
    cloudB.position.set(cloudBAnchorX, cloudBAnchorY, -28);
    if (resizeBuffer && (width !== renderedWidth || height !== renderedHeight)) {
      renderedWidth = width;
      renderedHeight = height;
      renderer.setSize(width, height, false);
    }
  };

  let resizeFrame = 0;
  let resizeSettleTimer = 0;
  let resizing = false;

  const scheduleResize = () => {
    if (!resizing) {
      resizing = true;
      renderer.setPixelRatio(resizingPixelRatio);
    }
    if (!resizeFrame) {
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        applyResize(false);
      });
    }
    window.clearTimeout(resizeSettleTimer);
    resizeSettleTimer = window.setTimeout(() => {
      resizing = false;
      renderer.setPixelRatio(settledPixelRatio);
      applyResize(true);
    }, 160);
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  let running = true;

  const render = () => {
    if (!running) return;
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      plane.position.y = 3.2 + Math.sin(elapsed * 0.9) * 0.12;
      plane.rotation.z = 0.06 + Math.sin(elapsed * 0.7) * 0.025;
      propeller.rotation.x = elapsed * 11;
      cloudA.position.x = -5.6 + Math.sin(elapsed * 0.12) * 0.22;
      cloudB.position.x = cloudBAnchorX + Math.sin(elapsed * 0.1 + 2) * 0.18;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  const resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(entries => {
    const visible = entries[0]?.isIntersecting ?? true;
    if (visible && !running) {
      running = true;
      clock.start();
      render();
    } else if (!visible) {
      running = false;
      clock.stop();
    }
  });
  visibilityObserver.observe(canvas);
  applyResize();
  render();
}
