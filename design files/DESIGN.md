---
name: Sovereign Light Terminal
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4e4639'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7f7667'
  outline-variant: '#d1c5b4'
  surface-tint: '#775a19'
  primary: '#775a19'
  on-primary: '#ffffff'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#e9c176'
  secondary: '#a33800'
  on-secondary: '#ffffff'
  secondary-container: '#cd4800'
  on-secondary-container: '#fffbff'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a7a5a5'
  on-tertiary-container: '#3c3b3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.01em
spacing:
  unit: 4px
  gutter: 16px
  margin-sm: 16px
  margin-md: 32px
  margin-lg: 64px
  container-max: 1440px
---

## Brand & Style

This design system embodies a high-precision, institutional aesthetic tailored for technical excellence. It transitions from a dark-mode legacy to a sophisticated Light Mode that prioritizes extreme legibility, rapid data processing, and a "technical document" feel.

The visual style is a blend of **Technical Minimalism** and **Refined Brutalism**. It utilizes a strict adherence to 1px hairlines, zero-radius geometry, and an expansive use of white space to create a structured, authoritative environment. The goal is to evoke the feeling of a modern financial instrument: cold, precise, and highly functional, yet elevated by luxury metal accents.

## Colors

The palette is anchored in a high-contrast monochromatic base, punctuated by prestige accents. 

*   **Primary Gold (#C5A059):** Reserved for high-value interactions, success states, and brand iconography. It represents stability and institutional wealth.
*   **Action Orange (#FF5C00):** Used for primary calls-to-action, notifications, and "live" data indicators to ensure immediate visual acquisition.
*   **Neutrals:** The background uses pure white (#FFFFFF) to maximize contrast, while surfaces use a subtle silver-gray (#F0F0F0) to define modular boundaries without visual heaviness.
*   **Typography:** All primary text is set in Deep Charcoal (#111111) to ensure WCAG AAA compliance and sharp rendering on high-density displays.

## Typography

The typographic system utilizes a dual-font approach to balance character with utility.

*   **Space Grotesk** is used for headlines and data labels. Its geometric, slightly eccentric terminals provide a futuristic, technical edge that differentiates the system from standard SaaS products.
*   **Inter** handles all long-form body text and interface controls. It is chosen for its exceptional legibility and neutral tone, ensuring that the interface remains unobtrusive during heavy data analysis.

For mobile, `headline-xl` scales down to 32px, and `headline-lg` scales to 24px to maintain layout integrity on narrower viewports.

## Layout & Spacing

This design system employs a **Strict Grid Model** based on a 4px baseline shift. 

*   **Grid:** A 12-column fluid grid is used for desktop (1440px max-width), transitioning to 8 columns for tablets and 4 columns for mobile.
*   **Hairlines:** Instead of large margins, components are often separated by 1px solid borders (#E5E5E5). This maximizes screen real estate for data-heavy views.
*   **Padding:** Standardized internal padding for cards and containers is 24px (6 units), creating a sense of "breathable density" where information is compact but never cramped.
*   **Alignment:** All elements must align to the hard grid lines. Avoid centered layouts for technical data; use left-aligned or justified-grid patterns.

## Elevation & Depth

In this system, depth is communicated through **Tonal Layering** and **Technical Outlines** rather than shadows. 

*   **Flat Surface Architecture:** Level 0 is the white background. Level 1 surfaces (cards, sidebars) use #F0F0F0. Level 2 (inputs, active states) use #F8F8F8 with a 1px #111111 border.
*   **Shadows:** Generally avoided. If necessary for temporary overlays (modals), use a sharp, 0-blur shadow: `4px 4px 0px rgba(0,0,0,0.05)`.
*   **Hairlines:** 1px solid lines define the edges of every functional zone. This creates a "blueprint" feel that emphasizes structure over atmosphere.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI element—from buttons and input fields to large container cards—must have a 0px border radius. This reinforces the "Terminal" brand identity and suggests a rigorous, no-nonsense environment. The only exception to this rule is the use of circular icons or circular avatars, which provide a necessary organic counterpoint to the rigid grid.

## Components

*   **Buttons:** Primary buttons are Solid Orange (#FF5C00) or Gold (#C5A059) with white text, 0px radius, and a 1px black bottom-border for a subtle tactile "press" effect. Secondary buttons are transparent with a 1px #111111 border.
*   **Input Fields:** Use #F8F8F8 background with a 1px #E5E5E5 bottom border. On focus, the border becomes #111111 and thickens to 2px.
*   **Cards:** Pure white background with a 1px #E5E5E5 border. No shadows. Titles within cards use `label-caps` in the Primary Gold.
*   **Chips/Tags:** Rectangular (0px radius). Use light gray fills (#F0F0F0) with dark text. Status indicators use small 8px solid circles next to the label.
*   **Data Grids:** Row headers use #F8F8F8. Vertical 1px hairlines are required between columns to facilitate eye-tracking across complex data sets.
*   **Terminal Modules:** For command-line or code snippets, use #111111 background with Gold (#C5A059) text to maintain the "Sovereign" heritage within the light-themed shell.