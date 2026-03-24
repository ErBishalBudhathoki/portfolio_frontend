# Skills UI Redesign Notes

## Status
This documents the redesigned skills page concept that was implemented locally and then reverted.
It is not active in the current app.

## Goal
The redesign was meant to replace the current long, taxonomy-heavy skills page with a shorter page that:

- leads with the strongest capability areas
- shows proof through experience and projects
- avoids giant badge walls
- matches the portfolio's existing visual language more closely

## Proposed Structure
The redesigned page was organized into five sections:

1. Hero
   Clear positioning statement focused on mobile-first and full-stack delivery.

2. Snapshot metrics
   Counts for skills, experience items, and projects.

3. Capability pillars
   Four grouped sections such as:
   - Mobile Delivery
   - Frontend Craft
   - Backend Systems
   - AI and Product Range

4. Proof of work
   Recent experience items and selected projects.

5. Supporting toolkit
   Smaller grouped chips for the wider stack.

## What Was Dynamic
The proposed UI was partially dynamic.

Dynamic parts:
- profile headline
- location
- total number of skills
- experience count
- project count
- actual skill names shown inside each capability pillar
- recent experience cards
- selected project cards

These values came from the profile API response.

## What Was Static
The proposed UI still had some hard-coded presentation rules:

- the page layout
- the section order
- the names of the four capability pillars
- which API skill categories mapped into each pillar
- the accent styling for each pillar

So the content was dynamic, but the interpretation layer was still curated in code.

## Data Source
The redesign used the same profile source already used elsewhere in the portfolio:

- backend endpoint: `/api/profile`
- frontend source of truth:
  - [frontend/app/(site)/page.tsx](/Users/bishal/Developer/portfolio_1/frontend/app/(site)/page.tsx)
  - [frontend/hooks/useApi.ts](/Users/bishal/Developer/portfolio_1/frontend/hooks/useApi.ts)
  - [frontend/app/api/profile/route.ts](/Users/bishal/Developer/portfolio_1/frontend/app/api/profile/route.ts)

Observed profile shape during local testing:

- `basic_info.name`
- `basic_info.headline`
- `basic_info.location`
- `skills`
- `experience`
- `projects`

The live skills data was already dynamic and looked like an array of objects shaped roughly like:

```ts
{
  name: string;
  category: string;
  endorsements: number | string;
}
```

## How It Worked
The proposed version followed this flow:

1. Fetch profile data from `/api/profile`
2. Normalize `skills` into a consistent internal array
3. Group normalized skills by category
4. Map categories into a smaller number of curated capability pillars
5. Render:
   - a compact hero
   - summary metrics
   - pillar cards using grouped skills
   - recent experience
   - selected projects

## Can It Be Made Fully Dynamic?
Yes.

There are two levels of dynamic behavior:

### Level 1: Dynamic content, curated layout
This is what the redesign used.
The data changes automatically, but the meaning and grouping are still defined in code.

Pros:
- stronger storytelling
- better quality control
- less noisy UI

Cons:
- category mapping must be maintained in code
- new backend categories may not land in the ideal section automatically

### Level 2: Fully dynamic layout from data
This would remove most hard-coded grouping and make the backend drive more of the page.

Possible approaches:

- Use backend-provided `skills_by_category`
- Add a backend field such as `featured_skill_groups`
- Store a small config object in the frontend that is editable outside the component
- Add ordering/priority metadata to skills or categories

Example of a more dynamic backend-driven structure:

```ts
{
  featured_skill_groups: [
    {
      title: "Mobile Delivery",
      description: "Shipping Android and Flutter products.",
      categories: ["Mobile Development"],
      priority: 1
    }
  ]
}
```

Then the page would render almost entirely from API data.

## Recommended Direction
Best option:

- keep the layout curated
- keep the data dynamic
- move category-to-pillar mapping into a small config object

That gives you a strong page without making the UI feel random whenever API data changes.

## If We Rebuild It
Suggested implementation path:

1. Keep the current working site untouched
2. Create a new skills page version behind a temporary route or feature flag
3. Fetch data server-side like the homepage
4. Use a small mapping config for pillar grouping
5. Test visually before replacing the current page
