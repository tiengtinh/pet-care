---
description: Custom Tailwind color tokens for PetCare — use these instead of standard Tailwind colors for brand-consistent UI
paths:
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.ts"
---

## Custom Color Tokens

This project uses custom Tailwind tokens — use these instead of generic colors:

| Token | Value | Use for |
|-------|-------|---------|
| `warm` | `#e6a47a` | Primary brand — active states, buttons, accents |
| `warm-dark` | `#c47d52` | Hover/pressed states, text on light bg |
| `nature` | `#90b4a4` | Secondary brand — backgrounds, badges |
| `nature-light` | `#f2f8f5` | Subtle backgrounds |
| `nature-dark` | `#587a68` | Text, borders on nature bg |

- Background: `#FDFBF7` (used as `bg-[#FDFBF7]`)
- Active nav item: `bg-warm text-white`
- Hover nav item: `hover:bg-orange-50/80 hover:text-warm-dark`
