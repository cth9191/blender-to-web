---
name: APERTURE
description: A charcoal connection studio with machined metal, tight Inter, and selective acid yellow.
colors:
  ink: "#101214"
  paper: "#f2f1e8"
  yellow: "#f5f400"
  muted: "#b9bbb3"
  line: "#f2f1e82b"
  notebook: "#101510"
  product: "#0c100e"
  primary-text: "#11140d"
  primary-hover: "#ffff88"
typography:
  display:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(78px,7.3vw,136px)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-.065em"
  headline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(55px,5.1vw,96px)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-.055em"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(27px,2.8vw,48px)"
    fontWeight: 400
    letterSpacing: "-.045em"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "18px"
    lineHeight: 1.6
  answer:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(15px,1.4vw,22px)"
    lineHeight: 1.55
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "10px"
    letterSpacing: ".2em"
  action:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.4
rounded:
  pill: "99px"
  notebook: "16px"
  notebook-mobile: "12px"
  citation: "3px"
spacing:
  page: "4.1vw"
  page-tablet: "5vw"
  page-mobile: "7vw"
  control-gap: "8px"
  citation-gap: "24px"
  chapter-gap: "12px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.primary-text}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "18px 25px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "#d3d5cc"
    rounded: "{rounded.pill}"
    padding: "15px 24px"
  button-outline-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-control:
    backgroundColor: "transparent"
    textColor: "#c3c6b9"
    rounded: "{rounded.pill}"
    padding: "10px 13px"
  button-copy:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "9px 14px"
  question-tab:
    backgroundColor: "transparent"
    textColor: "#b8bdaf"
    rounded: "0"
    padding: "10px 0 18px"
  question-tab-selected:
    textColor: "{colors.paper}"
  notebook:
    backgroundColor: "{colors.notebook}"
    rounded: "{rounded.notebook}"
  citation-number:
    backgroundColor: "{colors.yellow}"
    textColor: "#11150c"
    rounded: "{rounded.citation}"
    padding: "7px 0"
    width: "28px"
---

# Design System: APERTURE

## Overview

**Creative North Star: "The Connection Studio"**

A dark, spacious studio gives the existing machined infinity sculpture room to communicate connection. Warm off-white Inter supplies the editorial voice; acid yellow marks actions, evidence, and the sculpture's inner surfaces. This descriptive name records the approved world rather than introducing a new direction.

Oversized, tightly spaced statements alternate with a compact source notebook. The material character comes from the actual sculpture and its rendered close-up. Interaction makes the object's assembly legible, while still imagery preserves the same identity when motion is unavailable.

**Key Characteristics:**
- Charcoal surfaces, warm off-white type, and selective acid yellow.
- Regular-weight Inter with tight display tracking and spacious section labels.
- Real machined-metal imagery, fine rules, and restrained rounded controls.
- Visible source relationships and equivalent live or still presentations.

## Colors

The palette pairs warm light text with green-tinted charcoal surroundings and one vivid yellow accent. Frontmatter values are normative; descriptive names below explain their use.

### Primary

- **Acid Yellow** (`yellow`): primary actions, the headline period, chapter dots, selected-tab rules, citation numbers, and source-connection endpoints.
- **Pale Yellow Hover** (`primary-hover`): the primary action's hover response.
- **Deep Olive Action Text** (`primary-text`): dark lettering on yellow actions.

### Neutral

- **Studio Charcoal** (`ink`): page foundation and text on light outline-button hover states.
- **Warm Paper** (`paper`): main typography and selected question text.
- **Sage Gray** (`muted`): explanatory story copy and original notes.
- **Paper Hairline** (`line`): translucent dividers and quiet control boundaries.
- **Notebook Charcoal** (`notebook`): the source-and-answer container.
- **Deep Studio Green** (`product`): the product section's recessed field.

**The Connection Accent Rule.** Use yellow to identify an action, an active relationship, or an authored sculpture surface; preserve the broad charcoal field.

## Typography

**Display and body font:** locally hosted Inter, with Arial and sans-serif fallbacks. The implementation loads its regular face.

Large type is light in weight and tight in spacing. Supporting prose stays quieter, while uppercase chapter and context labels use wider tracking to distinguish navigation through the narrative.

- **Display:** the hero's three-line statement uses the frontmatter display role.
- **Headline:** story statements use the headline role; the product heading uses `clamp(56px,5.65vw,106px)`, line-height `1.03`, and tracking `-.06em`.
- **Title:** answer headings use the title role; source titles remain small and regular.
- **Body:** story explanation uses the body role. Answer prose uses the answer role and a maximum line length of `65ch`.
- **Label:** chapter labels use the label role; context and answer labels use nearby sizes (`11px` and `9px`) with the same tracking.
- **Action:** primary links use the action role, supported by small arrow icons.

**The Tight Display Rule.** Preserve regular weight and negative tracking in large headings; reserve expanded tracking for small labels and the wordmark.

## Layout

The page uses full-width sections with responsive side padding from the spacing tokens. Desktop pairs editorial copy with a large object, then uses a source column and answer column (`27% 73%`) inside the notebook. The product section has generous vertical padding (`110px` above, `120px` below); the notebook carries its own denser rhythm.

At widths up to `1000px`, side padding increases, hero copy moves above the sculpture, the outlined navigation action disappears, and the notebook uses `28% 72%` columns. At widths up to `600px`, the notebook stacks with source choices across its top, original notes become one column, story sections stack, and the first navigation link disappears. The mobile hero display is `67px`; product and final headings are `44px`.

The sticky narrative runs only with a working live sculpture, a fine pointer, motion allowed, data saving off, and a viewport wider than `1000px`. It occupies `340svh` with a `100svh` sticky scene. Native scrolling fades and offsets story copy while moving the sculpture between compositions. Other presentations show both story statements in document flow. Inactive story overlays are inert and hidden from assistive technology.

## Elevation & Depth

Interface containers are flat: fine translucent borders and small tonal shifts establish structure without card shadows. Object depth comes from the sculpture's charcoal, titanium, and yellow materials, studio illumination, and a soft ground treatment. The hero uses a radial dark-green backdrop; the macro section uses a dark directional overlay for readable text.

The only shadow-like CSS treatment is the sculpture's elliptical ground plane: `background:#0007` with `filter:blur(22px)`. It is scenery, not a reusable control elevation. Material colors remain authored in `sculpture.js`: charcoal `#353b3b`, titanium `#87918b`, yellow `#ecf000`, and yellow emission `#b6c000`.

## Shapes

Actions and small utility controls use pill outlines. The notebook uses gently rounded outer corners, reduced on mobile; citation number markers use a small radius. Source-page miniatures remain rectangular. Hairline rules, tiny circular endpoints, and fine Bézier source links echo the sculpture's repeated tiles and continuous loop without turning every element into an illustration.

## Components

### Buttons

Primary actions pair acid yellow with dark text and an upward-right inline arrow. Hover lightens the fill. The outlined navigation action inverts to warm paper with charcoal text. Utility controls remain transparent with quiet borders; sculpture-control hover turns the border and lettering yellow. Copy feedback changes the button label.

Keyboard focus on buttons, links, and summaries uses a yellow outline (`2px`) offset by `6px`. Disabled buttons use opacity `.4`. Mobile primary actions reduce padding to `15px 20px` and type to `12px`.

### Navigation

The widely tracked APERTURE wordmark balances a compact right-hand navigation row. Desktop links use `14px` text and a `44px` gap. Responsive layouts progressively remove secondary links while preserving the demo route. A focus-revealed skip link leads directly to the notebook.

### Notebook and question tabs

One bordered container joins source context to answers. Three prepared-question buttons share a bottom rule; the selected question uses warm paper text and a yellow bottom border (`3px`). Tabs support arrow keys, Home, and End with a single tab stop. Changing questions replaces the prepared answer and citations and updates the linked-source state.

The footer explicitly labels the fictional prepared example. There is no text-input component or live answer-generation state in this implementation.

### Source rows and citations

Desktop source rows pair paper miniatures with a title and compact explanation. Linked sheets gain a yellow border; on mobile the title carries the linked-state color. Citations use yellow numbered markers and readable supporting excerpts. Hover underlines the source title. Activating a source or citation opens the original notebook, highlights its heading, scrolls to the note, and moves focus there.

On wide screens, fine yellow SVG curves connect source rows to their cited markers. The curves recompute with the layout and disappear at the tablet breakpoint. These are evidence relationships, not ornament behind unrelated content.

### Infinity sculpture and macro image

Preserve the real 1,792-tile assembly, its differentiated surfaces, and its supported interactions: hover disturbance, click expansion and reassembly, drag rotation, reset, and pause. A soft light pulse travels around the authored tile order every `10s` and fades during interaction. The live canvas fades in over `.5s`; the supplied poster remains the fallback.

Coarse pointers, reduced-motion preferences, data saving, graphics failures, or sustained rendering trouble use the still presentation. Reduced motion also removes CSS transitions and smooth scrolling. The lower macro section uses the supplied rendered tile image; the final section returns to the intact sculpture.

## Do's and Don'ts

### Do:

- Do preserve the approved charcoal, warm off-white, acid-yellow, and Inter identity.
- Do use the existing sculpture and its material detail as the image authority.
- Do keep question selection, citations, and original notes visibly connected.
- Do retain keyboard focus, inactive-overlay isolation, and a usable still presentation.
- Do keep prepared notebook examples visibly labeled as fictional.

### Don't:

- Don't replace the real sculpture with a generic infinity icon or unrelated 3D asset.
- Don't turn the restrained notebook into a grid of floating shadow cards.
- Don't add a new accent family or a competing display typeface.
- Don't hide the source relationship behind purely decorative motion.
- Don't imply live AI generation or commercial proof in this design demonstration.


### Scroll text refinement

Desktop text moves upward by native scroll distance inside the pinned scene. The following statement enters from below; the final statement settles beside the connected sculpture. Edge masks keep traveling text clear of navigation and controls. Fades only soften entry and exit. Sculpture timing remains independent. Narrow and reduced-motion layouts use normal document flow.
