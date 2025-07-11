# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15.3.2** calculator web application (calcx.org) featuring 18 specialized calculators organized into 6 categories: Scientific, Financial, Health, Engineering, Weather, and General. The project uses TypeScript, Tailwind CSS 4, and React 19 with the App Router architecture.

## Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint (ignores errors during builds)
npm run lint
```

## Technology Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4
- **Math**: mathjs for calculations
- **Charts**: Chart.js + react-chartjs-2
- **PDF**: jsPDF + jspdf-autotable
- **Dates**: date-fns + react-datepicker
- **Analytics**: Vercel Speed Insights

## Architecture

### Directory Structure
```
app/
├── components/           # Shared components
│   ├── CalculatorGroups.tsx    # Central registry of all calculators
│   ├── Header.tsx             # Navigation with search
│   ├── Footer.tsx
│   └── ScientificCalculator.tsx
├── [calculator-name]/    # Individual calculator pages
│   ├── page.tsx         # Main calculator interface
│   ├── layout.tsx       # SEO metadata (optional)
│   ├── components/      # Calculator-specific components
│   └── utils/          # Calculation logic utilities
├── layout.tsx          # Root layout with analytics
└── page.tsx            # Homepage with featured calculator
```

### Key Components

- **CalculatorGroups.tsx**: Central registry defining all 18 calculators with metadata
- **Header.tsx**: Contains search functionality across all calculators
- **Individual Calculator Pages**: Self-contained with their own components and utils

### Calculator Categories
1. **Scientific** (1): Scientific Calculator
2. **Financial** (4): Payment, Land Loan, Roth IRA, CD Calculators  
3. **Health** (3): ACFT Body Fat, IVF Due Date, Period Calculators
4. **Engineering** (1): Asphalt Mass Calculator
5. **Weather** (1): Dew Point Calculator
6. **General** (3): Rounding, Time Card, Chronological Age Calculators

## Code Patterns

### Adding New Calculators
1. Create new directory: `app/[calculator-name]/`
2. Implement `page.tsx` with calculator interface
3. Add calculation utilities in `utils/` subdirectory
4. Update `CalculatorGroups.tsx` to register the new calculator
5. Update `sitemap.xml` for SEO

### TypeScript Configuration
- Path mapping: `@/*` points to project root
- Strict mode enabled
- ES2017 target with modern library support

### Styling Guidelines
- Uses Tailwind CSS 4 utilities
- Mobile-first responsive design
- Consistent spacing and typography across calculators

### Development Patterns Based on Cursor Rules
- Use functional components with TypeScript interfaces for props
- Prefer named exports for components and functions
- Use descriptive variable names with helper verbs (isLoading, hasError)
- Implement proper error handling with early returns
- Structure files: exports, subcomponents, helpers, static content, types
- Use kebab-case for directories (payment-calculator)

## Testing and Quality

- ESLint configured for Next.js + TypeScript
- Production builds ignore ESLint errors (configured in next.config.ts)
- No specific test framework configured - check with maintainer before adding tests

## SEO and Analytics

- Google Analytics integrated in root layout
- Sitemap.xml maintained with all calculator URLs
- Individual calculators can have custom layouts for SEO metadata
- Vercel Speed Insights for performance monitoring

## Performance Features

- Turbopack enabled for faster development builds
- Geist fonts optimized with next/font
- Chart.js for efficient data visualization
- PDF generation handled client-side with jsPDF