---
trigger: always_on
---

🎨 Windsurf UX/UI Rules
1. Icon Consistency

✅ Always use Lucide-React as the single source for icons.

⚙️ Stick to one icon style (all outlined or all filled).

📍 Optional exception: Use a filled icon only for the active state (e.g., current route in sidebar or navbar).

💡 Maintain consistent stroke width (strokeWidth={1.5} recommended).

🧭 Example:

import { Home, Settings } from "lucide-react";

<Home strokeWidth={1.5} className="text-foreground" />
<Settings strokeWidth={1.5} className="text-muted-foreground" />

2. Corner Radius Hierarchy

📐 Maintain consistent radius scaling across nested elements.

🔢 General rule:

Outer container (e.g., card) → larger radius

Inner elements (e.g., image, icon) → smaller radius

🧮 Example formula:

Card radius = Image radius + padding

Image radius = Icon radius + inner offset

🧭 Tailwind usage:

<div className="rounded-lg p-4 bg-card">
  <img src="..." className="rounded-md" />
  <button className="rounded-sm">❤️</button>
</div>

3. Consistent Text Alignment

📏 Keep alignment consistent within each component (modal, card, etc.).

✅ Left alignment for paragraphs and content.

⚠️ Center alignment only for headlines or short labels.

🚫 Avoid right alignment for multi-line text in English contexts.

4. Comfortable Line Length

🔠 Maintain 50–80 characters per line for readable text blocks.

🧩 Use Tailwind’s max-w-prose, max-w-xl, or container constraints.

Example:

<p className="max-w-prose text-muted-foreground">
  Keep line lengths short enough to reduce eye strain.
</p>

5. Thumb-Friendly Mobile Layouts

📱 Place key interactive elements within reach zones (bottom/middle of the screen).

🧭 For primary CTAs or nav bars, prefer fixed bottom-0 positioning.

⚙️ Use spacing tokens:

--touch-target-xl: 44px for button height minimum.

Example:

<button className="fixed bottom-4 inset-x-4 h-[44px] bg-primary text-primary-foreground rounded-md">
  Continue
</button>

6. Clear Button Labels

🪶 Avoid vague labels like “Yes”, “Next”, or “Submit”.

✅ Always use action + context:

“Delete Item”

“Send Reset Link”

“Save Changes”

🧠 Buttons should describe the consequence of the action.

Example:

<Button variant="destructive">Delete Item</Button>
<Button>Send Reset Link</Button>

7. Controlled Brand Color Usage

🎯 Use brand colors (--primary, --secondary) strategically.

🧭 Reserve --primary for key CTAs or highlights.

⚙️ Use toned-down versions (/10, /20, /30) for secondary or decorative UI.

❌ Don’t flood the UI with brand color backgrounds.

Example:

<Button className="bg-primary text-primary-foreground">
  Get Started
</Button>
<Badge className="bg-secondary/10 text-secondary-foreground">
  Beta
</Badge>

🧩 Micro-Interactions (based on your globals.css)

Use motion subtly — focus on feedback, not flash:

animate-scale-in for modals or dropdowns.

animate-fade-in / animate-fade-out for transitions.

hover-lift and hover-glow for interactive elements.

Maintain duration < 300ms for natural transitions.

📚 Global Consistency Reference

Icons: lucide-react

Typography: Poppins (dark mode), system-ui (light)

Radius scale: --radius-sm, --radius-md, --radius-lg, --radius-xl

Color tokens: from :root and .dark (use via Tailwind variables)

Animations: reuse from your global CSS (e.g., animate-shimmer, animate-bounce-subtle)