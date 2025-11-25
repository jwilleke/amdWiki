# Brainstorm Update – Super Clean & Practical Path Forward

for <https://github.com/jwilleke/amdWiki>

Here’s the refined, realistic, still-nextgen architecture we can actually ship fast:

## Final Stack for All Add-Ons (in /addons folder)

| Layer              | Technology                          | Why it’s perfect for amdWiki                                                                 |
|-------------------|-------------------|---------------------------------------------------------------------------------------------|
| Core Storage       | File system + SQLite (with FTS5) | SQLite = single file, zero config, full ACID, SQL power. Lives in `/data/addons/`           |
| Structured Data    | JSON + schema.org validation        | Every record is valid JSON-LD (Person, Organization, FinancialProduct, Invoice, Payment…) |
| Reports & Exports  | Markdown files + on-the-fly CSV/JSON/PDF | Generated Markdown pages live alongside normal wiki pages → instantly viewable and editable |
| Attachments        | Existing amdWiki attachments folder | No new storage system needed                                                                |
| Search             | Existing amdWiki full-text search + optional SQLite FTS5 | Fast and works out of the box                                                               |

### Proposed /addons Folder Structure (final brainstorm layout)

```text
/addons
├── person-contacts/              ← Enhances existing users with full schema.org/Person + Organization
│   ├── db.sqlite                 ← One tiny file with tables: persons, organizations, relationships
│   ├── views/
│   ├── routes.js
│   └── index.js
│
├── financial-ledger/             ← Money in / money out
│   ├── db.sqlite
│   ├── reports/                  ← Auto-generated Markdown reports (git-tracked or not)
│   │   ├── 2025-11-summary.md
│   │   └── q4-2025-profit-loss.md
│   ├── exports/                  ← CSV, JSON-LD, PDF downloads (temp or permanent)
│   ├── routes.js
│   └── index.js
│
├── business-hub/                 ← The integrator dashboard
│   ├── index.js                  ← Pulls latest data from the two add-ons above
│   └── dashboard.md              ← Dynamic page regenerated on every visit or via cron
│
└── shared/                       ← Common utilities used by all add-ons
    ├── sqlite.js                     ← SQLite wrapper with schema.org validation
    ├── markdown-report-engine.js
    └── export-utils.js
```

### Ultra-Minimal Viable Launch Plan (4–6 weeks total)

| Week | Deliverable                                | What you get immediately |
|------|--------------------------------------------|--------------------------|
| 1    | `person-contacts` add-on + schema.org fields on users | Full contact directory, searchable, embeddable `[{Person id='...'}]` |
| 2    | `financial-ledger` add-on with SQLite      | Log transactions, running balance, link to any Person/Organization |
| 3    | Report generator → Markdown + CSV/JSON export | Click “Generate Monthly Report” → new wiki page + downloadable files |
| 4    | `business-hub` dashboard page              | One single URL that shows: ```<br>• Current cash balance <br>• 5 latest transactions <br>• 5 recent contacts <br>•``` Quick-report buttons |
| 5–6  | Polish + optional extras                   | PDF export (via puppeteer or md-to-pdf), recurring report scheduling, simple charts with Mermaid |

### Example of a generated Markdown report (lives as normal wiki page)

```markdown
# Financial Summary – November 2025

<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "FinancialProduct", ... }
</script>

**Balance**: $8,420.00 USD  
**Total In**: $15,000.00  
**Total Out**: $6,580.00  

| Date       | Description           | Contact                     | Amount     | Running |
|------------|-----------------------|-----------------------------|------------|---------|
| 2025-11-25 | Invoice #1001 paid    | [{Person id='cust-001'}]    | +$5,000.00 | $8,420  |
| 2025-11-20 | Office rent           | [{Person id='vendor-003'}]  | –$2,000.00 | $3,420  |
```

→ Looks beautiful in amdWiki, is searchable, versioned, and exportable.

### Why this wins
- 100 % compatible with current amdWiki (no Docker, no external services)
- Everything is still just files + one tiny SQLite file per add-on
- Reports are real wiki pages → collaborative, auditable, printable
- Exports are one-click from the report page
- Future-proof: later we can swap SQLite → PostgreSQL/MySQL/Mongo with zero user impact

We’re now at the simplest, most powerful, fully standards-based (schema.org) path that still feels “nextgen”.

Ready to start coding the first add-on (`person-contacts`) this week?  
Just say the word and I’ll drop the exact file-by-file code structure.
