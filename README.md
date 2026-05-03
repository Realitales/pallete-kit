# Palette

Internal React design system. Radix UI primitives + Tailwind v4 + Framer Motion.

## Develop

```bash
bun install
bun run dev        # sandbox at http://localhost:5173
bun run typecheck
bun run build
```

## Consume (in another app)

```bash
bun add palette
```

```ts
import { Button } from 'palette'
import 'palette/styles.css'   // default tokens (override with your brand)
```

The consuming app needs Tailwind v4 installed. Add Palette to your Tailwind sources:

```css
@import "tailwindcss";
@source "../node_modules/palette/dist";
```

## Stack

- React 18/19 (peer)
- Tailwind v4 (peer, CSS-first `@theme`)
- Radix UI (headless primitives)
- Framer Motion (animation)
- CVA + `cn()` (variants + class merging)

## v1 scope

Button, Input, Textarea, Label, Checkbox, Radio, Switch, Select, Dialog, Popover, Tooltip, Toast, Tabs, Accordion, Avatar, Badge, Card, Separator.

Not in v1: DataTable, DatePicker, Charts.
