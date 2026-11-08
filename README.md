# Statify — Advanced Statistics Analysis Studio

Individual ADVSTAT final project by **Drei Matthew B. Laya**.

Statify is a course-aligned web application focused only on:
- **Module 7:** Simple Linear Regression and Correlation.
- **Module 9:** Hypothesis Testing.

## Brand identity
- **Name:** Statify — Advanced Statistics Analysis Studio
- **Tagline:** From Data to Statistical Insight.
- **Logo:** Supplied S-shaped circuit/data mark, included as `public/statify-logo.png`; favicon at `public/favicon.png`.
- **Palette (v3 redesign):** deep forest green surfaces with a lime accent (`#C6F24E` dark / `#B7E944` light), mint (`#6FE0B4`) as the secondary series color, coral for rejection regions. All colors are CSS variables in `src/app/globals.css` under `[data-theme="dark"]` and `[data-theme="light"]`.
- **Typography:** Bricolage Grotesque (headings) + Figtree (body), 17px base size.
- The logo artwork was retained and its white background made transparent for flexible use on light surfaces.

## Technology
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Supabase (schema/client starter; authentication and persistence are not yet connected)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Routes
- `/dashboard`
- `/regression`
- `/hypothesis-testing`
- `/history`
- `/study-guide`
- `/about`
- `/references`
- `/login` and `/signup` (UI placeholders; authentication is not connected)

## Current implementation notes

### Module 7
- Paired X/Y input with add/remove rows and sample data.
- Least-squares regression equation using the computational form equivalent to the course slide equations.
- Pearson correlation coefficient and course-slide strength bands: very high, high, moderate, low, negligible. Direction is reported separately from strength.
- Scatter diagram, fitted line, fitted values, and residual table.
- Validation rejects incomplete/non-finite observations and constant X or Y where the requested calculation is undefined.

### Module 9
- Editable H₀/H₁, alpha selection, and left-/right-/two-tailed selection.
- One-sample Z and two-sample Z calculations.
- Critical Z values from an inverse-normal approximation.
- Decision by critical-region comparison and a normal curve with shaded rejection/non-rejection regions.
- The implementation enforces the Module 9 slide's stated Z-test sample-size convention (n >= 30 for each sample).
- Two-sample variance field wording remains deliberately generic pending instructor confirmation of the population-versus-sample variance convention in the course example.

## Verification

Run:

```bash
npm run typecheck
npm run build
```