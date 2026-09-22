---
name: frontend-design-review
description: Review or audit frontend UI: design system compliance, three quality pillars (frictionless, craft, trustworthy), accessibility WCAG 2.2 AA, responsive, states and UI code review. Not for backend or non-UI code.
acknowledgments: |
  Design review principles and quality pillar framework created by @Quirinevwm (https://github.com/Quirinevwm).
  Creative frontend guidance inspired by Anthropic's frontend-design skill
  (https://github.com/anthropics/skills/tree/main/skills/frontend-design). Licensed under respective terms.
---

# Frontend Design Review

> Adaptada de `microsoft/skills` (`.github/skills/frontend-design-review`, licencia MIT). Ajustes locales: description al presupuesto, **WCAG 2.2 AA** como canonico (skill `accesibilidad`) y regla anti-doble-review.
> **Anti-doble-review:** esta skill aporta el **formato y scoring** del review (3 pilares + compliance + evidencia); la creacion de UI nueva y los checks perceptuales/tecnicos son de `impecable`/`impeccable` (`shape`, `critique`, `audit`, `detect`). No corras ambos sobre el mismo cambio: usa esta para el veredicto estructurado.
> Si el proyecto no usa Figma/Storybook, evalua contra los tokens y componentes reales del repo.

Review UI implementations against design quality standards and your design system. Para crear UI nueva (modo creativo) usa la skill `impeccable`.

## Alcance

Evaluar UI existente: compliance con el design system, los tres pilares (Frictionless, Quality Craft, Trustworthy), accesibilidad y calidad de codigo UI. La creacion de UI nueva es de `impeccable`.

---

## Creacion de UI nueva

Fuera de alcance de esta skill: la direccion estetica, tipografia, color, motion y composicion las gobierna `impeccable` (comandos `shape`/`new-work`, `colorize`, `typeset`, `animate`, `layout`, `delight`, con su `craft-floor`). Aqui solo se evalua el resultado.

---

## Design Review

### Design System Workflow

**Before implementing:**
1. Review component in your Storybook / component library for API and usage
2. Use Figma Dev Mode to get exact specs (spacing, tokens, properties)
3. Implement using design system components + design tokens

**During review:**
1. Compare implementation to Figma design
2. Verify design tokens are used (not hardcoded values)
3. Check all variants/states are implemented correctly
4. Flag deviations (needs design approval)

**If component doesn't exist:**
1. Check if existing component can be adapted
2. Reach out to design for new component creation
3. Document exception and rationale in code

### Review Process

1. Identify user task
2. Check design system for matching patterns
3. Evaluate aesthetic direction
4. Identify scope (component, feature, or flow)
5. Evaluate each pillar
6. Score and prioritize issues (blocking/major/minor)
7. Provide recommendations with design system examples

### Core Principles

- **Task completion**: Minimum clicks. Every screen answers "What can I do?" and "What happens next?"
- **Action hierarchy**: 1-2 primary actions per view. Progressive disclosure for secondary.
- **Onboarding**: Explain features on introduction. Smart defaults over configuration.
- **Navigation**: Clear entry/exit points. Back/cancel always available. Breadcrumbs for deep flows.

---

## Quality Pillars

### 1. Frictionless Insight to Action

**Evaluate:** Task completable in ≤3 interactions? Primary action obvious and singular?

**Red flags:** Excessive clicks, multiple competing primary buttons, buried actions, dead ends.

### 2. Quality is Craft

**Evaluate:**
- Design system compliance: matches Figma specs, uses design tokens
- Aesthetic direction: distinctive typography, cohesive colors, intentional motion
- Accessibility: cumple el checklist canonico de la skill `accesibilidad` (WCAG 2.2 AA).

**Red flags:** Generic AI aesthetics, hardcoded values, implementation doesn't match Figma, broken reflow, missing focus indicators.

### 3. Trustworthy Building

**Evaluate:**
- AI transparency: disclaimer on AI-generated content
- Error transparency: actionable error messages

**Red flags:** Missing AI disclaimers, opaque errors without guidance.

---

## Review Output Format

See [references/review-output-format.md](references/review-output-format.md) for the full review template.

## Review Type Modifiers

See [references/review-type-modifiers.md](references/review-type-modifiers.md) for context-specific review focus areas (PR, Creative, Design, Accessibility).

## Quick Checklist

See [references/quick-checklist.md](references/quick-checklist.md) for the pre-approval checklist covering design system compliance, aesthetic quality, frictionless, quality craft, and trustworthy pillars.

## Pattern Examples

See [references/pattern-examples.md](references/pattern-examples.md) for good/bad examples of creative frontend and design system review work.

---

## Acknowledgments

Creative frontend principles inspired by [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design). Design review principles and quality pillar framework created by [@Quirinevwm](https://github.com/Quirinevwm) for systematic UI evaluation.
