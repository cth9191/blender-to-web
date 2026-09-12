# APERTURE: live 3D hero

Open http://127.0.0.1:4174/. Click the sculpture to open or close it; drag while closed to rotate it with damped inertia. Hover brushes the fibers without rotating or opening the sculpture. The footer toggle also supports keyboard operation. The sculpture is scaled down to fit the desktop hero. Pause freezes all motion. The previous video website is at http://127.0.0.1:4174/rendered.html.

## Implementation

Three.js 0.186.0 / WebGL 2 renders the exported Blender shell and core geometry (36,480 rigid triangles). Each shell retains 22,000 fiber paths from the original groom. Eight rings per strand are reconstructed as GPU-instanced geometry. Full quality draws approximately 1.884 million triangles in nine draw calls.

The CPU simulates 128 guides per shell using damped springs at a fixed 120 Hz integration step. Root-weighted GPU bending distributes their motion to nearby fibers. Cursor proximity, velocity and assembly motion drive the forces. Shell opening uses a separate spring. This is an interactive approximation, not Blender's Hair Dynamics engine: it does not solve collisions or individual strand-to-strand interactions. Studio environment maps provide reflections; the core uses an art-directed map rather than ray-traced reflections of the moving shells.

Rendering is capped at 60 fps and pixel density at 1.5. Sustained low performance reduces pixel density and strand count, then falls back to the video if needed. Software rendering also uses video. Fine-pointer desktops, including narrow panes, use live 3D. Coarse-pointer mobile, reduced-motion and save-data use a still. Motion stops offscreen, in hidden documents, during the sample dialog and when manually paused.

Live assets total 6.44 MB uncompressed; local Three.js modules total 2.29 MB. The development server does not compress responses. The original 171 MB animated GLB is not downloaded. No MP4 is requested when live initialization succeeds. Libraries and assets are local, with licenses included.

## Validation

The original browser checks (before click/drag controls) passed cursor rotation, center reveal, measurable fiber bending, return to rest, pause/resume, offscreen pause, modal pause, reduced-motion unload/reinitialization, graphics-context-loss fallback and missing-asset fallback. Narrow desktop, normal desktop and Retina were checked. Mobile and reduced-motion contexts requested no Three.js, 3D assets or MP4.

Hardware-backed Chrome testing on the RTX 5090 measured approximately 59–60 rendered fps after the cap. Integrated GPUs, physical phones and Safari have not been tested. Spring convergence matched at 30, 60 and 144 input update rates; strong alternating forces and long gaps stayed finite and bounded.

Fresh Blender GLB import retained rigid mesh counts and materials. Six imported views were rendered and reviewed. Fiber appearance and deformation were inspected in the browser. Chrome/ANGLE emitted an environment-shader precision warning; the successful-path test had no JavaScript errors or shader compilation failures.

The live renderer looks different from the path-traced video: fur self-shadowing is approximated, and materials/reflections are tuned for real-time rendering. Both versions remain available.

## Source and evidence

`../aperture-site/live-hero.js`: rendering and interaction. `../aperture-site/springs.js`: guide solver. `../aperture-site/app.js`: lifecycle and fallback control. `../aperture-site/assets/live/`: rigid GLB and groom data.

Run `npm start` from `../aperture-site` to start port 4174; no install/build step is needed. Export and validation scripts use the existing workspace layout. Source Blender projects and the previous animation are preserved.

Evidence: `browser-validation.json`, `import-validation.json`, `export-metrics.json`, `asset-sizes.json`, `rigid-views.jpg`, `interactive-center.png`, `interactive-right.png`, `interactive-brush.png`, `narrow.png`, `retina.png`, `mobile.png`.

## Click and drag update

Current interaction evidence is in `../aperture-click/interaction-validation.json`, with open, closed, rotated and responsive screenshots. Checks cover click closure, drag without accidental opening, keyboard reopening, hover-only fiber response, pause and modal behavior, narrow layout, and still-image fallbacks. The current test script is `../aperture-click/verify_click.py`.
