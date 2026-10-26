import { getAccessToken } from './googleAuth';

export interface LeadSubmission {
  id?: string;
  date: string;
  name: string;
  email: string;
  message: string;
  submittedAt?: string;
  status?: 'POSTED_TO_SHEET' | 'PENDING_SYNC' | 'QUEUED';
  sheetRange?: string;
}

export interface SpreadsheetSummary {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetTitle: string;
}

export const HEADERS = ['Date', 'Name', 'Email', 'Message'];
export const LOCAL_STORAGE_WEBHOOK_KEY = 'NUCLEUS_SHEET_WEBHOOK_URL';
export const DEFAULT_WEBHOOK_URL =
  ((import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) ||
  'https://script.google.com/macros/s/AKfycbzDexVWjkhwoTNy5ZY3YZ-wTVzmZDuVOQwVBTV5BZ_wPeXQW3ne2t5in475Rc8O5Bu3/exec';

/**
 * Creates a brand new Google Spreadsheet formatted with the exact headers:
 * Date, Name, Email, Message
 */
export async function createLeadsSpreadsheet(
  customTitle = 'Nucleus Soft Tech - Leads'
): Promise<SpreadsheetSummary> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google to create a spreadsheet.');
  }

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: customTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Leads',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: HEADERS.map((header) => ({
                    userEnteredValue: { stringValue: header },
                    userEnteredFormat: {
                      textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                      backgroundColor: { red: 0.08, green: 0.1, blue: 0.18 },
                      horizontalAlignment: 'CENTER',
                    },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Sheet: ${response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: data.properties?.title || customTitle,
    sheetTitle: 'Leads',
  };
}

/**
 * Fetch spreadsheet metadata to get its title and sheet names
 */
export async function getSpreadsheetDetails(spreadsheetId: string): Promise<{
  title: string;
  sheets: string[];
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google.');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch sheet info: ${response.statusText}`);
  }

  const data = await response.json();
  const title = data.properties?.title || 'Google Sheet';
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title as string);

  return { title, sheets };
}

/**
 * Appends a single row to the designated Google Sheet:
 * [Date, Name, Email, Message]
 */
export async function appendLeadToSheet(
  spreadsheetId: string,
  lead: LeadSubmission,
  sheetTitle?: string,
  explicitToken?: string | null
): Promise<{ updatedRange: string; updatedRows: number }> {
  const token = explicitToken || (await getAccessToken());
  if (!token) {
    throw new Error('Authentication token missing. Please sign in with Google or configure a Webhook.');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const targetSheet = sheetTitle ? `${sheetTitle}!A:D` : 'A:D';
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
    targetSheet
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const formattedDate = lead.date || new Date().toISOString().split('T')[0];

  const rowValues = [
    formattedDate,
    lead.name,
    lead.email,
    lead.message,
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to append lead to Google Sheet: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    updatedRange: data.updates?.updatedRange || targetSheet,
    updatedRows: data.updates?.updatedRows || 1,
  };
}

/**
 * Direct post via Google Apps Script Web App webhook.
 * Allows public visitors to post directly to Google Sheets with zero OAuth friction.
 */
export async function postLeadToWebhook(
  webhookUrl: string,
  lead: LeadSubmission
): Promise<{ success: boolean; message: string }> {
  const targetUrl = webhookUrl?.trim() || DEFAULT_WEBHOOK_URL;
  const formattedDate = lead.date || new Date().toISOString().split('T')[0];

  // Provide both PascalCase (data.Name, data.Email, data.Message matching user's Apps Script)
  // and lowercase for universal compatibility across any webhook or Apps Script implementation
  const payload = {
    Name: lead.name,
    Email: lead.email,
    Message: lead.message,
    Date: formattedDate,
    name: lead.name,
    email: lead.email,
    message: lead.message,
    date: formattedDate,
    timestamp: new Date().toISOString(),
  };

  try {
    let dispatchUrl = targetUrl;
    try {
      const parsedUrl = new URL(targetUrl);
      // Append both PascalCase and lowercase query parameters so Apps Script's e.parameter has data.Name, data.Email, data.Message
      parsedUrl.searchParams.set('Name', lead.name);
      parsedUrl.searchParams.set('Email', lead.email);
      parsedUrl.searchParams.set('Message', lead.message);
      parsedUrl.searchParams.set('Date', formattedDate);
      parsedUrl.searchParams.set('name', lead.name);
      parsedUrl.searchParams.set('email', lead.email);
      parsedUrl.searchParams.set('message', lead.message);
      parsedUrl.searchParams.set('date', formattedDate);
      dispatchUrl = parsedUrl.toString();
    } catch {
      dispatchUrl = targetUrl;
    }

    await fetch(dispatchUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true, message: 'Payload dispatched to Google Sheets webhook.' };
  } catch (err: any) {
    console.error('Webhook dispatch error:', err);
    throw new Error(err.message || 'Failed to dispatch to spreadsheet webhook');
  }
}

/**
 * Fetch rows from the sheet for live lead monitoring in the HUD
 */
export async function fetchRecentLeads(
  spreadsheetId: string,
  sheetTitle?: string,
  maxRows = 50
): Promise<LeadSubmission[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const targetRange = sheetTitle ? `${sheetTitle}!A2:D${maxRows + 1}` : `A2:D${maxRows + 1}`;
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
    targetRange
  )}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, idx) => ({
    id: `GS-${idx + 1}`,
    date: row[0] || '',
    name: row[1] || '',
    email: row[2] || '',
    message: row[3] || '',
    status: 'POSTED_TO_SHEET',
  }));
}

// Local storage persistence has been removed per requirements: submissions post directly to Google Sheet/Webhook.

export function exportLeadsToCsv(leads: LeadSubmission[]): void {
  const csvRows = [
    HEADERS.join(','),
    ...leads.map((l) => [
      `"${(l.date || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ].join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nucleussoft_Leads_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper to extract Google Spreadsheet ID from raw ID or full Google Sheets URL
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return match[1];
  }
  return trimmed;
}

export const APPS_SCRIPT_SNIPPET = `// Nucleus Soft Tech - Google Sheets Auto-Append Webhook
// Setup Instructions:
// 1. In your Google Sheet, open: Extensions > Apps Script
// 2. Paste this function and click Save
// 3. Click Deploy > New deployment > Select type: Web app
// 4. Set "Execute as: Me" and "Who has access: Anyone"
// 5. Deploy, copy the Web App URL, and paste it into the Webhook URL field!

function doPost(e) {
  if (!e) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "No event data" }));
  }

  var data = e.parameter || {};
  if (Object.keys(data).length === 0 && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = {};
    }
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Case-insensitive extraction for Name, Email, Message
  var name = data.Name || data.name || "";
  var email = data.Email || data.email || "";
  var message = data.Message || data.message || "";
  
  // Append [Date, Name, Email, Message]
  sheet.appendRow([new Date(), name, email, message]);
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

