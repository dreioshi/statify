# Phase 2 — Architecture and Core Calculator Refactor

## Completed in this development pass
- Replaced the single-page state-switched interface with dedicated App Router pages.
- Added a shared responsive navigation shell and reusable page header.
- Preserved the Statify identity while applying the navy / royal blue / teal / violet palette.
- Split regression and Z-test mathematics into dedicated TypeScript modules.
- Updated Module 7 correlation strength labels to the ranges shown in the supplied slide.
- Added finite-number and incomplete-row validation for regression and hypothesis-test inputs.
- Added individual fitted-value and residual output rows.
- Added one-sample and two-sample Z-test pages with critical Z values and shaded normal-curve regions.
- Enforced the Module 9 slide's stated Z-test sample-size rule (at least 30 per sample).
- Added local history with search, rename, delete, and saved-input/result inspection.
- Updated Supabase schema policies to be rerunnable and scoped to the authenticated user's records.
- Added login/signup route placeholders that clearly indicate Supabase authentication is not yet connected.
- Updated README with routes, current limitations, and academic verification notes.

## Numerical verification performed
Using Module 7 Sample Exercise #1:
- Intercept: 55.478788
- Slope: 6.187879
- Pearson r: 0.996977 (Very high positive)

Module 9 sample numerical checks:
- One-sample Z example: z = -1.488646; at alpha .05, two-tailed decision = Fail to reject H₀.
- Two-sample Z example using the slide's provided variance inputs: z = 11.355499; at alpha .05, two-tailed decision = Reject H₀.

The statistical modules were compiled independently with TypeScript and these numerical checks were executed with Node.
All TS/TSX files passed TypeScript transpilation syntax checks.

## Not completed / not yet verified
- Full Next.js production build and full project typecheck: dependencies could not be installed because npm registry DNS access failed in this environment (EAI_AGAIN).
- Supabase authentication and database integration.
- True reopen-to-calculator workflow for saved records (history currently provides inspection).
- CSV/PDF export.
- T-test calculations: degrees-of-freedom and critical-value procedures require course/instructor confirmation.
- Browser-based desktop/tablet/mobile QA.
- Final verification of two-sample Z-test variance interpretation with instructor.


## Statify rebrand update
- Renamed visible application branding from StatScope to Statify.
- Added the supplied S/circuit logo as `public/statify-logo.png` and `public/favicon.png`.
- Updated browser metadata and the application footer.
- Replaced the former navy/royal-blue/teal/violet identity with a logo-matched navy/cyan palette: `#063470`, `#0098C9`, `#28AFC2`, and `#4B8FB5`.
- Preserved the existing browser history storage key to avoid abandoning locally saved records during the rebrand.
