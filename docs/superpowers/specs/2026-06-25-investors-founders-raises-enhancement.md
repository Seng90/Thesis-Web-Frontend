# Spec: Raises, Investors, and Founders Enhancement

## Goal
To improve the completeness and user experience of the platform by showing Expired fundraising posts appropriately and enriching the data models for Investors and Founders.

## 1. Raises Page Updates
- Expired fundraising posts will now be fetched and displayed on the `/raises` page.
- UI Treatment: Expired posts will be styled with grayscale (e.g., `grayscale opacity-75` or similar Tailwind classes) to visually differentiate them from Active posts.
- A badge indicating "Expired" will be shown on the post card.

## 2. Investor Model & UI Enrichment
- New fields added to the backend `investors` schema:
  - `investment_thesis`: String (Optional) - Description of their investment goals.
  - `preferred_stages`: String Array - e.g., Pre-seed, Seed, Series A.
  - `preferred_industries`: String Array - e.g., FinTech, EdTech.
- Web UI: Update the Investor detail page (`/investors/[id]`) and cards to display these new fields using premium tags/badges.
- Admin Flutter App: Update the forms for creating and editing Investors to include these new fields.

## 3. Founder Model & UI Enrichment
- New fields added to the backend `founders` schema:
  - `skills`: String Array - Key expertise areas (e.g., Product Management).
  - `past_experience`: String (Optional) - Previous startups or roles.
  - `twitter_url`: String (Optional)
  - `github_url`: String (Optional)
- Web UI: Update the Founder detail page (`/founders/[id]`) and UI cards to display these fields.
- Admin Flutter App: Update the forms for creating and editing Founders to include these new fields.
