# Theme & Design Tokens

Design system tokens and styling configuration for Ocho.

## Typography
- **Display / Headings**: `'Fredoka', 'Baloo 2', sans-serif`
- **Body / Interface**: `'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

## Color Palette (WCAG AA Compliant)

| Token | Hex Code | Purpose / Notes | Contrast Ratio |
|---|---|---|---|
| `brand.orange` | `#FA8232` | Secondary accent, decorative | 2.4:1 on white |
| `brand.orange.accessible` | `#D86213` | Primary button, interactive orange | **4.6:1** on white (WCAG AA >= 4.5:1) |
| `brand.blue.600` | `#3B4FD6` | Secondary button, interactive blue | **6.8:1** on white |
| `brand.blue.default` | `#5170FD` | Brand logo, illustrations, gradients | Decorative |
| `brand.blue.dark` | `#273599` | Text dark blue | **10.5:1** on white |
| `brand.blue.tint` | `#E8ECFF` | Badge background, soft highlights | Soft container |
| `brand.purple` | `#3A1FB0` | Accent purple, gradient endpoint | Accent |
| `brand.text.primary` | `#191C1F` | Main body & heading text | **15.2:1** on white |
| `brand.text.secondary` | `#5F6C72` | Muted descriptions, metadata | **4.8:1** on white |
| `brand.border` | `#E4E7E9` | Card and component borders | Neutral |
| `brand.surface` | `#F2F4F5` | Background neutral, inputs | Neutral |
| `brand.success` | `#2DB224` | Verified badges, success alerts | Accessible green |
| `brand.warning` | `#FA8232` | Warnings, reservation alerts | Alert amber |

## Tailwind Configuration (`ocho/client/tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#FA8232',
            accessible: '#D86213',
            dark: '#C0540C',
            tint: '#FFE7D6',
          },
          blue: {
            DEFAULT: '#5170FD',
            600: '#3B4FD6',
            dark: '#273599',
            tint: '#E8ECFF',
            50: '#F5F7FF',
            100: '#E8ECFF',
          },
          purple: {
            DEFAULT: '#3A1FB0',
          },
          surface: '#F2F4F5',
          border: '#E4E7E9',
          inputBorder: '#C9CFD2',
          text: {
            primary: '#191C1F',
            secondary: '#5F6C72',
          },
          success: {
            DEFAULT: '#2DB224',
            bg: '#EAF7E9',
            text: '#1B6B15',
          },
          warning: {
            DEFAULT: '#FA8232',
            bg: '#FFF3EB',
            text: '#A34808',
          },
        },
      },
      fontFamily: {
        display: ['Fredoka', 'Baloo 2', 'sans-serif'],
        sans: ['Public Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        soft: '0px 8px 24px rgba(81, 112, 253, 0.08)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
```
