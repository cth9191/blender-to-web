# Workflow and decisions

## Choose the output before modeling

| Desired behavior | Blender responsibility | Browser responsibility |
| --- | --- | --- |
| Cursor-facing object | Finished geometry and material roles | Pointer mapping and damped orientation |
| Repeated tiles, petals or plates | Shared mesh, stable part IDs, rest transforms | Instanced transforms and bounded springs |
| Robot arm or face | Separate rigid joints or skin, rig and constraints as needed | Joint limits, target tracking, optional IK; rebuild Blender constraints that do not export |
| Fur or soft surface | Groom/rest shape and reduced guide data | Guide solver and vertex deformation; collision support only if implemented |
| Fixed cinematic motion | Bake/export supported transforms or render video | Playback or scrubbing; no claim of live physical response |

These are routes for future work. Only the tiled infinity and guide-driven fiber route were exercised here; a robot/face system still needs its own implementation and validation.

## Build sequence

1. Define a visible contract: silhouette, material roles, room for copy, camera, motion at rest, hover/click/drag behavior, mobile intent. Resolve composition early with a mockup or graybox.
2. Create a deterministic Blender scene. Refine silhouette first, then bevels, normals, surface detail and lighting. Keep the build script and .blend together.
3. Export the data needed by the runtime. Preserve mesh sharing and object identifiers; do not bake dense animated geometry when a smaller browser representation will achieve the effect.
4. Fresh-import the GLB. Compare mesh/part/triangle/material counts and finite transforms; inspect multiple views. Export seam splits are not automatically bad topology: analyze welded geometry before concluding the source is broken.
5. Reconstruct the rendering deliberately. Set color space, tone mapping, exposure, environment and material overrides. Compare browser screenshots to Blender renders at consistent camera and viewport settings.
6. Implement interactions in a separate layer, retaining immutable rest poses. Test gesture separation and return to rest before tuning dramatic motion. Add low-cost ambient movement only after interaction is stable.
7. Integrate the page. Set bounds and camera for the actual hero size. Use one scene through scroll storytelling where practical. Text should visibly progress with the scroll if the user expects to move down the page.
8. Verify at representative viewports, graphics failure, reduced motion and pause. Record measured environment, not just a claim that it is smooth. Keep a small before/after capture set for corrections.

## Tool choice

Deterministic Blender Python is the source of truth. Background CLI execution is useful for reproducible builds, exports and renders. An available Blender MCP can inspect or operate an open scene; computer use can verify the authored scene visually. Neither is required merely to run a script. Discover currently available capabilities rather than claiming MCP or native computer control exists.

The reference was built with Blender 5.2.1 LTS and NVIDIA OptiX. Its render scripts explicitly request OptiX: adjust backend selection for other hardware before rerunning. Node serves the browser project; Three.js and font files are vendored locally with license notices.

## Lessons that changed this result

- An image warped by cursor position does not become a turning 3D head. Use geometry or a frame sequence intentionally, and describe the difference.
- glTF moves supported scene data; it does not ship Blender hair dynamics, node graphs or all constraints.
- Preserve repeated mesh sharing. The source object count is not the desired draw-call count.
- Light can travel through instance metadata and shader emission without new geometry or video.
- Click, drag and brushing should be different gestures. Avoid accidental toggles after dragging.
- The high-quality still and real-time material can differ; inspect the browser rather than relying on the Blender render alone.
- A pinned sculpture works better here when text travels upward with native scroll instead of only crossfading.
- Saved scripts and asset contracts are more reproducible than a chat transcript alone.
