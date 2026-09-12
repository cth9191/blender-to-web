# Prompt library

## Exact recovered prompts

The original saved image-generation prompts and their outputs are preserved in:

- `assets/reference-project/outputs/hero-concepts/prompts.md`
- `assets/reference-project/outputs/landing-page-mockups/prompts.md`

Paths above are relative to the skill root. The authored infinity brief is `assets/reference-project/outputs/infinity-sculpture/contract.md`. These are source records, not a full transcript of every model/tool call. The prompts may refer to other concept images not bundled here; the magnetic sculpture reference and four approved landing mockups are included.

## Reusable recipes written after this project

These are new distilled starting prompts, not verbatim prompts from the original session.

### Concept

Create a website hero concept for [product/story]. Center it on [sculpture] with a clear silhouette at [target viewport]. Its intended interaction is [idle/hover/click/drag]. Explore [material roles and palette], leaving deliberate room for [headline/CTA placement]. Make the concept plausible to build in Blender and render interactively. Include a still-image composition for [mobile behavior]. Treat the approved concept as the visual contract, not as proof of implementation.

### Blender asset

Build [approved sculpture] using reproducible Blender Python, keeping an editable .blend and an efficient GLB. Define parts, stable IDs, rest transforms and material roles that the browser will need. Reuse shared geometry for repeated pieces. Check silhouette and camera in a graybox, then finish bevels, normals, materials and lighting. Fresh-import the export, compare authored/imported metrics and inspect fixed views. Record Blender version and rendering backend. Target [device and measured budget], not arbitrary maximum detail.

### Living browser hero

Use $blender-to-web to turn [asset] into a live hero. Implement [specific interaction] using [appropriate representation], preserving immutable rest poses and distinguishing hover, click and drag. Recreate lighting deliberately and compare browser captures to the visual reference. Include pause, lifecycle cleanup and [fallback behavior]. Verify the actual runtime on [devices/viewports] and report frame timing and payload with device context.

### Evolve this workflow

Use $blender-to-web and the included infinity reference to create [new concept]. Reuse the export/runtime/verification method, while designing the new geometry and motion contract for this concept. First identify what can be reused and what must change. Preserve a working baseline; verify the new exported asset and the interactive result. Do not imply Blender constraints or physics transfer unless demonstrated.
