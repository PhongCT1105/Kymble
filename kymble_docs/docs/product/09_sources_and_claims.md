# Sources and Claims Register

This document separates official facts from product hypotheses and synthetic demo data.

## Challenge-provided setup

### Nimble participant signup

`https://online.nimbleway.com/signup`

Use: create the participant account and API key.

### Kylon challenge workspace

`https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj`

Use: inspect and operate the sponsor-provided workspace. The implementation may only claim capabilities that are actually visible or confirmed there.

## Nimble official product

Source: [Nimble home](https://www.nimbleway.com/)

Claims used:

- Nimble provides public-web intelligence for AI and data workflows.
- Kymble uses Nimble as the live discovery and extraction provider.

Source: [Nimble documentation](https://docs.nimbleway.com/home)

Claims used:

- Search and page extraction workflows are available through official developer tooling.
- Search results and extracted page content can be normalized into evidence records.

Always verify the exact endpoint names and response schemas against the participant account documentation before coding.

## Nimble customer case studies

### Alta

Source: [Alta customer story](https://www.nimbleway.com/case-studies/customer-story-alta)

Claims retained in seed data:

- Alta is described as a GTM operating system.
- Its agents require external product, competitor, customer-story, technographic, and buying-signal context.
- The story describes very high page-processing scale.
- The story reports deeper context and high job success.

### Qodo

Source: [Qodo customer story](https://www.nimbleway.com/case-studies/qodo)

Claims retained:

- Qodo needs fresh context from changing technical sources.
- Static embeddings became stale.
- Page discovery without sufficient extraction was not enough.

### Grips Intelligence

Source: [Grips Intelligence customer story](https://www.nimbleway.com/case-studies/grips-intelligence)

Claims retained:

- Grips is an e-commerce data and insights business.
- Its story describes product and pricing intelligence across many websites and brands.

## Kylon official product

Source: [Kylon home](https://kylon.io/)

Claims retained only when still visible or confirmed in the workspace:

- Kylon is an AI-native workspace for human-agent teams.
- The product emphasizes shared context, structured work, collaboration, permissions, and human oversight.

The challenge workspace is the operational source of truth for what can be demonstrated during the event.

## Hypotheses—not verified customer facts

These must be labeled `inferred` or `synthetic`:

- Kylon ideal customer profile;
- public signals indicating Kylon purchase intent;
- signal weights and thresholds;
- RevPilot AI, CodeCurrent, ShelfPulse, AgentMesh Labs, and MarketAtlas;
- contacts, social or content engagement, forms, meetings, replies, and opportunity values;
- recommended outreach or workshop language;
- any claim about a real target company that Nimble has not extracted and the verifier has not accepted.

## Source quality hierarchy

1. official customer case study;
2. official product, documentation, job, or company page;
3. official launch or newsroom page;
4. reputable third-party publication;
5. public company or employee post;
6. search snippet without extraction.

A search snippet alone should not qualify an account when the underlying page is available.
