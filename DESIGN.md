# Aureate Institutional Design System

## Core Philosophy
This design system is engineered for EstateX to evoke an atmosphere of exclusive wealth management and institutional stability. The aesthetic is rooted in **Modern Minimalism** with a focus on "de-boxed" layouts—removing traditional card containers in favor of expansive negative space and structural hairlines.

The personality is disciplined, quiet, and authoritative. Visual interest is generated through the interplay of deep blacks, refined metallics, and precision typography rather than decorative ornamentation.

## Colors
The palette is anchored by a "True Black" background to provide maximum contrast for the gold accents.

- **Primary Gold (#C5A059):** A muted, champagne-leaning gold used for primary actions and brand signifiers.
- **Accent Gold (#D4AF37):** A more saturated gold reserved exclusively for small "glow" highlights and high-priority status indicators.
- **Neutrals:** Deep charcoals and blacks used for tonal layering.
- **Hairlines:** Borders use the primary gold at 20% opacity for structural guidance.

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#050505` | Absolute base |
| Surface | `#0D0D0D` | Overlays / Modals |
| Primary | `#C5A059` | Action nodes / Titles |
| Accent | `#D4AF37` | High-fidelity highlights |
| Outline | `#9A8F80` | Subdued hairlines |

## Typography
Dual-font strategy for technical precision and legibility.

- **Space Grotesk:** Headlines, Data Labels, Navigation.
- **Inter:** Body copy, secondary descriptions.

### Hierarchy
- **Display:** 48px / 300 / Space Grotesk
- **H1:** 32px / 400 / Space Grotesk
- **H2:** 24px / 400 / Space Grotesk
- **Body:** 16px / 400 / Inter
- **Label Caps:** 12px / 500 / Space Grotesk / 0.1em tracking

## Geometry & Spacing
- **Corner Radius:** 0px (Strictly Sharp)
- **Spacing Unit:** 4px
- **Layout:** Open Institutional (No boxes, only hairlines)

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Subtle Glows** (20px radial blur at 10% opacity) rather than drop shadows.

## Components

### Buttons
- **Primary:** Solid Gold (#C5A059), black text, sharp corners.
- **Secondary:** Ghost style, 1px gold hairline.

### Input Fields
- **De-boxed:** Bottom-border only (hairline gold), no four-sided boxes.

### Cards
- Defined by a top-border hairline and generous bottom padding. No background fill.
