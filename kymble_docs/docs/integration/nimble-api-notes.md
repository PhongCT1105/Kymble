# Nimble Participant API Notes

Participant signup:

`https://online.nimbleway.com/signup`

## Required demo operations

The MVP requires only two provider capabilities:

1. search the public web for candidate pages;
2. extract the strongest pages into usable content.

Do not add Crawl, Map, or additional agent endpoints until Search + Extract complete the golden path.

## Configuration

```bash
NIMBLE_API_KEY=<private participant key>
NIMBLE_API_BASE_URL=<confirmed from participant docs>
NIMBLE_MODE=live
```

Never commit the key.

## Endpoint verification checklist

Record the exact participant-account documentation before implementation:

| Item | Confirmed value |
|---|---|
| Search endpoint | |
| Extract endpoint | |
| Auth header | |
| Search request schema | |
| Search response schema | |
| Extract request schema | |
| Extract response schema | |
| Credit cost | |
| Rate limits | |
| Retry guidance | |

## Golden-path query strategy

Use a maximum of four discovery queries and two page extractions during the live presentation.

Example query categories:

```text
"autonomous account research agent" company
"AI SDR" "web data" launch
"multi-agent" sales research CRM company
"web extraction" "data engineer" AI startup
```

After discovery:

1. select the strongest official product, documentation, job, or launch page;
2. extract the page;
3. normalize a short supporting excerpt;
4. store the raw response;
5. send the evidence to the verifier.

## Credit discipline

- cache successful responses during development;
- never rerun extraction on unchanged pages without reason;
- use fixtures in unit and E2E tests;
- use live mode only for manual integration testing and the presentation;
- track each live request in `provider_responses`.

## Fallback behavior

On timeout, rate limit, validation error, or 5xx:

1. retry within the configured budget;
2. load the cached provider response;
3. set `trust_label` to `cached`;
4. log the failure;
5. show the cached badge in the UI.
