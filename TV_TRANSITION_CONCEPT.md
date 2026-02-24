# TV Transition Concept — "The Broadcast"

## Vision
The Veo hero video is the "room" — a surreal space with Ganesha, boombox, sacred geometry, and a vintage television. The camera drifts toward the TV, zooms into its screen, and the REST of the site lives INSIDE the TV.

## Navigation Metaphor
- **Gallery** = flipping channels (static between each piece)
- **Featured** = a curated broadcast
- **Shop** = home shopping network aesthetic
- **About** = behind-the-scenes documentary channel
- Each section has subtle CRT overlay (scan lines, slight color fringing, vignette)

## Technical Approaches (ranked)

### Option A: Spline 3D Scene (Best)
- Build the room in Spline with camera paths
- TV is a 3D object with a screen that can render React content
- Camera animation triggered on nav click → dolly toward TV → content renders on TV screen
- Most immersive, Michael can art-direct in Spline's visual editor

### Option B: R3F Scene (Custom code)
- Build simplified room in React Three Fiber
- TV model (GLB) with a video texture / HTML portal
- Camera tween (gsap) toward TV on navigation
- More control but harder for Michael to art-direct

### Option C: CSS Zoom + Overlay (Quick fake)
- CSS transform zooms into lower-left of video
- Overlay a TV bezel frame (SVG/CSS) that contains page content
- Inner pages render inside the TV frame with CRT shader overlay
- Fastest to build, least immersive

### Option D: Second Veo Video (Hybrid)
- Generate a Veo video that IS the zoom-into-TV shot
- Play it as a transition, then swap to the TV-framed content
- Most cinematic but least interactive

## CRT Aesthetic for Inner Pages
```css
.crt-overlay {
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.15) 0px,
    rgba(0,0,0,0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  /* Plus: vignette, slight barrel distortion, color fringing */
}
```

## Michael's Notes
- "I like vintage televisions for some reason"
- Inspired by hle.io transitions
- TV as portal/frame, not just decoration
- Gallery = channel surfing

## Status: PARKED — building after products + Living Paintings are in
