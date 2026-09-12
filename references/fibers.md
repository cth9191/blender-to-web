# Fiber experiment: architecture and boundaries

Before infinity, the session built an opening shell with fibers. This provides a second motion pattern, not a requirement to use fur on new designs.

The exported rigid geometry used 36,480 triangles. Each shell retained 22,000 fiber paths, reconstructed with eight rings per strand as instanced GPU geometry. Full quality was about 1.884 million triangles in nine draw calls. The CPU simulated 128 guides per shell with fixed-step springs; root-weighted GPU bending spread guide motion to nearby strands. Opening the shells used a separate spring.

The earlier 171 MB animated GLB was replaced by about 6.44 MB of live assets. These are measurements from that example, not promises for new hair assets. This did not reproduce Blender Hair Dynamics or strand collisions. Low performance could reduce quality and fall back to video; reduced-motion/mobile used a still.

Read `fiber-source/export_live.py`, `springs.js` and `live-hero.js` to study the data reduction and deformation. `README.md` and JSON reports are preserved historical source extracts. Their original relative references require the old shell project, so these extracts are not a standalone runnable demo. The infinity project is the self-contained runnable reference in this package.
