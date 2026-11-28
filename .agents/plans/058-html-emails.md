# 058 — Branded HTML emails

Status: done
Date: 2026-11-27

## Goal

Send the password reset and sign-up emails as a styled HTML page with the Mindboop logo and brand colours, instead of
bare paragraphs, and have them render the same across email clients (Gmail, Outlook desktop and web, Apple Mail, iOS,
Android).

## Decisions

| Area | Choice |
| --- | --- |
| Layout | `layouts/mailer.html.erb`: table-based, 600px max width (a fixed 600px table for Outlook via `<!--[if mso]>`), beige page, white card with a coral top border, logo and wordmark above, recipient footer below. A hidden preheader (`content_for :preheader`) sets the inbox preview line |
| Styles | All inline, because Gmail and Outlook drop most `<style>` rules. The `<style>` block is only progressive enhancement (resets, mobile padding). No CSS-inliner gem: the styles live in `MailerHelper` (`email_heading`, `email_paragraph`, `email_note`, `email_link`, `email_button`, `email_fallback_link`), and the colours mirror `tokens.css` |
| Button | "Bulletproof": the `<td>` carries `bgcolor`, so Outlook (no padding or radius on links) still shows a filled button. Every link button is followed by the URL in plain text |
| Logo | `app/mailers/images/logo.png`, a 144px copy of the brand logo shown at 72px (sharp on retina). `ApplicationMailer` attaches it inline (CID), so it shows where remote images are blocked by default, needs no public asset host, and Resend sends it as an inline attachment |
| Dark mode | `color-scheme: light` only, so clients that respect it keep the brand colours. The rest may auto-invert, and the palette stays readable |
| Font | System stack (Inter isn't available in mail clients); Arial forced for Outlook |
| Plain text | Every email keeps its text part; the text layout adds a Mindboop sign-off |
| Previews | `test/mailers/previews` (`/rails/mailers` in development) |
| Sender | `ApplicationMailer` sends from `Mindboop <address>`, taking the address from the configured `from` (`MAILER_FROM` in production) and replacing any display name it has |
