# Leancup Design System

## Overview
The Leancup design system is built on Material Design 3 principles with a warm, collaborative, coffee-inspired theme called "Warm Focus Brew". This theme is optimized for clarity and calm focus during Lean Coffee sessions.

## Typography
- **Primary Font**: Inter (all weights)
- Apply Inter font family consistently across the entire application
- Use Material Design 3 typography scale for consistency

## Color Palette – "Warm Focus Brew"

### Source Colors
These are the base colors Material 3 uses to generate all tonal palettes:

- **Primary Source**: `#8C4A2F` (warm espresso tone)
- **Secondary Source**: `#566F7A` (balanced blue-gray)
- **Neutral Source**: `#6F6F6F`
- **Neutral Variant Source**: `#7A6F69`
- **Error Source**: `#BA1A1A` (MD3 default)

### Tonal Palettes

#### Primary Tonal Palette
| Tone | Hex |
|------|-----|
| 0 | `#000000` |
| 10 | `#3B1B11` |
| 20 | `#5A2C1E` |
| 30 | `#7A3D2A` |
| 40 | `#8C4A2F` |
| 50 | `#A35F44` |
| 60 | `#BB765B` |
| 70 | `#D38E73` |
| 80 | `#EAA78D` |
| 90 | `#FFDAD0` |
| 100 | `#FFFFFF` |

#### Secondary Tonal Palette
| Tone | Hex |
|------|-----|
| 0 | `#000000` |
| 10 | `#111C21` |
| 20 | `#273238` |
| 30 | `#3D4850` |
| 40 | `#546067` |
| 50 | `#6A7680` |
| 60 | `#829099` |
| 70 | `#9BAAB3` |
| 80 | `#B5C5CF` |
| 90 | `#D0E0EA` |
| 100 | `#FFFFFF` |

#### Neutral Palette
| Tone | Hex |
|------|-----|
| 10 | `#1A1A1A` |
| 20 | `#303030` |
| 30 | `#474747` |
| 40 | `#5E5E5E` |
| 50 | `#767676` |
| 60 | `#909090` |
| 70 | `#ABABAB` |
| 80 | `#C7C7C7` |
| 90 | `#E3E3E3` |
| 95 | `#F1F1F1` |
| 99 | `#FAFAFA` |

### Material Design 3 Color Tokens

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#8C4A2F` | Primary actions, key UI elements |
| `onPrimary` | `#FFFFFF` | Text/icons on primary color |
| `primaryContainer` | `#FFDAD0` | Highlighted primary containers |
| `onPrimaryContainer` | `#3B1B11` | Text on primary containers |
| `secondary` | `#546067` | Secondary actions, less prominent UI |
| `onSecondary` | `#FFFFFF` | Text/icons on secondary color |
| `secondaryContainer` | `#D0E0EA` | Highlighted secondary containers |
| `onSecondaryContainer` | `#111C21` | Text on secondary containers |
| `background` | `#FAFAFA` | Main background color |
| `onBackground` | `#1A1A1A` | Text on background |
| `surface` | `#FAFAFA` | Surface background (cards, sheets) |
| `onSurface` | `#1A1A1A` | Text on surfaces |
| `surfaceVariant` | `#F1F1F1` | Variant surface backgrounds |
| `onSurfaceVariant` | `#474747` | Text on variant surfaces |
| `outline` | `#767676` | Borders and dividers |

#### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#EAA78D` | Primary actions, key UI elements |
| `onPrimary` | `#5A2C1E` | Text/icons on primary color |
| `primaryContainer` | `#7A3D2A` | Highlighted primary containers |
| `onPrimaryContainer` | `#FFDAD0` | Text on primary containers |
| `secondary` | `#B5C5CF` | Secondary actions, less prominent UI |
| `onSecondary` | `#273238` | Text/icons on secondary color |
| `secondaryContainer` | `#3D4850` | Highlighted secondary containers |
| `onSecondaryContainer` | `#D0E0EA` | Text on secondary containers |
| `background` | `#1A1A1A` | Main background color |
| `onBackground` | `#E3E3E3` | Text on background |
| `surface` | `#1A1A1A` | Surface background (cards, sheets) |
| `onSurface` | `#E3E3E3` | Text on surfaces |
| `surfaceVariant` | `#303030` | Variant surface backgrounds |
| `onSurfaceVariant` | `#C7C7C7` | Text on variant surfaces |
| `outline` | `#909090` | Borders and dividers |

## Tailwind CSS Configuration

Use these color tokens in your `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#8C4A2F',
    on: '#FFFFFF',
    container: '#FFDAD0',
    onContainer: '#3B1B11',
  },
  secondary: {
    DEFAULT: '#546067',
    on: '#FFFFFF',
    container: '#D0E0EA',
    onContainer: '#111C21',
  },
  background: '#FAFAFA',
  onBackground: '#1A1A1A',
  surface: {
    DEFAULT: '#FAFAFA',
    variant: '#F1F1F1',
    on: '#1A1A1A',
    onVariant: '#474747',
  },
  outline: '#767676',
  // Dark mode variants
  dark: {
    primary: {
      DEFAULT: '#EAA78D',
      on: '#5A2C1E',
      container: '#7A3D2A',
      onContainer: '#FFDAD0',
    },
    secondary: {
      DEFAULT: '#B5C5CF',
      on: '#273238',
      container: '#3D4850',
      onContainer: '#D0E0EA',
    },
    background: '#1A1A1A',
    onBackground: '#E3E3E3',
    surface: {
      DEFAULT: '#1A1A1A',
      variant: '#303030',
      on: '#E3E3E3',
      onVariant: '#C7C7C7',
    },
    outline: '#909090',
  },
}
```

## Component Guidelines

### Cards & Surfaces
- Use `surface` color for card backgrounds
- Apply subtle elevation with shadows
- Use `outline` color for borders when needed
- Maintain proper contrast with `onSurface` text

### Buttons
- **Primary Action**: Use `primary` background with `onPrimary` text
- **Secondary Action**: Use `secondary` background with `onSecondary` text
- **Tertiary Action**: Use `primaryContainer` or `secondaryContainer`

### States & Spaces
- **Personal Space**: Use `primaryContainer` with subtle styling
- **TO DO Space**: Use `surface` with clear distinction
- **DOING Space**: Use `primary` accent to highlight active discussion
- **ARCHIVE Space**: Use muted `surfaceVariant` tones

### Timer Component
- Use `primary` color for active timer
- Use `outline` for timer progress ring
- Ensure high contrast for countdown numbers

### Voting Interface
- Use `primary` for vote dots
- Use `secondary` for thumbs up/down voting
- Clear visual feedback on interaction

### User Presence
- Use `secondaryContainer` for user list background
- Use `primary` accent for active/current user
- Use `onSurfaceVariant` for inactive users

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Use semantic color tokens (not raw hex values)
- Ensure interactive elements have visible focus states
- Provide adequate touch targets (minimum 44x44px)
- Test with both light and dark modes

## Spacing & Layout

Follow Material Design 3 spacing scale:
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Use consistent padding and margins throughout

## Elevation

Material Design 3 elevation levels:
- Level 0: No shadow (flat surfaces)
- Level 1: Subtle elevation (cards at rest)
- Level 2: Medium elevation (raised cards, app bar)
- Level 3: High elevation (dialogs, menus)
- Level 4: Floating action button

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Ensure touch-friendly interfaces on mobile
- Optimize layout for both portrait and landscape

## Motion & Transitions

- Use smooth, purposeful animations
- Keep transitions under 300ms for immediate feedback
- Use easing functions: ease-in-out for most transitions
- Animate state changes (voting, timer updates)
- Provide loading states for async operations

## Best Practices

1. **Always use semantic color tokens** instead of hardcoded hex values
2. **Test in both light and dark modes** during development
3. **Use Inter font** consistently across all text
4. **Maintain consistent spacing** using the 4px base unit
5. **Ensure proper contrast** for all text and interactive elements
6. **Provide visual feedback** for all user interactions
7. **Keep the coffee theme subtle** – avoid overusing brown tones
8. **Prioritize readability** in ticket content and timer displays
