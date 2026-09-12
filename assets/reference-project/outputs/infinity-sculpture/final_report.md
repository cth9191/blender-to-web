# APERTURE magnetic infinity

Live local demo: http://127.0.0.1:4175/. The first shell experiment remains at port 4174. Run `node server.cjs` from `../infinity-site` to restart this preview. No install or build step is needed; libraries are vendored with licenses.

## Interaction

Idle light update: a soft acid-yellow emissive wave follows the authored tile rows around the complete loop every ten seconds. Its intensity fades down during brushing, dragging and expansion, then eases back up at rest. Pause freezes its phase and reduced-motion mode retains the still. The shader adds no geometry, textures or draw calls. Parameters are grouped in `IDLE_PULSE` at the top of `../infinity-site/sculpture.js`. [Pulse validation](../infinity-pulse/validation.json) and [two sampled positions](../infinity-pulse/pulse-a.png) document the update; the second position is [here](../infinity-pulse/pulse-b.png).

Brush the sculpture to repel a local patch of tiles; move away to let the springs restore it. Click the sculpture or Expand button to release the full assembly; click again to reassemble. Drag to rotate with damped inertia. Reset restores orientation and reassembles. Pause freezes motion and disables interaction. Expand, Reset and Pause are keyboard accessible.

Fine-pointer devices load live WebGL. Coarse-pointer mobile, reduced-motion and save-data use a Blender-rendered still without loading Three.js or the GLB. Software rendering, missing assets, graphics-context loss and sustained low performance use the still. Motion pauses while the scene is offscreen or the page is hidden. Pixel density is capped at 1.5 and rendering at 60 fps.

## Blender stages and deliverables

All stages completed: contract/reference, graybox silhouette and crossover, primary tile lattice, bevel and normal refinement, three intentional material surfaces, studio lighting/polish, export and fresh-import validation. The shape deliberately follows an infinity loop rather than matching the generated toroidal-knot mockup exactly.

- [Deterministic source](build.py)
- [Editable Blender project](infinity.blend)
- [Runtime GLB](infinity.glb)
- [Authored metrics](authored-metrics.json)
- [Fresh-import metrics](import-validation.json)
- [Hero render](hero.png)
- [Six imported views](contact-sheet.jpg)
- [Browser interaction report](browser-validation.json)
- [Browser test source](verify_browser.py)
- [Idle browser view](browser-idle.png), [local scatter](browser-brush.png), [expanded state](browser-expanded.png), [dragged state](browser-dragged.png)

Blender 5.2.1 LTS generated 1,792 linked tiles using one shared mesh with three material groups. The GLB is 373,240 bytes. The browser turns the imported groups into three instanced draw calls, totaling 336,896 triangles. No rendered video or image frame sequence is downloaded.

## Evidence and limits

Authored and imported piece and triangle counts match. Coordinates and transforms are finite, materials and UVs survive, and no degenerate faces were found. Exported normal/UV seams create raw split edges; after welding coincident vertices, the tile is manifold. The hero and all six imported views were opened and reviewed for silhouette, crossover clearance and finish.

Hardware-backed Chrome on RTX 5090 measured about 59.8–60 fps at tested desktop, Retina and narrow-pane sizes. The brush test affected 218/1,792 tiles; after leaving, maximum displacement returned below 0.000001 scene units. Checks passed click expansion, keyboard reassembly, drag without toggling, reset, pause, offscreen pause, rapid toggles, preference changes, context loss, missing asset fallback and mobile still-only behavior. No JavaScript or console errors were recorded. ANGLE reported a non-fatal precision warning while compiling the environment shader.

This is an art-directed spring simulation, not magnetic-field physics or a rigid-body collision solver. Tiles can overlap during disturbance; lighting uses studio environment maps rather than dynamic ray-traced inter-tile shadows. Real-time materials differ from the Cycles still. Physical phones, Safari and integrated GPUs have not been tested. This is a local demo, not a public deployment.
