# Spec: Home Page Hero Background Image Replacement

## Goal
Replace the purple gradient background in the Hero section of the Home page with a Vientiane cityscape image while maintaining high text readability and premium design aesthetics.

## Proposed Design (Option 1: Linear Dark Gradient Overlay)
1. **Background Image Integration**:
   - The hero `<section>` wrapper will use the newly uploaded image `public/hero-bg.jpg`.
   - Tailwind styling on the section: `bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat`.

2. **Linear Dark Gradient Overlay**:
   - Add a dark gradient overlay inside the hero section, stacked underneath the content but above the background image.
   - Styling for the overlay: `absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-950/70 to-slate-950`.
   - This ensures the top of the image remains visible with a soft overlay, the middle (where text and search input sit) has enough dark contrast for text readability, and the bottom fades smoothly into the stats block.

3. **Stats Row Integration**:
   - The stats block container (`bg-white dark:bg-slate-950`) will remain as is, creating a clean transition from the dark gradient fade to the white/slate-950 stats strip.

4. **Decorative Blobs**:
   - The existing abstract blobs (`bg-white/10`, `bg-purple-400/20`, `bg-amber-400/10`) will be adjusted or removed to keep the background clean and avoid cluttering the photo.

## Verification
- Verify text contrast and legibility in both light and dark modes.
- Verify responsiveness across mobile, tablet, and desktop views.
