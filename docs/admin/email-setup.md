# Email Setup

EmailManager provides all outbound email for ngdpbase: magic-link authentication,
notification escalation, and future server-error alerts. It is configured once under
`ngdpbase.mail.*` and shared by every feature that sends email.

---

## Configuration

All settings live in your instance `app-custom-config.json`
(`$FAST_STORAGE/config/app-custom-config.json`).

### Minimal example (SMTP)

```json
"ngdpbase.mail.enabled": true,
"ngdpbase.mail.provider": "smtp",
"ngdpbase.mail.from": "Wiki <noreply@yourdomain.com>",
"ngdpbase.mail.provider.smtp.host": "smtp.example.com",
"ngdpbase.mail.provider.smtp.port": 587,
"ngdpbase.mail.provider.smtp.secure": false,
"ngdpbase.mail.provider.smtp.user": "YOUR_SMTP_USERNAME",
"ngdpbase.mail.provider.smtp.pass": "YOUR_SMTP_PASSWORD_OR_API_KEY"
```

### All config keys

| Key | Default | Description |
|-----|---------|-------------|
| `ngdpbase.mail.enabled` | `false` | Master switch. Set `true` to enable email delivery. |
| `ngdpbase.mail.provider` | `"console"` | `"console"` prints to log; `"smtp"` sends via SMTP. |
| `ngdpbase.mail.from` | `""` | Global default sender. Overridden by `smtp.from`. |
| `ngdpbase.mail.provider.smtp.host` | `""` | SMTP relay hostname (required). |
| `ngdpbase.mail.provider.smtp.port` | `587` | SMTP port. Use `587` (STARTTLS) or `465` (TLS). |
| `ngdpbase.mail.provider.smtp.secure` | `false` | `true` for port 465 (TLS); `false` for 587 (STARTTLS). |
| `ngdpbase.mail.provider.smtp.user` | `""` | SMTP username (most relays require this). |
| `ngdpbase.mail.provider.smtp.pass` | `""` | SMTP password or API key (see Security below). |
| `ngdpbase.mail.provider.smtp.from` | `""` | Overrides `mail.from`; allows display names like `"Wiki <noreply@example.com>"`. |

---

## SMTP provider quick reference

Every provider below uses standard SMTP — only the host/credentials change.

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| **Resend** | `smtp.resend.com` | 587 | User = `resend`, Pass = API key. Free tier 100/day. |
| **SendGrid** | `smtp.sendgrid.net` | 587 | User = `apikey`, Pass = API key. |
| **Gmail** | `smtp.gmail.com` | 587 | Requires an App Password (not your account password). |
| **AWS SES** | region-specific | 587 | IAM SMTP credentials, not regular AWS keys. |
| **Mailhog** (local) | `localhost` | 1025 | No auth. Development/testing only. |
| **Self-hosted Postfix** | your server IP | 587 | Configure relay or smarthost as needed. |

### Gmail App Password

1. Enable 2FA on the Google account.
2. Go to **Google Account → Security → App passwords**.
3. Generate a password for "Mail / Other".
4. Use that 16-character password as `smtp.pass` (no spaces).

---

## Custom domain sending (SPF / DKIM / DMARC)

If you send from your own domain you need DNS records so recipients don't reject your
mail as spam.

| Record | Purpose | Who configures it |
|--------|---------|-------------------|
| **SPF** | Authorize your SMTP relay to send for your domain | You, in your DNS |
| **DKIM** | Cryptographic signature on outgoing mail | Your SMTP provider (gives you a DNS record to add) |
| **DMARC** | Policy for what to do with failing mail | You, in your DNS (start with `p=none`) |

Most managed relays (Resend, SendGrid, SES) walk you through adding these records in
their onboarding flow.

---

## Security

`smtp.pass` is a credential. Keep it out of source control:

- `app-custom-config.json` is in `.gitignore` — never commit it.
- For containerised deployments, inject it via an environment variable and reference it
  in your config management layer.
- Use an API key scoped to "send mail only" rather than a full account password.

---

## Troubleshooting

**Emails printing to log instead of being sent**
: Check `ngdpbase.mail.provider` is `"smtp"` and `ngdpbase.mail.enabled` is `true`.

**Connection refused on port 587**
: Some hosts block outbound SMTP. Try port 465 with `secure: true`, or use a relay that
  supports port 2587.

**"Self-signed certificate" error**
: Add `"ngdpbase.mail.provider.smtp.tls-reject-unauthorized": false` — only for
  self-hosted dev instances.

**Gmail "Username and Password not accepted"**
: You must use an App Password, not your Google account password. See section above.

**Startup error: `smtp.host is not configured`**
: Set `ngdpbase.mail.provider.smtp.host` in your instance config.

**Startup error: `No from address configured`**
: Set either `ngdpbase.mail.from` or `ngdpbase.mail.provider.smtp.from`.
