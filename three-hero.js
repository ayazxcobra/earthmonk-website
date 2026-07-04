/*
  three-hero.js — signature 3D element for The House of Earthmonk.

  Concept: a hand-thrown clay pot (built from a revolved 2D profile, like a
  potter's wheel) sits over slow-rising embers. It nods to both the
  restaurant's name ("Earthmonk" — earth, clay, monastic warmth) and its
  wood-fired, hand-crafted food. Kept deliberately simple/procedural (no
  external 3D model files) so it loads fast and never depends on the
  network at runtime.

  Performance/stability notes:
  - Capped pixel ratio and particle count so it stays smooth on phones.
  - Pauses the render loop when the hero is scrolled off-screen.
  - Wrapped in try/catch; if WebGL is unavailable, the hero still looks
    good with the CSS gradient background alone (see style.css .hero).
*/

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let renderer, scene, camera, pot, embers, frameId;
  let isVisible = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      resize();

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.set(0, 0.6, 6.2);

      // Warm lighting: a low ember key light + soft ambient fill.
      const ambient = new THREE.AmbientLight(0x3a2d20, 1.1);
      scene.add(ambient);
      const key = new THREE.PointLight(0xc99a45, 2.4, 20);
      key.position.set(2.5, 3, 3);
      scene.add(key);
      const rim = new THREE.PointLight(0xa15c37, 1.6, 20);
      rim.position.set(-3, -1, -2);
      scene.add(rim);

      pot = buildClayPot();
      scene.add(pot);

      embers = buildEmbers();
      scene.add(embers);

      window.addEventListener('resize', resize);
      const observer = new IntersectionObserver(
        (entries) => { isVisible = entries[0].isIntersecting; },
        { threshold: 0.05 }
      );
      observer.observe(canvas);

      animate();
    } catch (e) {
      // Fails quietly — hero still looks fine without 3D.
      console.warn('3D hero unavailable:', e);
    }
  }

  function buildClayPot() {
    // Revolve a 2D silhouette to get a thrown-pottery look.
    const points = [];
    points.push(new THREE.Vector2(0.0, -1.1));
    points.push(new THREE.Vector2(0.55, -1.05));
    points.push(new THREE.Vector2(0.78, -0.7));
    points.push(new THREE.Vector2(0.7, -0.2));
    points.push(new THREE.Vector2(0.85, 0.25));
    points.push(new THREE.Vector2(0.6, 0.7));
    points.push(new THREE.Vector2(0.62, 0.95));
    points.push(new THREE.Vector2(0.5, 1.05));
    const geometry = new THREE.LatheGeometry(points, 48);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8a4a2a,
      roughness: 0.85,
      metalness: 0.08,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = 0.05;
    mesh.position.y = -0.3;
    return mesh;
  }

  function buildEmbers() {
    const count = window.innerWidth < 700 ? 60 : 140;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.003 + Math.random() * 0.006;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xc99a45,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.userData.speeds = speeds;
    return points;
  }

  function resize() {
    if (!renderer || !camera) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let t = 0;
  function animate() {
    frameId = requestAnimationFrame(animate);
    if (!isVisible) return;

    t += reducedMotion ? 0.0015 : 0.004;

    if (pot) {
      pot.rotation.y = t * 1.2;
    }

    if (embers) {
      const posAttr = embers.geometry.getAttribute('position');
      const speeds = embers.userData.speeds;
      for (let i = 0; i < speeds.length; i++) {
        let y = posAttr.getY(i) + speeds[i];
        if (y > 2.2) y = -2.2;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
