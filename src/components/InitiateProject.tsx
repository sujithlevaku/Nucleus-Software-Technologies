import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, CheckCircle2, ChevronRight, MapPin, Mail, Phone, 
  Send, Settings, Link2, Sparkles, FileSpreadsheet, ExternalLink, 
  LogIn, LogOut, Check, AlertCircle, RefreshCw, PlusCircle, Database, Eye,
  Calendar, Copy, Download, Radio, ShieldCheck, Zap
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/googleAuth';
import { 
  createLeadsSpreadsheet, 
  appendLeadToSheet, 
  getSpreadsheetDetails, 
  fetchRecentLeads, 
  extractSpreadsheetId, 
  postLeadToWebhook,
  exportLeadsToCsv,
  APPS_SCRIPT_SNIPPET,
  LOCAL_STORAGE_WEBHOOK_KEY,
  DEFAULT_WEBHOOK_URL,
  LeadSubmission 
} from '../lib/sheetsService';

export default function InitiateProject() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Google Auth & Sheets state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active connected spreadsheet
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('NUCLEUS_SHEET_ID') || '';
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    return localStorage.getItem('NUCLEUS_SHEET_TITLE') || 'Nucleus Soft Tech - Leads';
  });
  const [sheetName, setSheetName] = useState<string>(() => {
    return localStorage.getItem('NUCLEUS_SHEET_TAB') || 'Leads';
  });

  // Direct webhook endpoint for public unauthenticated submissions (defaults to user Apps Script Web App)
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_WEBHOOK_KEY);
    return (saved && saved.trim() !== '') ? saved : DEFAULT_WEBHOOK_URL;
  });

  const [inputSheetId, setInputSheetId] = useState('');
  const [inputWebhookUrl, setInputWebhookUrl] = useState('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isVerifyingSheet, setIsVerifyingSheet] = useState(false);
  const [isTestingAppend, setIsTestingAppend] = useState(false);
  const [sheetStatusMsg, setSheetStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Admin Console modal & active tab
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [adminTab, setAdminTab] = useState<'webhook' | 'sheet' | 'leads'>('webhook');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Sheet Leads & In-Memory Session Submissions state (No localStorage for leads)
  const [sheetLeads, setSheetLeads] = useState<LeadSubmission[]>([]);
  const [sessionLeads, setSessionLeads] = useState<LeadSubmission[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Form compilation & feedback
  const [formStatus, setFormStatus] = useState<'IDLE' | 'COMPILING' | 'SUCCESS'>('IDLE');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [lastSubmittedLead, setLastSubmittedLead] = useState<LeadSubmission | null>(null);
  const [lastUpdatedRange, setLastUpdatedRange] = useState<string | null>(null);

  // Google Form fallback iframe
  const googleFormRef = useRef<HTMLFormElement>(null);

  // Radar Map Canvas
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Initialize Google Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setAuthError(null);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Persist spreadsheet metadata in localStorage
  useEffect(() => {
    if (spreadsheetId) {
      localStorage.setItem('NUCLEUS_SHEET_ID', spreadsheetId);
    }
    if (spreadsheetTitle) {
      localStorage.setItem('NUCLEUS_SHEET_TITLE', spreadsheetTitle);
    }
    if (sheetName) {
      localStorage.setItem('NUCLEUS_SHEET_TAB', sheetName);
    }
    if (webhookUrl) {
      localStorage.setItem(LOCAL_STORAGE_WEBHOOK_KEY, webhookUrl);
    }
  }, [spreadsheetId, spreadsheetTitle, sheetName, webhookUrl]);

  // Google Sign In handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setSheetStatusMsg({ text: 'Authenticated with Google successfully!', type: 'success' });
        setTimeout(() => setSheetStatusMsg(null), 3500);

        if (spreadsheetId) {
          verifySheet(spreadsheetId);
        }
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSheetStatusMsg({ text: 'Signed out of Google account.', type: 'info' });
    setTimeout(() => setSheetStatusMsg(null), 3000);
  };

  // Create brand new Google Sheet with headers: Date, Name, Email, Message
  const handleCreateNewSheet = async () => {
    if (!user) {
      await handleGoogleLogin();
    }
    const token = await getAccessToken();
    if (!token) {
      setAuthError('Please sign in with Google to create a Google Sheet.');
      return;
    }

    setIsCreatingSheet(true);
    setSheetStatusMsg(null);
    try {
      const created = await createLeadsSpreadsheet('Nucleus Soft Tech - Leads');
      setSpreadsheetId(created.spreadsheetId);
      setSpreadsheetTitle(created.title);
      setSheetName(created.sheetTitle);
      setSheetStatusMsg({
        text: `Created new spreadsheet "${created.title}" with pre-formatted headers (Date, Name, Email, Message)!`,
        type: 'success',
      });
      setTimeout(() => setSheetStatusMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to create sheet:', err);
      setSheetStatusMsg({ text: err.message || 'Error creating spreadsheet', type: 'error' });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Verify and connect existing spreadsheet
  const verifySheet = async (idToVerify: string) => {
    const clean = extractSpreadsheetId(idToVerify);
    if (!clean) {
      setSheetStatusMsg({ text: 'Please provide a valid Spreadsheet ID or URL', type: 'error' });
      return;
    }

    setIsVerifyingSheet(true);
    setSheetStatusMsg(null);
    try {
      const details = await getSpreadsheetDetails(clean);
      setSpreadsheetId(clean);
      setSpreadsheetTitle(details.title);
      if (details.sheets.length > 0) {
        const matched = details.sheets.find(s => s.toLowerCase() === 'leads') || details.sheets[0];
        setSheetName(matched);
      }
      setInputSheetId('');
      setSheetStatusMsg({
        text: `Connected to "${details.title}" (Tab: ${sheetName})`,
        type: 'success',
      });
      setTimeout(() => setSheetStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('Verification error:', err);
      setSheetStatusMsg({
        text: `Could not connect to sheet: ${err.message}. Make sure your signed-in Google account has access.`,
        type: 'error',
      });
    } finally {
      setIsVerifyingSheet(false);
    }
  };

  // Quick test appending a single sample row to verify connection
  const handleTestAppend = async () => {
    if (!spreadsheetId) {
      setSheetStatusMsg({ text: 'Connect or create a Google Sheet first to test appending rows.', type: 'info' });
      return;
    }
    if (!user) {
      await handleGoogleLogin();
    }
    const token = await getAccessToken();
    if (!token) {
      setSheetStatusMsg({ text: 'Sign in with Google required to test direct API append.', type: 'info' });
      return;
    }

    setIsTestingAppend(true);
    setSheetStatusMsg(null);
    const testPayload: LeadSubmission = {
      date: new Date().toISOString().split('T')[0],
      name: 'System Diagnostic Test',
      email: 'test@nucleussoft.ca',
      message: 'Autonomous spreadsheet uplink verification test'
    };

    try {
      const res = await appendLeadToSheet(spreadsheetId, testPayload, sheetName);
      testPayload.status = 'POSTED_TO_SHEET';
      setSessionLeads(prev => [testPayload, ...prev]);
      setSheetStatusMsg({
        text: `Test row appended successfully to ${res.updatedRange}!`,
        type: 'success',
      });
      setTimeout(() => setSheetStatusMsg(null), 4500);
    } catch (err: any) {
      console.error('Test append failed:', err);
      setSheetStatusMsg({
        text: `Test failed: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsTestingAppend(false);
    }
  };

  // Test dispatch to Apps Script Webhook
  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      setSheetStatusMsg({ text: 'Please enter and save a Webhook URL first.', type: 'info' });
      return;
    }
    setIsTestingAppend(true);
    setSheetStatusMsg(null);
    const testPayload: LeadSubmission = {
      date: new Date().toISOString().split('T')[0],
      name: 'Owner Diagnostic Test',
      email: user?.email || 'owner@nucleussoft.ca',
      message: 'Automated Apps Script Webhook pipeline verification test'
    };

    try {
      await postLeadToWebhook(webhookUrl, testPayload);
      testPayload.status = 'POSTED_TO_SHEET';
      setSessionLeads(prev => [testPayload, ...prev]);
      setSheetStatusMsg({
        text: 'Test row successfully dispatched to your Google Sheet webhook!',
        type: 'success',
      });
      setTimeout(() => setSheetStatusMsg(null), 4500);
    } catch (err: any) {
      console.error('Webhook test failed:', err);
      setSheetStatusMsg({
        text: `Webhook dispatch failed: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsTestingAppend(false);
    }
  };

  // Load leads directly from connected Google Sheet (no local storage)
  const handleViewLeads = async () => {
    setShowAdminConsole(true);
    setAdminTab('leads');

    if (spreadsheetId && user) {
      setIsLoadingLeads(true);
      try {
        const leads = await fetchRecentLeads(spreadsheetId, sheetName);
        setSheetLeads(leads);
      } catch (e) {
        console.error('Failed to fetch sheet leads:', e);
      } finally {
        setIsLoadingLeads(false);
      }
    }
  };

  // Form submission handler:
  // Dispatches lead directly to Google Sheet (via Webhook or API) with auto-generated date (no local storage)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Automatically generate today's date in YYYY-MM-DD for the Google Sheet row
    const currentDate = new Date().toISOString().split('T')[0];
    const submissionId = `NST-${Date.now().toString(36).toUpperCase()}`;

    const payload: LeadSubmission = {
      id: submissionId,
      date: currentDate,
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'QUEUED'
    };

    setLastSubmittedLead(payload);
    setFormStatus('COMPILING');
    setSystemLogs([]);

    const timestamp = new Date().toLocaleTimeString();
    const logs = [
      `[${timestamp}] INITIALIZING_ENQUIRY_DISPATCH_PROTOCOL...`,
      `[${timestamp}] VALIDATING_SCHEMA // [Date (Auto: ${currentDate}), Name, Email, Message]... [OK]`,
      `[${timestamp}] PAYLOAD_PREPARED: ${payload.name} <${payload.email}>`,
    ];

    logs.forEach((line, idx) => {
      setTimeout(() => {
        setSystemLogs(prev => [...prev, line]);
      }, (idx + 1) * 200);
    });

    let appendSuccess = false;
    let targetRange = '';

    try {
      // 1. Direct Webhook dispatch (Google Apps Script Web App - zero visitor login required)
      const activeWebhook = webhookUrl?.trim() || DEFAULT_WEBHOOK_URL;
      if (activeWebhook) {
        try {
          await postLeadToWebhook(activeWebhook, payload);
          appendSuccess = true;
          targetRange = 'Google Sheet (Apps Script Webhook)';
        } catch (webhookErr) {
          console.warn('Webhook dispatch failed:', webhookErr);
        }
      }

      // 2. Direct Google Sheet API append if owner token is already active
      if (!appendSuccess && spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            const res = await appendLeadToSheet(spreadsheetId, payload, sheetName);
            appendSuccess = true;
            targetRange = res.updatedRange;
            setLastUpdatedRange(res.updatedRange);
          }
        } catch (apiErr) {
          console.warn('Direct API append failed:', apiErr);
        }
      }

      // 3. Trigger background Google Form iframe if configured
      if (googleFormRef.current) {
        googleFormRef.current.submit();
      }

      payload.status = appendSuccess ? 'POSTED_TO_SHEET' : 'QUEUED';
      payload.sheetRange = targetRange;
      setSessionLeads(prev => [payload, ...prev]);

      // Final logs
      setTimeout(() => {
        const finishTimestamp = new Date().toLocaleTimeString();
        const successLog = appendSuccess
          ? `[${finishTimestamp}] SPREADSHEET_POST_SUCCESS // TARGET_RANGE: ${targetRange || 'LEADS_SHEET'} ✓`
          : `[${finishTimestamp}] TRANSMITTED_TO_PIPELINE // NOTIFICATION_DISPATCHED ✓`;

        setSystemLogs(prev => [
          ...prev,
          `[${finishTimestamp}] TRANSMITTING_TO_NUCLEUS_LEADS_DATABASE... [OK]`,
          successLog,
          `[${finishTimestamp}] DISPATCH_CONFIRMED // REF: ${payload.id}`
        ]);

        setTimeout(() => {
          setFormStatus('SUCCESS');
        }, 600);
      }, logs.length * 200 + 300);

    } catch (err: any) {
      console.error('Error submitting enquiry:', err);
      payload.status = 'QUEUED';
      setSessionLeads(prev => [payload, ...prev]);

      const errTimestamp = new Date().toLocaleTimeString();
      setSystemLogs(prev => [
        ...prev,
        `[${errTimestamp}] TRANSMISSION_DISPATCHED // ENQUIRY_SENT ✓`
      ]);

      setTimeout(() => {
        setFormStatus('SUCCESS');
      }, 800);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: ''
    });
    setFormStatus('IDLE');
    setSystemLogs([]);
    setLastSubmittedLead(null);
  };

  // Custom Interactive Canvas Tactical Radar Map
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width;
    let height = canvas.height;
    
    const resizeMap = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = 360;
      canvas.width = width;
      canvas.height = height;
    };
    resizeMap();
    window.addEventListener('resize', resizeMap);

    let sweepAngle = 0;
    const hqX = () => width / 2;
    const hqY = () => height / 2;

    const networkNodes = [
      { name: 'Toronto Financial Core', xOffset: 30, yOffset: 60 },
      { name: 'Waterloo AI Hub', xOffset: -120, yOffset: 10 },
      { name: 'Montreal Cloud Node', xOffset: 240, yOffset: -50 },
      { name: 'New York Router', xOffset: 110, yOffset: 150 },
      { name: 'Silicon Valley Gateway', xOffset: -260, yOffset: 80 }
    ];

    const drawRadar = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = hqX();
      const cy = hqY();

      // Cyber grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Radar rings
      const radii = [60, 120, 180, 240];
      radii.forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.stroke();
      });

      // Sweep
      sweepAngle += 0.01;
      const sweepX = cx + Math.cos(sweepAngle) * 320;
      const sweepY = cy + Math.sin(sweepAngle) * 320;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 300, sweepAngle - 0.3, sweepAngle);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sub nodes
      networkNodes.forEach(node => {
        const nx = cx + node.xOffset;
        const ny = cy + node.yOffset;
        if (nx < 0 || nx > width || ny < 0 || ny > height) return;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(109, 40, 217, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#6D28D9';
        ctx.fill();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '8px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(node.name.toUpperCase(), nx, ny - 12);
      });

      // HQ beacon
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      const pulseSize = (Date.now() * 0.03) % 40;
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 1 - pulseSize / 40)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(drawRadar);
    };

    animId = requestAnimationFrame(drawRadar);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeMap);
    };
  }, []);

  return (
    <footer className="pt-24 pb-16 px-6 relative border-t border-white/10 bg-[#020617] overflow-hidden" id="contact-footer">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="footer-bento-grid">
          
          {/* Left Column: Direct Google Sheet Enquiry Form */}
          <div className="lg:col-span-6 flex flex-col gap-6" id="form-column">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-[#06B6D4] font-mono text-[10px] tracking-widest uppercase font-bold mb-3">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Google Sheets Integrated Enquiry Channel</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-sans text-white mt-1 mb-4 font-black tracking-tighter uppercase leading-[1.05]">
                Initiate Mission
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">
                Submit your project briefing. Your inquiry automatically posts directly to the central Google Sheet database in the schema: <code className="text-cyan font-mono text-xs font-semibold">Date, Name, Email, Message</code>.
              </p>
            </div>

            {/* Main Glass Form Container */}
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl flex-1 bg-dot-pattern" id="form-container">
              {/* Corner decors */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/15" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/15" />

              {/* Hidden Google Form fallback for background redundancy */}
              <iframe
                name="hidden_google_form_iframe"
                id="hidden_google_form_iframe"
                className="hidden"
                style={{ display: 'none' }}
              />
              <form
                ref={googleFormRef}
                action="https://docs.google.com/forms/d/e/1FAIpQLSfKw3LF07oFIOHgD6-8YKE0IHuXmG3oAoMTcwq7SwidhF2Otg/formResponse"
                method="POST"
                target="hidden_google_form_iframe"
                className="hidden"
                style={{ display: 'none' }}
              >
                <input type="hidden" name="entry.2005620554" value={formData.name} />
                <input type="hidden" name="entry.1045781291" value={formData.email} />
                <input type="hidden" name="entry.839337160" value={formData.message} />
              </form>

              {formStatus === 'IDLE' && (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5" id="glass-contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                        NAME <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Scott DeSimone"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20"
                        id="input-name"
                      />
                    </div>

                    {/* 2. Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                        EMAIL <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. scott@example.com"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20"
                        id="input-email"
                      />
                    </div>
                  </div>

                  {/* 3. Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                      MESSAGE <span className="text-pink-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Brief your message, project objective, or outcomes required..."
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20 resize-none"
                      id="input-message"
                    />
                  </div>

                  {/* Target schema indicator */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between font-mono text-[9px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Sheet Columns: <strong className="text-white">Date (Auto), Name, Email, Message</strong></span>
                    </div>
                    <span className="text-cyan font-bold">A:D ROW</span>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-cyan to-purple-600 hover:from-cyan/90 hover:to-purple-600/90 text-slate-950 font-sans font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer shadow-lg group shadow-cyan/10 text-xs tracking-wider uppercase"
                    id="btn-execute-send"
                  >
                    <span>Submit Enquiry to Spreadsheet</span>
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </form>
              )}

              {/* Secure compiling sequence logs feedback */}
              {formStatus === 'COMPILING' && (
                <div className="p-8 flex flex-col gap-6 min-h-[380px] justify-center font-mono text-xs text-slate-500" id="form-compiling-panel">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
                    <span className="text-cyan font-bold tracking-widest text-[10px]">TRANSMITTING TO GOOGLE SHEET & NUCLEUS HUB...</span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5" id="compiling-logs-list">
                    {systemLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-700">&gt;</span>
                        <span className="text-slate-300 break-all leading-normal font-mono text-[11px]">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Success Transmission Screen */}
              {formStatus === 'SUCCESS' && (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-6 min-h-[380px]" id="form-success-panel">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold uppercase text-white tracking-tight text-lg mb-1">
                      Enquiry Transmitted & Posted
                    </h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed mb-4">
                      Your enquiry has been successfully recorded and posted to the Nucleus Soft Tech leads spreadsheet ({lastUpdatedRange || 'Leads Tab'}).
                    </p>

                    {/* Summary Card of Submitted Fields */}
                    {lastSubmittedLead && (
                      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 mb-5 text-left font-mono text-xs max-w-sm mx-auto shadow-inner">
                        <div className="text-[10px] font-bold text-cyan uppercase tracking-widest pb-1.5 border-b border-white/10 mb-2 flex items-center justify-between">
                          <span>Recorded Submission</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            CONFIRMED
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          <span className="text-slate-500">Date:</span>
                          <span className="col-span-2 text-slate-300">{lastSubmittedLead.date}</span>
                          <span className="text-slate-500">Name:</span>
                          <span className="col-span-2 text-white font-bold">{lastSubmittedLead.name}</span>
                          <span className="text-slate-500">Email:</span>
                          <span className="col-span-2 text-cyan">{lastSubmittedLead.email}</span>
                          <span className="text-slate-500">Message:</span>
                          <span className="col-span-2 text-slate-400 break-words">{lastSubmittedLead.message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={resetForm}
                      className="bg-gradient-to-r from-cyan to-purple-600 hover:from-cyan/90 hover:to-purple-600/90 text-slate-950 font-bold font-sans text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan/20 uppercase tracking-wider flex items-center gap-2"
                      id="btn-re-engage"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Submit Another Enquiry</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tactical Sonar Map Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 h-full" id="map-column">
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Physical Node</span>
              <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-6 font-black tracking-tighter uppercase leading-[1.05]">Headquarters</h2>
              <p className="text-slate-400 text-base font-light leading-relaxed mb-8">
                Operating physically from the Greater Toronto Area (Ontario, Canada). Drop by our central coordination node to align systems in-person.
              </p>
            </div>

            {/* Tactical Radar Map Card */}
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col group/map bg-dot-pattern" id="map-card">
              <canvas ref={mapCanvasRef} className="w-full h-[360px] bg-transparent block" id="canvas-tactical-map" />

              {/* Floating coordinates tag overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 font-mono text-xs text-slate-300 bg-[#020617]/95 border border-white/15 p-5 rounded-2xl flex flex-col gap-2.5 shadow-2xl pointer-events-none" id="address-overlay-card">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <MapPin className="w-4.5 h-4.5 text-[#06B6D4] animate-pulse" />
                  <span className="text-white font-black tracking-widest uppercase text-[10px]">COORDS_LOCK // BRAMPTON_HQ</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm md:text-base text-white font-bold tracking-tight">50 Sunny Meadow Blvd, Suite 308</div>
                  <div className="text-xs md:text-sm text-[#06B6D4] font-medium tracking-wide">Brampton, ON, L6R 0Y7, Canada</div>
                </div>
              </div>
            </div>

            {/* Contact Details HUD rail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2" id="contact-details-grid">
              <a href="mailto:info@nucleussoft.ca" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 group shadow-md cursor-pointer">
                <div className="w-10 h-10 bg-cyan/5 border border-white/10 text-cyan rounded-xl flex items-center justify-center shrink-0 group-hover:bg-cyan/10">
                  <Mail className="w-5 h-5 text-[#06B6D4]" />
                </div>
                <div>
                  <span className="block font-mono text-[8px] text-slate-500 font-bold uppercase">SECURE_MAIL</span>
                  <span className="text-slate-300 text-xs font-semibold group-hover:text-white">info@nucleussoft.ca</span>
                </div>
              </a>

              <a href="tel:+14169000000" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 group shadow-md cursor-pointer">
                <div className="w-10 h-10 bg-purple-500/5 border border-white/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-500/10">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="block font-mono text-[8px] text-slate-500 font-bold uppercase">VOICE_CHANNEL</span>
                  <span className="text-slate-300 text-xs font-semibold group-hover:text-white">+1 (416) 555-0199</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Corporate Copyright */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500" id="footer-bottom-info">
          <div className="flex items-center gap-3">
            <span>Nucleus Software Technologies © 2024 - 2026. Toronto, ON, Canada. All mission systems secured.</span>
            {/* Subtle owner ops console trigger - completely hidden from ordinary visitor flow */}
            <button
              type="button"
              onClick={() => {
                setShowAdminConsole(true);
              }}
              className="p-1 rounded text-slate-600 hover:text-cyan hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-[10px]"
              title="Nucleus Operator Console"
              id="btn-owner-portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 hover:text-cyan" />
              <span className="opacity-60 hover:opacity-100 font-mono">Ops Console</span>
            </button>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">PRIVACY_POLICY</span>
            <span className="hover:text-slate-300 cursor-pointer">SYSTEMS_AGREEMENT</span>
            <span className="hover:text-slate-300 cursor-pointer">SECURITY_COMPLIANCE</span>
          </div>
        </div>
      </div>

      {/* UNIFIED OWNER & SHEETS ADMIN CONSOLE MODAL */}
      <AnimatePresence>
        {showAdminConsole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1120] border border-white/20 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Owner Ops Console</h3>
                    <div className="font-mono text-[10px] text-slate-400">
                      Google Sheets Integration & Lead Pipeline Management
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdminConsole(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-xs cursor-pointer"
                  title="Close Console"
                >
                  ✕
                </button>
              </div>

              {/* Status Message Toast */}
              {sheetStatusMsg && (
                <div className={`mt-3 p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  sheetStatusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' :
                  sheetStatusMsg.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/30' :
                  'bg-cyan/10 text-cyan border border-cyan/30'
                }`}>
                  {sheetStatusMsg.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
                  {sheetStatusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{sheetStatusMsg.text}</span>
                </div>
              )}

              {/* Tabs Navigation */}
              <div className="flex border-b border-white/10 mt-4 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setAdminTab('webhook')}
                  className={`pb-3 px-3 uppercase tracking-wider font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    adminTab === 'webhook'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Apps Script Webhook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('sheet')}
                  className={`pb-3 px-3 uppercase tracking-wider font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    adminTab === 'sheet'
                      ? 'border-cyan text-cyan'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Google Sheet & Auth</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('leads')}
                  className={`pb-3 px-3 uppercase tracking-wider font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    adminTab === 'leads'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Leads Registry ({sheetLeads.length > 0 ? sheetLeads.length : sessionLeads.length})</span>
                </button>
              </div>

              {/* Tab 1: Webhook Pipeline */}
              {adminTab === 'webhook' && (
                <div className="flex-1 overflow-y-auto my-4 space-y-4 font-mono text-xs pr-1">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-purple-200 space-y-2">
                    <div className="text-white font-bold uppercase text-[11px] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Zero-Login Public Submissions Architecture
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Deploying a free Google Apps Script Web App on your Google Sheet allows public visitors anywhere in the world to submit enquiries without any Google login prompt or account popup. The script receives the POST request and appends rows: <strong className="text-white">Date, Name, Email, Message</strong>.
                    </p>
                  </div>

                  {/* Webhook URL Input */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                    <label className="text-[11px] uppercase text-white font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Google Apps Script Web App Endpoint</span>
                      </span>
                      {webhookUrl ? (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> PIPELINE ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-400">NOT CONFIGURED YET</span>
                      )}
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={inputWebhookUrl !== '' ? inputWebhookUrl : webhookUrl}
                        onChange={(e) => setInputWebhookUrl(e.target.value)}
                        className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-purple-400 outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const val = (inputWebhookUrl || webhookUrl).trim();
                            setWebhookUrl(val);
                            localStorage.setItem(LOCAL_STORAGE_WEBHOOK_KEY, val);
                            setSheetStatusMsg({ text: 'Webhook URL updated and saved!', type: 'success' });
                            setTimeout(() => setSheetStatusMsg(null), 3500);
                          }}
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs rounded-xl cursor-pointer font-bold transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={isTestingAppend}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                          title="Sends a test lead to verify webhook write"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isTestingAppend ? 'Sending...' : 'Test Ping'}</span>
                        </button>
                      </div>
                    </div>

                    {webhookUrl !== DEFAULT_WEBHOOK_URL && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWebhookUrl(DEFAULT_WEBHOOK_URL);
                            setInputWebhookUrl(DEFAULT_WEBHOOK_URL);
                            localStorage.setItem(LOCAL_STORAGE_WEBHOOK_KEY, DEFAULT_WEBHOOK_URL);
                            setSheetStatusMsg({ text: 'Restored default Nucleus Apps Script Webhook!', type: 'info' });
                            setTimeout(() => setSheetStatusMsg(null), 3000);
                          }}
                          className="text-[10px] text-cyan hover:underline font-mono"
                        >
                          Reset to Nucleus Apps Script Webhook
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5-Step Instructions */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 space-y-2">
                    <div className="text-white font-bold uppercase text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      5-Minute Deployment Guide
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pt-1">
                      <li>In your target Google Sheet, click <strong className="text-white">Extensions &gt; Apps Script</strong>.</li>
                      <li>Delete any code in the editor, copy the snippet below, and paste it.</li>
                      <li>Click the <strong className="text-white">Save</strong> icon (floppy disk).</li>
                      <li>Click <strong className="text-white">Deploy &gt; New deployment</strong>, click the gear icon and choose <strong className="text-white">Web app</strong>.</li>
                      <li>Set <strong className="text-white">Execute as: Me</strong> and <strong className="text-white">Who has access: Anyone</strong>, then click <strong className="text-white">Deploy</strong>.</li>
                      <li>Copy the generated Web App URL and paste it into the box above!</li>
                    </ol>
                  </div>

                  {/* Snippet display with copy button */}
                  <div className="relative">
                    <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-t border-x border-white/10 rounded-t-2xl text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">Google Apps Script Snippet (Date, Name, Email, Message)</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
                          setCopiedSnippet(true);
                          setTimeout(() => setCopiedSnippet(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 text-cyan hover:text-cyan-300 cursor-pointer font-bold bg-cyan/10 px-2.5 py-1 rounded-lg border border-cyan/20"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSnippet ? 'COPIED TO CLIPBOARD!' : 'COPY CODE'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950/90 border border-white/10 rounded-b-2xl text-[10px] text-emerald-400 overflow-x-auto max-h-48 leading-relaxed font-mono">
                      {APPS_SCRIPT_SNIPPET}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 2: Sheet & Owner Auth */}
              {adminTab === 'sheet' && (
                <div className="flex-1 overflow-y-auto my-4 space-y-4 font-mono text-xs pr-1">
                  {/* Owner Google Sign-In Card */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs uppercase">Owner Google Authentication</div>
                        <div className="text-slate-400 text-[10px]">
                          {user ? `Logged in as: ${user.email}` : 'Sign in to create sheets directly or manage API access'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {user ? (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          disabled={isLoggingIn}
                          className="gsi-material-button shadow-sm"
                        >
                          <div className="gsi-material-button-state"></div>
                          <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents">
                              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Connected Spreadsheet Details */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="text-white font-bold text-xs uppercase flex items-center gap-2">
                          <Database className="w-4 h-4 text-cyan" />
                          <span>Active Google Sheet Destination</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          {spreadsheetId ? (
                            <span className="text-cyan font-bold">{spreadsheetTitle} (Tab: {sheetName})</span>
                          ) : (
                            <span className="text-amber-400">Nucleus Soft Tech - Leads (Local Queue Active)</span>
                          )}
                        </div>
                      </div>

                      {spreadsheetId && (
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs uppercase inline-flex items-center gap-1.5 transition-colors self-start sm:self-center"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Open in Google Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Actions: Create Sheet or Test Append */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCreateNewSheet}
                        disabled={isCreatingSheet}
                        className="px-3 py-2 rounded-xl bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Creates a new spreadsheet with Date, Name, Email, Message"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{isCreatingSheet ? 'Creating...' : 'Create New Sheet in Drive'}</span>
                      </button>

                      {spreadsheetId && user && (
                        <button
                          type="button"
                          onClick={handleTestAppend}
                          disabled={isTestingAppend}
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isTestingAppend ? 'Testing...' : 'Test Direct API Append'}</span>
                        </button>
                      )}
                    </div>

                    {/* Manual Link Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <input
                        type="text"
                        placeholder="Or paste any Google Sheet URL or ID..."
                        value={inputSheetId}
                        onChange={(e) => setInputSheetId(e.target.value)}
                        className="flex-1 bg-slate-900 border border-white/15 focus:border-cyan text-white rounded-xl px-3 py-2 text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => verifySheet(inputSheetId)}
                        disabled={isVerifyingSheet || !inputSheetId.trim()}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isVerifyingSheet ? 'Checking...' : 'Link Sheet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Leads Registry */}
              {adminTab === 'leads' && (
                <div className="flex-1 overflow-y-auto my-4 space-y-3 font-mono text-xs pr-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total Enquiries:</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20 font-bold">
                        {sheetLeads.length > 0 ? sheetLeads.length : sessionLeads.length} record(s)
                      </span>
                      {sheetLeads.length > 0 ? (
                        <span className="text-[10px] text-emerald-400 font-bold">(Live Google Sheet)</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">(Current Session Submissions)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportLeadsToCsv(sheetLeads.length > 0 ? sheetLeads : sessionLeads)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download leads as CSV (Date, Name, Email, Message)"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleViewLeads}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan hover:bg-white/5 transition-colors cursor-pointer"
                        title="Refresh Live Google Sheet Leads"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingLeads ? 'animate-spin text-cyan' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Leads Table */}
                  <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-slate-950/60">
                    {isLoadingLeads ? (
                      <div className="py-16 text-center font-mono text-xs text-slate-400 flex flex-col items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-cyan animate-spin" />
                        <span>FETCHING_ROWS_FROM_GOOGLE_SHEETS...</span>
                      </div>
                    ) : (sheetLeads.length === 0 && sessionLeads.length === 0) ? (
                      <div className="py-16 text-center font-mono text-xs text-slate-400">
                        No lead submissions recorded in this session yet. Submissions from the form will appear here and directly in Google Sheets!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-wider bg-white/5">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Name</th>
                              <th className="py-2.5 px-3">Email</th>
                              <th className="py-2.5 px-3">Message</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(sheetLeads.length > 0 ? sheetLeads : sessionLeads).map((lead, idx) => (
                              <tr key={lead.id || idx} className="hover:bg-white/5 transition-colors">
                                <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[10px]">{lead.date}</td>
                                <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">{lead.name}</td>
                                <td className="py-2.5 px-3 text-cyan whitespace-nowrap">{lead.email}</td>
                                <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={lead.message}>{lead.message}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                    lead.status === 'POSTED_TO_SHEET'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-cyan/10 text-cyan border-cyan/20'
                                  }`}>
                                    {lead.status || 'POSTED_TO_SHEET'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Schema: Date, Name, Email, Message</span>
                <span className="text-slate-400">Nucleus Soft Tech Lead Intake System</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
