---
name: Kişisel Alan
description: A cinematic public profile with a focused dark owner studio.
colors:
  dashboard-night: "#090b10"
  dashboard-rail: "#0e1016"
  dashboard-topbar: "#0d0f14"
  dashboard-panel: "#12151c"
  dashboard-field: "#0d0f14"
  dashboard-border: "#282d38"
  dashboard-text: "#edf0f7"
  dashboard-muted: "#a4aaba"
  dashboard-blue: "#789cff"
  dashboard-blue-hover: "#91adff"
  dashboard-button-text: "#0b1020"
  dashboard-published: "#69d6a5"
  dashboard-error: "#26171d"
  dashboard-error-text: "#ffd9df"
  profile-night: "#08090c"
  profile-glass: "#141519"
  profile-text: "#f5f6f8"
  profile-muted: "#c2c5cc"
  profile-blue: "#78a7ff"
  profile-error: "#ff8585"
typography:
  profile-name:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "clamp(2.15rem, 7vw, 2.8rem)"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-0.045em"
  profile-headline:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "clamp(1rem, 2.8vw, 1.15rem)"
    fontWeight: 650
    lineHeight: 1.45
    letterSpacing: "0.01em"
  dashboard-title:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.25rem)"
    fontWeight: 760
    lineHeight: 1.15
    letterSpacing: "-0.045em"
  section-title:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif"
    fontSize: "11px"
    fontWeight: 400
  mono-label:
    fontFamily: "'Lucida Console', 'Courier New', monospace"
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: "0.1em"
rounded:
  control: "7px"
  navigation: "9px"
  preview: "10px"
  panel: "12px"
  profile-link: "12px"
  identity-panel: "18px"
  pill: "999px"
  circular: "50%"
spacing:
  compact: "8px"
  control: "14px"
  panel: "22px"
components:
  dashboard-primary:
    backgroundColor: "{colors.dashboard-blue}"
    textColor: "{colors.dashboard-button-text}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "46px"
  dashboard-primary-hover:
    backgroundColor: "{colors.dashboard-blue-hover}"
  dashboard-secondary:
    backgroundColor: "#191c24"
    textColor: "#e5e8ef"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "39px"
  dashboard-field:
    backgroundColor: "{colors.dashboard-field}"
    textColor: "{colors.dashboard-text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
  dashboard-panel:
    backgroundColor: "{colors.dashboard-panel}"
    textColor: "{colors.dashboard-text}"
    rounded: "{rounded.panel}"
    padding: "22px"
  dashboard-navigation:
    textColor: "#aeb4c2"
    rounded: "{rounded.navigation}"
  live-preview:
    backgroundColor: "{colors.dashboard-panel}"
    textColor: "{colors.dashboard-text}"
    rounded: "{rounded.panel}"
    padding: "17px"
  preview-stage:
    backgroundColor: "{colors.profile-night}"
    textColor: "{colors.profile-text}"
    rounded: "{rounded.preview}"
  profile-link:
    backgroundColor: "{colors.profile-glass}"
    textColor: "{colors.profile-text}"
    rounded: "{rounded.profile-link}"
    padding: "0 14px"
    height: "48px"
  discord-profile:
    backgroundColor: "{colors.profile-glass}"
    textColor: "{colors.profile-text}"
    rounded: "{rounded.identity-panel}"
    padding: "8px 17px 8px 8px"
    height: "72px"
---

# Design System: Kişisel Alan

## Overview

**Creative North Star: "A Quiet Creator Studio After Dark"**

The public profile remains a cinematic, centered space for one personal identity: a portrait, concise introduction, and direct links sit against a near-black field with restrained blue and glass details. The private owner dashboard is a separate, practical dark studio: layered slate surfaces, a persistent section rail, controls for identity, media/color, Discord, and links, and a live profile preview make editing feel focused without changing the public profile's visual identity.

This is a single-owner personal site. The dashboard edits the owner's one profile; it is not a multi-user platform, directory, or marketplace. Its interface favors clear state, compact information, and responsive access over decorative density.

**Key Characteristics:**
- Near-black workspace, layered slate panels, subdued borders, and cool blue actions.
- Fixed desktop rail for Kimlik, Görseller, Discord, and Bağlantılar; horizontal sticky section navigation on smaller screens.
- Profile content and media appear in a live preview that updates as the owner edits, before saving.
- Public profile styling remains dark, centered, and distinct from the editor shell.
- Optional muted profile video yields to the public page's reduced-motion preference.

## Colors

The owner studio uses cool near-black and slate neutrals with a crisp periwinkle action color; the public profile retains its own near-black, glass, and softer blue palette.

### Primary
- **Studio Blue**: The dashboard's save action and selected control accents; a lighter blue marks its hover state.
- **Profile Blue**: Reserved for the public identity highlight rather than the dashboard's action system.

### Secondary
- **Published Green**: A small positive status signal when the profile is live.
- **Error Rose**: Error notices and text use a muted dark-red surface with high-contrast pale copy.

### Neutral
- **Studio Night**: The owner workspace background.
- **Rail Slate**: The desktop navigation rail is slightly lifted from the workspace.
- **Topbar Slate**: A subtly differentiated header band separates breadcrumb and owner actions.
- **Panel Slate**: Editor sections and the preview shell use a raised, dark panel.
- **Field Night**: Inputs sit on a deeper surface within each panel.
- **Slate Border**: Fine, low-contrast borders define sections, controls, and separators without heavy shadows.
- **Studio Text**: Primary editor copy and headings remain soft white rather than pure white.
- **Studio Muted**: Supporting copy, field labels, and secondary navigation stay visibly subordinate.
- **Profile Night / Glass**: The public profile backdrop and translucent identity/link surfaces.
- **Profile White / Muted**: Foreground identity and supporting text on the public dark surface.
- **Profile Error**: A high-visibility error accent on the public profile surface.

### Named Rules
**The Separate Surface Rule.** Keep the dashboard's slate-and-blue control language distinct from the public profile's glass-and-blue identity language; do not restore the retired citron-and-paper dashboard palette.

## Typography

**Display Font:** Segoe UI (with Trebuchet MS, sans-serif fallbacks)  
**Body Font:** Segoe UI (with Trebuchet MS, sans-serif fallbacks)  
**Label/Mono Font:** Lucida Console (with Courier New, monospace fallbacks)

**Character:** A compact, clean sans-serif hierarchy keeps the editor scannable, with restrained negative tracking on profile and dashboard titles. The mono face is limited to small uppercase rail annotations; fields, navigation, and ordinary copy use sans-serif text.

### Hierarchy
- **Profile Name** (750, `clamp(2.15rem, 7vw, 2.8rem)`, 1.05 line-height): The public identity's blue display line.
- **Profile Headline** (650, `clamp(1rem, 2.8vw, 1.15rem)`, 1.45 line-height): An italic short introduction below the public name.
- **Dashboard Title** (760, `clamp(1.7rem, 3vw, 2.25rem)`, 1.15 line-height): The private editor's page heading.
- **Section Title** (700, 16px): Compact labels for the four editing areas.
- **Body** (400, 13px, 1.55 line-height): Dashboard descriptions and concise supporting text.
- **Field Label** (400, 11px): Sans-serif labels above inputs and link fields.
- **Rail Annotation** (400, 9px, 0.1em tracking): Small uppercase mono navigation context.
- **Profile Copy** (400, 14px, 1.7 line-height): The public bio and supporting identity text.

### Named Rules
**The Scannable Type Rule.** Keep the mono face and expanded tracking to compact navigation annotations; use the sans family for labels, content, and actions.

## Layout

On desktop, a full-height 238px sticky sidebar anchors the owner workspace beside a flexible main area. The main content is capped at 1580px and uses a broad editor column beside a 270–330px live-preview column; at 1180px the rail narrows and the preview settles at 290px. Below 980px, the preview moves below the editor. At 720px, the shell becomes a single column and the rail becomes a sticky horizontal section bar; below 520px the brand and navigation occupy stacked rows, editor fields become single-column, and the save action spans the available width. The public profile remains a separate centered column capped at 560px.

## Elevation & Depth

The dashboard communicates hierarchy primarily with nested dark surfaces and fine borders, not large shadows. The live preview is a framed, near-black miniature of the public profile; its media is blurred and shaded so the identity stays legible. The public profile keeps its own soft portrait and glass-control shadows, while sign-in and problem panels use a restrained ambient shadow.

### Shadow Vocabulary
- **Profile Portrait** (`0 14px 48px rgba(0, 0, 0, 0.42)`): Softly lifts the circular portrait from the public backdrop.
- **Profile Glass Controls** (`0 10px 28px rgba(0, 0, 0, 0.18)`): Adds subtle depth to public link controls.
- **Owner Access Panel** (`0 18px 54px rgba(0, 0, 0, 0.24)`): Separates login and access/error panels from the dark canvas.

### Named Rules
**The Layered Surface Rule.** Use tone and border to distinguish editor panels; reserve diffuse shadows for the public profile and access panels.

**The Respectful Motion Rule.** Keep decorative profile video muted and hide it when reduced motion is requested; suppress dashboard transitions under the same preference.

## Shapes

The dashboard uses gently rounded panels (12px), compact controls and inputs (7px), a small rounded navigation treatment (9px), and pill-shaped owner/publish status badges. Its preview frame has a 10px radius. Public profile links use a 12px glass shape, its Discord identity card is more generously rounded (18px), and the portrait remains circular. Thin borders are the common edge treatment across the dashboard and preview.

## Components

### Buttons
- **Character:** Quiet, direct controls with clear text and restrained blue emphasis.
- **Primary:** The save action uses a blue fill, dark text, 46px minimum height, and 16px horizontal padding.
- **Secondary:** Upload and add-link controls use a dark raised surface, subtle border, and 39px minimum height.
- **Hover / Focus:** The primary action brightens and lifts slightly; other controls shift border and surface tone. Most controls have a visible 3px focus outline with a 4px offset; the section navigation uses a blue-tinted outline.
- **Disabled:** The save action dims while saving or media is uploading; the link-add control disables at its 12-link limit.

### Cards / Containers
- **Corner Style:** Rounded slate panels (12px) with fine dark borders.
- **Background:** Editor sections and preview shell use a raised slate surface; form fields sit one step darker.
- **Shadow Strategy:** Nested surface and border contrast, not structural dashboard shadow.
- **Internal Padding:** 22px desktop sections, reduced to 17px 14px on narrow phones; the preview uses 17px, reducing to 13px.

### Inputs / Fields
- **Style:** Dark fill, subdued border, 7px corners, 44px minimum height, and 10px 12px padding; textareas grow to at least 108px.
- **Focus:** Blue border and slightly lifted field surface, with the shared visible keyboard outline.
- **Error / Disabled:** Error copy and notices use a dark rose surface; disabled controls visibly reduce emphasis.

### Navigation
- **Style:** The desktop rail has a branded mark, compact section links, and a bottom-aligned public-profile link; the topbar carries breadcrumb, owner status, and sign-out control.
- **Hover / Focus:** Links gain a darker raised background and clearer text; keyboard focus is explicit.
- **Mobile:** The rail becomes sticky horizontal section navigation at 720px and stacks brand above it at 520px.

### Live Profile Preview

The editor shows the current unsaved profile state immediately in a framed miniature, including avatar, identity text, optional Discord card, and up to three link labels. Background image or video is shaded and blurred; a draft indicator and footnote clarify that preview updates before saving.

### Profile Link

Public destinations remain translucent dark controls with light labels, rounded edges, and a restrained hover lift; their visual treatment stays separate from dashboard buttons.

## Do's and Don'ts

### Do:
- **Do** keep the owner interface focused on the single personal profile and its four editing sections.
- **Do** preserve the public profile's centered dark identity design when changing the dashboard.
- **Do** keep editor surfaces, forms, and preview legible through contrast and clear section borders.
- **Do** retain the live unsaved preview and clear published, draft, success, and error states.
- **Do** keep keyboard focus visible and suppress interface transitions when reduced motion is requested.

### Don't:
- **Don't** describe or design the owner dashboard as citron, mint, or paper; its implemented shell is dark slate.
- **Don't** imply user accounts, public directories, or multi-profile administration.
- **Don't** use the dashboard's action blue as a replacement for the public profile's distinct identity blue.
- **Don't** let blurred or shaded preview media obscure the profile content.