# Working infinity reference

The complete runnable project is under `assets/reference-project/` relative to the skill root. Its internal `outputs/` layout is preserved so saved Blender scripts resolve their files.

## Data contract

`outputs/infinity-sculpture/build.py` creates a depth-separated infinity centerline, samples its arc length, and places 128 rows x 14 radial tiles = 1,792 linked instances. One beveled tile has 188 triangles and three material groups. Objects use `Tile_000_00`-style IDs. The GLB is 373,240 bytes; total instantiated triangles are 336,896.

`outputs/infinity-site/sculpture.js` groups imported mesh primitives by shared geometry/material, creating three InstancedMesh batches. It keeps base positions, quaternions and scales, and checks the expected 1,792 objects per group. Loop phase is derived from the authored row divided by 128. Changing ROWS/RINGS requires updating these expectations, the ID pattern if needed, and ordering assumptions. Keep all material batches aligned to the same tile identity; validate matching order if the exporter changes.

The exporter selects only sculpture geometry. Camera and studio lighting remain in the .blend. Browser studio panels, PMREM, tone mapping and material overrides are intentionally authored separately.

## Motion and limits

Typed arrays store position offsets, velocities and targets. A fixed 120 Hz spring step drives bounded scatter and return. Pointer rays are converted into assembly-local coordinates. Click expands/reassembles; movement beyond a gesture threshold becomes a drag. Scroll controls a separate scatter amount and assembly turn.

`IDLE_PULSE` controls a ten-second emissive wave. A loop-phase instance attribute feeds a shader patch, with reduced glow during interaction. The patch relies on vendored Three.js shader include names: inspect/test it when upgrading Three.

This is an art-directed spring simulation. There are no rigid-body collisions, magnetic-field calculations or dynamic ray-traced inter-tile shadows. About 60 fps on an RTX 5090 is historical evidence only. Pixel ratio is capped at 1.5 and rendering at 60 fps in this example.

## Recreate and evolve

Run `python scripts/new_project.py DESTINATION` from the skill folder. Start `node outputs/infinity-site/server.cjs` inside the copied destination (default port 4175; set PORT if occupied). The prepared page runs without Blender.

To rebuild assets, run Blender with `--background --python outputs/infinity-sculpture/build.py -- --graybox`, then without `--graybox`, then `--background --python outputs/infinity-sculpture/validate.py`. Scripts reset their Blender scene and overwrite outputs beside the scripts: use a copied project. Run `outputs/landing-build/render_macro.py` similarly for the macro render. Copy rebuilt infinity.glb into the site's assets and hero.png to assets/poster.png. Convert macro.png to assets/macro.webp if rebuilding that render. Existing ready-to-run assets are already supplied.

Browser verification scripts require Python Playwright, its matching browser setup and a running server on 4175. The hardware tests use installed Chrome and Windows D3D11 flags; adapt those flags elsewhere. Do not run a test on 4175 and mistake a different project's existing server for the copied project.

Good first variations: centerline curve, tile silhouette, tile spacing, material palette, pulse speed/width, scatter radius, stiffness/damping and camera framing. Change one family at a time and compare rest/interaction captures. A robotic arm or face needs a different geometry and motion adapter.
