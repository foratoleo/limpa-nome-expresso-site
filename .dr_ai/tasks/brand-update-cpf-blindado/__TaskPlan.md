# Task Plan: Brand Update - CPF Blindado / Nome Blindado

**Task Name:** brand-update-cpf-blindado
**Date:** 2026-03-09
**Git Branch:** refactor/brand-update-cpf-blindado

---

## Task Objectives

Update the site brand from "Limpa Nome Expresso" to "CPF Blindado" / "Nome Blindado" to align with the new domain cpfblindado.com. This refactor will update all user-facing brand references across the codebase including page titles, headings, email templates, sitemap URLs, meta descriptions, and component text. The goal is to establish a cohesive brand identity that emphasizes protection ("blindagem") rather than just cleaning ("limpa"), while maintaining SEO value and user trust.

---

## Implementation Summary

### Architecture Approach
This is a systematic text replacement refactor across multiple layers of the application:

1. **Frontend Components** - React components in `client/src/` containing visible brand text
2. **HTML/SEO Files** - `index.html`, `sitemap.xml`, and meta tags
3. **Email Templates** - Static HTML templates in `client/public/email-templates/`
4. **Server-side** - Email service templates and API configurations
5. **Configuration** - Package.json, environment files, and documentation

### Brand Replacement Strategy
| Current Term | New Term | Context |
|--------------|----------|---------|
| Limpa Nome Expresso | CPF Blindado | Primary brand name |
| limpa nome expresso | cpf blindado | Lowercase URLs, slugs |
| LimpaNomeExpresso | CPFBlindado | PascalCase (rare) |
| limpa-nome-expresso | cpf-blindado | URL slugs |
| limpa nome / Limpa Nome | Nome Blindado | Alternative references |
| "empresas de limpa nome" | "empresas de protecao de nome" | Descriptive text |

### Technologies
- React 19 with TypeScript
- Vite build system
- Supabase backend
- Netlify deployment

### Security Considerations
- No changes to authentication or database logic
- Email templates must maintain proper escaping
- URLs in sitemap must be valid after domain change

---

## UX/UI Details

### User-Facing Changes
- **Page Title**: Browser tab will show "CPF Blindado" instead of "Limpa Nome Expresso"
- **Hero Section**: Headlines updated to emphasize "blindagem" (protection) concept
- **Email Communications**: All system emails will reflect new branding
- **SEO**: Meta descriptions and sitemap URLs updated for new domain

### Brand Consistency
- Maintain existing color scheme (gold #d39e17, navy #162847, green #22c55e)
- Keep visual identity intact - only text changes
- Preserve Portuguese language and tone

---

## Tasks

### Task 1: Update Core HTML and SEO Files

**Files to create/change:**
- [CHANGE] `client/index.html` - Title and meta description
- [CHANGE] `client/public/sitemap.xml` - Domain URLs

**Implementation:**
Update the main HTML entry point to reflect the new brand name. The `<title>` tag currently reads "Limpa Nome Expresso - Guia Juridico para Limpeza de Nome" and should become "CPF Blindado - Protecao e Limpeza de Nome". The meta description needs to replace "Limpa Nome Expresso" references with the new brand while maintaining SEO-relevant keywords about legal guidance for name protection.

The sitemap.xml file contains the old Netlify domain `limpa-nome-expresso-site.netlify.app` in all URL entries. These should be updated to the new domain `cpfblindado.com` (or the current production URL). Each `<loc>` element needs the domain portion replaced while keeping the path structure intact.

**Subtasks:**
1.1. Update index.html title from "Limpa Nome Expresso" to "CPF Blindado"
1.2. Update index.html meta description with new brand name
1.3. Update sitemap.xml URLs to use new domain

---

### Task 2: Update Landing Page Components

**Files to create/change:**
- [CHANGE] `client/src/components/landing/HeroSection.tsx` - Hero headlines and text
- [CHANGE] `client/src/components/landing/BenefitsSection.tsx` - Section title

**Implementation:**
The HeroSection component contains the main value proposition. The video source path `/ln01.mp4` may need renaming to align with new brand. Key text changes include the reference to "empresas de 'limpa nome'" which should become "empresas de 'protecao de nome'" or similar. The headline "Limpe seu nome" can remain as it describes the action, but overall brand positioning should shift toward protection.

BenefitsSection.tsx has a heading "Como o Limpa Nome Expresso resolve" that needs to become "Como o CPF Blindado resolve" or "Como o Nome Blindado resolve". This is a straightforward text replacement in the component's JSX.

**Subtasks:**
2.1. Update HeroSection.tsx brand references
2.2. Update BenefitsSection.tsx heading text

---

### Task 3: Update Email Templates

**Files to create/change:**
- [CHANGE] `client/public/email-templates/confirm-signup.html` - Brand name and footer
- [CHANGE] `client/public/email-templates/preview.html` - Brand name references
- [CHANGE] `server/services/email.service.ts` - Email subject lines and body text

**Implementation:**
Email templates are critical touchpoints for brand consistency. The confirm-signup.html template has "Limpa Nome Expresso" in the header logo text, title, body paragraphs, and footer. All instances should be replaced with "CPF Blindado". The email subject line and preview text also need updates.

The email.service.ts file generates dynamic email content including welcome emails, contact form submissions, and password reset emails. Multiple string literals contain "Limpa Nome Expresso" in subjects, body text, and footer signatures. These need systematic replacement while maintaining the professional tone and proper Portuguese grammar.

**Subtasks:**
3.1. Update confirm-signup.html template branding
3.2. Update preview.html template branding
3.3. Update email.service.ts subject lines and body text
3.4. Update email.service.ts footer signatures

---

### Task 4: Update Server and API Configuration

**Files to create/change:**
- [CHANGE] `netlify/functions/api.ts` - Contact email constant
- [CHANGE] `.env.example` - Comments and documentation
- [CHANGE] `package.json` - Project name (optional)

**Implementation:**
The api.ts Netlify function contains a constant `CONTACT_EMAIL` set to 'limpanome@f2w2.com.br'. This email address may need to be updated if a new contact email is established for the CPF Blindado brand. Coordinate with stakeholder before changing.

The .env.example file has extensive comments mentioning "Limpa Nome Expresso" in the header and throughout the documentation. Update these references for consistency, though they don't affect runtime behavior.

Package.json has "name": "limpa-nome-expresso-site" which could be updated to "cpf-blindado-site" for consistency, though this is low priority as it only affects development tooling.

**Subtasks:**
4.1. Update api.ts contact email (if new email provided)
4.2. Update .env.example documentation comments
4.3. Update package.json project name (optional)

---

### Task 5: Update Additional Component Files

**Files to create/change:**
- [CHANGE] `client/src/pages/*.tsx` - Page-specific brand references
- [CHANGE] `client/src/components/ArticleSeo.tsx` - SEO component
- [CHANGE] Other files identified in initial grep search

**Implementation:**
Multiple page components in `client/src/pages/` contain brand references that need updating. These include Welcome.tsx, Home.tsx, Landing.tsx, and other pages. The ArticleSeo.tsx component likely generates structured data or meta tags that should reflect the new brand.

Search results from the initial analysis identified 125 files with "limpa nome" variations and 81 files with "Limpa Nome Expresso" variations. While many are in documentation/planning files (which can be lower priority), the user-facing components and pages should all be reviewed and updated systematically.

**Subtasks:**
5.1. Update ArticleSeo.tsx component
5.2. Update page components with brand references
5.3. Review and update remaining user-facing files

---

### Task 6: Documentation and Final Cleanup

**Files to create/change:**
- [CHANGE] `README.md` - Project documentation
- [CHANGE] `.env.production` - Production environment (if needed)
- [REVIEW] All markdown files in `.planning/` and `docs/` directories

**Implementation:**
Update README.md to reflect the new brand name in project description and any usage examples. This is important for developer onboarding and project documentation consistency.

Review .env.production for any hardcoded URLs or brand references. The production environment may have domain-specific configurations that need updating for the cpfblindado.com domain.

Documentation files in `.planning/` and `docs/` directories can be updated as a lower priority task, as these are primarily internal references that don't affect user experience.

**Subtasks:**
6.1. Update README.md project description
6.2. Review and update .env.production
6.3. Update planning documentation (lower priority)
