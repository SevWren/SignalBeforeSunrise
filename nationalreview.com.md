# National Review RSS Fetching Debugging

This document tracks attempts to resolve the `403 Forbidden` error when fetching the National Review RSS feed (`https://www.nationalreview.com/feed`) via the server-side proxy.

## Current Implementation
The proxy currently uses the following techniques for all RSS requests:
1. **Comprehensive Browser-like Headers:** Rotated `User-Agent`, `Accept`, `Accept-Language`, `Sec-Fetch-*`, `Upgrade-Insecure-Requests`.
2. **Dynamic Referer Injection:** Sets `Referer` to the target domain's root URL.
3. **Connection Persistence:** Sets `Connection: keep-alive`.

## Attempt 1
- **Action:** Applied the same successful retrieval method used for Newsmax to National Review.
- **Outcome:** Failed. Logs show `Target returned 403 Forbidden`.

## Attempt 4
- **Action:** Fixed the XML parsing error by updating the RSS proxy to return JSON for fallback responses and updating the frontend to correctly parse JSON responses.
- **Outcome:** Successful. The National Review feed now loads using the fallback RSS-to-JSON service when direct fetch fails.

## Painstakingly Detailed Industry Standard Plans for New Retrieval Methods.  Unique to 2026.