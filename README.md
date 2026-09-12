# Blender to Web

A reusable skill plus a working reference for living 3D website heroes. Built from the APERTURE infinity and fiber experiments, captured September 11, 2026.

**Start here:** [SKILL.md](SKILL.md) for agent instructions, [workflow](references/workflow.md) for the decisions, and [prompt recipes](references/prompts.md) for new projects.

The bundle contains the editable infinity .blend, deterministic Python builder, GLB, ready-to-run Three.js website, local dependencies with license notices, concept prompts, selected visual evidence and validation records. It includes the later text-scroll refinement. Fiber source extracts preserve the earlier guide-driven deformation technique without claiming to be a complete second application.

## Use

Install this folder as `blender-to-web` under your Codex skills directory, excluding `.git` if copying a checkout. Invoke `$blender-to-web` with a concept. Automatic skill discovery remains enabled; a fresh task may be needed for the new skill to appear.

Create a fresh working copy:

```powershell
python scripts/new_project.py C:/path/to/new-project
cd C:/path/to/new-project
$env:PORT = '4180'
node outputs/infinity-site/server.cjs
```

Open http://127.0.0.1:4180/. Node is the only requirement to view the supplied demo. Blender and Python Playwright are only needed for rebuilding or verification. See [infinity anatomy](references/infinity.md) for those commands and environment limits.

## What is reusable

The Blender-to-browser data contract, instance batching, local pointer forces, gesture separation, spring return, shader pulse, lifecycle/fallback design and evidence loop. The infinity shape, 1,792 pieces, yellow palette and fictional AI notebook are example-specific.

## Repository status

This is prepared as a local repository snapshot. No GitHub remote or public deployment is assumed. Keep code, prompts, source scripts and small GLBs versioned. Use Git LFS or release artifacts if future .blend files, renders or videos become large. This snapshot intentionally excludes source videos, cookies, credentials and unrelated workspace files. No license is granted here for the authored project; choose one deliberately if publishing for others to reuse. Bundled Three.js and Inter notices remain with their files.

Historical metrics are labeled with device and limitations in their reports. They are not freshly reproduced Blender benchmarks for this package. `package-manifest.json` inventories the packaged files and hashes; `package-validation.json` records packaging checks.
