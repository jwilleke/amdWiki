# Brainstorm Update – Super Clean & Practical Path Forward

for <https://github.com/jwilleke/amdWiki>

This is based on <https://github.com/jwilleke/amdWiki/issues/154> and how to add "Small Business" addons to the Next-gen Digital PLatform.

## Other discussions on this Subject

[Grok](https://grok.com/share/bGVnYWN5_403b6082-7411-4efe-a380-f58c63822e86)

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


## Medici
Medici is a fantastic find—it's a lightweight, double-entry accounting library for Node.js + Mongoose/MongoDB, designed exactly for managing financial journals, transactions, and balances with ACID compliance. In our context, it could supercharge the financial-ledger add-on, replacing or wrapping our SQLite setup with proper accounting rules (debits = credits, hierarchical accounts, voiding instead of deletes). This aligns perfectly with schema.org (we can map to FinancialProduct/Invoice via metadata) and keeps things standards-based.
Since we're brainstorming, let's explore how Medici fits our ultra-minimal path: Drop-in integration via /addons/financial-ledger/, with MongoDB as the backend (easy to add via Docker or Atlas free tier). No full rewrite—just enhance the ledger for real-world business use (e.g., invoicing, expense tracking). BusinessHub can then query Medici for dashboards/reports.

- Pros: Enforces "everything balances" (no more manual math errors); fast caching for balances; extensible metadata (link to schema.org Persons/Organizations).
- Cons: Adds MongoDB dep (but amdWiki is Node.js, so seamless); slight learning curve for double-entry if new.

### How Medici Ties into Our Business Core
Medici handles Financial Transactions (money in/out) natively:

- Double-Entry: Every txn is a balanced journal (e.g., debit Cash, credit Income).
- Linking to Contacts: Use meta field for schema.org refs (e.g., { client: { "@type": "Person", id: "cust-001" } }).
- Interactions Log: Extend journals with memo for notes (e.g., "Payment from [{Person id='cust-001'}]").
- Reports/Exports: Query ledgers → generate Markdown summaries; export as CSV/JSON-LD.

This elevates our 3-core-function model: Transactions now power reliable "Money In/Out," linked to Contacts for full traceability.

### Possible Updated /addons Folder Structure (Medici-Enhanced)

```text
/addons
├── person-contacts/              ← Unchanged: Schema.org Persons + SQLite
│   ├── db.sqlite
│   ├── views/
│   └── index.js
│
├── financial-ledger/             ← Now Medici-powered
│   ├── node_modules/medici/      ← Installed via npm in add-on
│   ├── mongo/                    ← Optional: Local Mongo via Docker or Atlas URI in config
│   ├── reports/                  ← Markdown files from Medici queries
│   │   └── 2025-11-ledger.md
│   ├── exports/                  ← Generated files (CSV/JSON-LD from balances)
│   ├── ledger.js                 ← Medici Book wrapper with schema.org mapping
│   ├── routes.js
│   └── index.js
│
├── business-hub/                 ← Integrator: Queries Medici for financial widgets
│   ├── index.js
│   └── dashboard.md              ← Dynamic: "Current Balance: [{MediciBalance book='Main'}]"
│
└── shared/                       ← Utils now include Medici helpers
    ├── sqlite.js
    ├── medici-wrapper.js         ← Abstracts Book creation, schema injection
    ├── markdown-report-engine.js
    └── export-utils.js
```

### Possible Key Integration Ideas

- Setup: In financial-ledger/package.json: "medici": "^7.2.0". Config: app-custom-config.json adds "db.mongoUri": "mongodb://localhost:27017/amdwiki_ledger".
- Schema.org Mapping: Wrap Medici entries in JSON-LD

```js
// In ledger.js
const { Book } = require('medici');
const book = new Book('MainBook');

// Create txn with schema
const journal = await book
  .entry('Invoice Payment')
  .debit('Assets:Cash', 1500, { schema: { '@type': 'MonetaryAmount', value: '1500.00', currency: 'USD' } })
  .credit('Income:Sales', 1500, { client: 'cust-001', schema: { '@type': 'Person', name: 'John Doe' } })
  .commit();

// Export with LD
const ldExport = { '@context': 'https://schema.org', '@type': 'FinancialProduct', entries: journal };
```

- Database: Medici uses MongoDB collections (Medici_Journals, Medici_Transactions). For dev: Docker-compose with Mongo. Production: Atlas (free tier <512MB).
- Fallback: Keep SQLite option via config flag—Medici for prod, SQLite for simple logging.


### Why Medici Elevates This to NextGen

- Accuracy: Double-entry prevents errors—ideal for real businesses (not just toy ledgers).
- Scalability: MongoDB handles growth; caching keeps queries instant.
- Standards Fit: Metadata + JSON-LD = schema.org-ready exports (e.g., for Google Finance snippets).
- amdWiki Synergy: Node.js native; embed ledgers in wiki pages for "living financial docs" (e.g., project budgets as pages with auto-updating balances).

This feels like the missing piece—turns our simple tracker into a pro tool. 

Thoughts: Go full Medici, or hybrid with SQLite for non-financial logs? 
Ready for a prototype medici-wrapper.js snippet?

- [Medici Repo](https://github.com/flash-oss/medici)
- [Mongoose Schema Guide](https://mongoosejs.com/docs/schemas.html)

## AddonsManager
[AddonsManager](https://github.com/jwilleke/amdWiki/issues/158) 

## person-contacts add-on
Create an issue for person-contacts add-on. [person-contacts add-on](https://github.com/jwilleke/amdWiki/issues/157)

Please remember Add-ons must be Add-ons and not required for basic amdWiki Operations

## financial-ledger add-on
Create an issue for Basic SQLite financial-ledger add-on with ability to upgrade to full Go full Medici

Please remember Add-ons must be Add-ons and not required for basic amdWiki Operations

## business-hub

[business-hub](https://github.com/jwilleke/amdWiki/issues/158)