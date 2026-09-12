# APERTURE / magnetic infinity

Run `node server.cjs` and open http://127.0.0.1:4175/. No dependency installation required. The shell demo remains at port 4174.

Brush to scatter, click to expand/reassemble, drag to rotate. Buttons provide keyboard control. Mobile and reduced-motion contexts use the still.

The full landing page includes a desktop scroll sequence that scatters and reconnects the sculpture, three prepared notebook answers with source links and copy controls, a Blender-rendered macro section, and a final demo link. Narrow layouts use normal-flow story sections. The notebook is fictional and does not call an AI service.

See [landing-page verification and review](../landing-build/README.md), [design system](DESIGN.md), and [source assets and technical limitations](../infinity-sculpture/final_report.md). `sculpture.js` handles Three.js rendering and spring interaction; `app.js` manages eligibility, scrolling, pause, fallbacks, and the prepared notebook. All assets are local.
