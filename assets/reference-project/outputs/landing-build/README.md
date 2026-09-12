# APERTURE landing page

The four approved mockups are implemented at http://127.0.0.1:4175/. The existing live infinity sculpture remains the centerpiece, with its ten-second light pulse, hover scatter, click expansion, drag rotation, reset and pause controls.

On wide desktop screens, native scrolling separates and reconnects the sculpture through two story statements. There is one WebGL renderer, paused when offscreen. Narrow screens show the story in normal document flow. Coarse-pointer, reduced-motion and data-saving visitors receive a still image; a graphics failure also falls back to the still.

The notebook has three prepared questions, keyboard-operable tabs, source-to-citation curves, expandable source notes and a working copy button. All answers and sources are fictional examples. There is no AI backend or data collection. The macro image was rendered from the actual Blender scene using render_macro.py.

## Verification

Hardware-accelerated Chrome checks passed at 1672×941, 1280×720, 780×900 and emulated 390×844 mobile. Verified scroll transitions and reassembly, expansion, inactive-story focus exclusion, all notebook answers, keyboard tabs, copy, source navigation, final CTA, pause, offscreen suspension, reduced motion, no mobile GLB request, no horizontal overflow and missing-asset fallback. No JavaScript errors were recorded. A final UTF-8 repair corrected the interaction hint punctuation observed in the app pane.

Observed animation was about 60 fps on the local RTX 5090, with 1,792 instances and three draw calls. This does not establish performance on integrated graphics or physical mobile devices; Safari was not tested. The motion uses a spring solver, not collision-based magnetic physics. The scroll scene starts above 1000 px viewport width; widen the app pane to see it.

## Finish review

Final disposition: **ship**. See [review.md](review.md).

| Finding | Disposition |
| --- | --- |
| Stretched still images | Fixed with preserved image aspect ratios |
| Disconnected source lines | Fixed with source-to-citation SVG curves |
| Macro composition | Fixed desktop and mobile crops |
| Yellow emphasis on “counts.” | Restored |

The actual sculpture's materials are intentionally preserved; generated mockups guided composition, not exact pixel matching. Design tokens and components are documented in [DESIGN.md](../infinity-site/DESIGN.md) and its .impeccable/design.json sidecar.

Evidence: [validation.json](validation.json), desktop-hero.png, desktop-story-scattered.png, desktop-story-connected.png, desktop-product.png, desktop-detail.png, and the mobile/pane screenshots in this directory. Approved direction: [direction.md](direction.md).
