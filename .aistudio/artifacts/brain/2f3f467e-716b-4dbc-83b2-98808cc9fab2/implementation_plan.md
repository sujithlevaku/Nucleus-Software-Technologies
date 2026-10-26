# Zero-Login Google Sheet Enquiry Form Architecture

A streamlined, friction-free enquiry submission system that allows website visitors to submit briefings directly into the owner's Google Sheet (`Date, Name, Email, Message`) without any Google Sign-In requirement, without asking visitors for a Date field, and without using local storage.

> [!IMPORTANT]
> **Confirmed Decisions**:
> 1. **Zero Visitor Sign-In**: Visitors submit the form (`Name`, `Email`, `Message`) with 0 authentication barriers. No Google popup, no login prompt, and no account requirement.
> 2. **No Date Field in Form UI**: The date is automatically generated and stamped in the background (`YYYY-MM-DD`) so visitors only need to input **Name**, **Email**, and **Message**.
> 3. **No Local Storage for Leads**: Submissions post directly to the designated Google Sheet via the Google Apps Script Webhook or direct Google Sheets API. No leads are stored or persisted in browser `localStorage`.
> 4. **Submission Channel**: Submissions post directly to the Google Sheet via a **Google Apps Script Web App Webhook** (`doPost` endpoint) deployed with `Anyone` access, or direct Google Sheets API append.
> 5. **Owner Auth Concealment**: Google Sign-In controls are completely removed from the public visitor interface and tucked into a discreet Owner Ops Console modal accessible via the footer.

---

### 1. Overview & Core Concept

- **What It Does**: Visitors filling out the "Initiate Mission" enquiry form will submit their project inquiry (**Name**, **Email**, **Message**). The system automatically attaches today's date in `YYYY-MM-DD` and transmits the 4-column record (`Date, Name, Email, Message`) directly to the Google Sheet.
- **Target Audience**: Prospective clients, partners, and enterprise visitors seeking software consulting and IT engineering services from Nucleus Soft Tech.
- **Key Value**: 100% frictionless visitor conversion with no date input burden, no login requirement, and immediate transmission to the owner's spreadsheet.

---

### 2. User Experience & Visual Design

- **Visitor Experience**:
  - The form is clean, high-tech, and minimal with only 3 essential fields:
    1. **Name** (Full name / Lead contact).
    2. **Email** (Work email address with real-time format validation).
    3. **Message** (Project brief or scope).
  - Date is auto-computed as today's date in `YYYY-MM-DD` and sent with the submission.
  - Prominent "Submit Enquiry to Spreadsheet" action button with cyber-glow micro-interaction.
  - Interactive terminal telemetry feedback displaying live transmission status, verification checkmark, and lead reference code.
  - Zero Google login prompts, badges, or warnings displayed on the form.

- **Discreet Owner Administration**:
  - The bulky "Spreadsheet Sync Channel / Sign in with Google" HUD is completely removed from above the public form.
  - A subtle, discreet indicator in the bottom copyright bar opens the **Owner Ops Console** where the owner can:
    - View or update the active Google Sheet ID / Apps Script Webhook URL.
    - Copy the copy-paste-ready Apps Script code snippet for the Google Sheet.
    - Inspect live sheet leads fetched directly from Google Sheets API or current session submissions.
    - Sign in with Google for owner-level sheet generation and direct API append testing.

---

### 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               Public Visitor (Browser)                 │
│                 [Name]  [Email]                        │
│                 [Project Message]                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │  1. Submit (Auto-stamps Date: YYYY-MM-DD)
                           ▼
┌────────────────────────────────────────────────────────┐
│             InitiateProject Form Handler               │
│  - Field sanitization & validation                     │
│  - Zero localStorage usage                             │
│  - Live cyber telemetry log animation                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ 2. HTTP POST (Webhook / API)
                           ▼
┌────────────────────────────────────────────────────────┐
│ Google Apps Script Web App (doPost) / Sheets API       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ 3. appendRow([Date, Name, Email, Message])
                           ▼
┌────────────────────────────────────────────────────────┐
│             Target Google Spreadsheet                  │
│       Headers: Date | Name | Email | Message           │
└────────────────────────────────────────────────────────┘
```

#### Form Data Model & Payload
```typescript
interface LeadSubmission {
  id?: string;
  date: string;       // Auto-computed YYYY-MM-DD
  name: string;       // Visitor input
  email: string;      // Visitor input
  message: string;    // Visitor input
  submittedAt?: string;
  status?: 'POSTED_TO_SHEET' | 'PENDING_SYNC' | 'QUEUED';
}
```

---

### 4. Verification & Testing Steps

1. **Visitor Submission Flow**:
   - Verify only Name, Email, and Message fields are rendered in the enquiry form.
   - Verify submission succeeds immediately without opening any Google Sign-In popup or asking for credentials.
   - Verify telemetry terminal shows schema validation `[Date (Auto: YYYY-MM-DD), Name, Email, Message]`.
2. **Owner Ops Console**:
   - Access the discreet Ops Console modal via the footer.
   - Confirm Webhook URL configuration, Apps Script copy snippet, and live sheet leads viewer.
   - Confirm zero localStorage calls or persistence of leads.
3. **Compilation & Linting**:
   - Ran `lint_applet` (`tsc --noEmit`) and `compile_applet` with 0 errors.
