import React, { useState, useRef, useEffect, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { Plane, Settings, Search, X, ChevronDown, AlertCircle, CheckCircle, Loader2, Clock, MapPin } from 'lucide-react';
import { C, SK, CATEGORY_COLORS } from './data/constants';
import { AIRPORTS } from './data/airports';
import { AIRCRAFT } from './data/aircraft';

// ─── helpers ────────────────────────────────────────────────────────────────

function ts(d) { return Math.floor(d.getTime() / 1000); }

function fmtTime(unix) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ─── styles ─────────────────────────────────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      body { background: ${C.grayBg}; color: ${C.dark}; font-family: 'Inter', sans-serif; }

      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${C.grayBg}; }
      ::-webkit-scrollbar-thumb { background: ${C.grayLine}; border-radius: 3px; }

      .inp {
        width: 100%;
        background: ${C.white};
        border: 1.5px solid ${C.grayLine};
        border-radius: 8px;
        padding: 10px 14px;
        color: ${C.dark};
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .inp:focus {
        border-color: ${C.blue} !important;
        box-shadow: 0 0 0 3px ${C.blueLight};
      }
      .inp::placeholder { color: ${C.grayMid}; }
      .inp:disabled { background: ${C.grayBg}; color: ${C.grayText}; }

      .pill-btn {
        padding: 7px 18px;
        border-radius: 20px;
        border: 1.5px solid ${C.grayLine};
        background: ${C.white};
        color: ${C.grayText};
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all .15s;
      }
      .pill-btn:hover { border-color: ${C.blue}; color: ${C.blue}; }
      .pill-btn.active {
        background: ${C.navy};
        border-color: ${C.navy};
        color: ${C.white};
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .slide-up { animation: slideUp .25s ease; }
      .fade-in  { animation: fadeIn .2s ease; }

      .dropdown-item {
        padding: 10px 14px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid ${C.grayLine};
        transition: background .1s;
      }
      .dropdown-item:last-child { border-bottom: none; }
      .dropdown-item:hover { background: ${C.blueLight}; }

      .result-card {
        background: ${C.white};
        border: 1px solid ${C.grayLine};
        border-radius: 14px;
        box-shadow: 0 2px 12px rgba(0,47,167,0.06);
        overflow: hidden;
        transition: box-shadow .15s;
      }
      .result-card:hover { box-shadow: 0 6px 24px rgba(0,47,167,0.12); }
    `}</style>
  );
}

// ─── sub-components ─────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className="slide-up" style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
      background: C.white,
      borderLeft: `5px solid ${isErr ? C.red : C.success}`,
      borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,26,87,0.18)',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 360, fontSize: 14,
    }}>
      {isErr
        ? <AlertCircle size={18} color={C.red} />
        : <CheckCircle size={18} color={C.success} />}
      <span style={{ color: C.dark, flex: 1 }}>{toast.msg}</span>
      <X size={16} color={C.grayMid} style={{ cursor: 'pointer' }} onClick={onClose} />
    </div>
  );
}

function ResultCard({ match }) {
  const color = CATEGORY_COLORS[match.aircraft.category] || C.blue;
  const isArr = match.firstSeen != null;
  return (
    <div className="result-card slide-up" style={{ display: 'flex' }}>
      {/* category band */}
      <div style={{ width: 6, background: color, flexShrink: 0 }} />
      {/* avatar */}
      <div style={{
        width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '18', flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: color, color: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, fontFamily: 'Poppins, sans-serif',
        }}>
          {initials(match.aircraft.owner)}
        </div>
      </div>
      {/* main info */}
      <div style={{ flex: 1, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif', color: C.dark }}>
            {match.aircraft.owner}
          </span>
          <span style={{
            background: color + '18', color: color,
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {match.aircraft.category}
          </span>
        </div>
        <div style={{ color: C.grayText, fontSize: 13, marginTop: 2 }}>{match.aircraft.title}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.grayMid, fontSize: 12 }}>
            <Plane size={12} />
            {match.aircraft.aircraft}
          </span>
          <span style={{
            background: C.blueLight, color: C.navy,
            padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            {match.aircraft.registration}
          </span>
          {match.callsign && match.callsign !== match.aircraft.registration && (
            <span style={{ color: C.grayMid, fontSize: 12 }}>
              callsign: <b>{match.callsign}</b>
            </span>
          )}
        </div>
      </div>
      {/* time / route */}
      <div style={{
        padding: '14px 16px', flexShrink: 0, minWidth: 160,
        borderLeft: `1px solid ${C.grayLine}`,
        display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center',
      }}>
        {match.estDepartureAirport && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.grayText }}>
            <MapPin size={12} color={C.grayMid} />
            <span>From: <b>{match.estDepartureAirport}</b></span>
          </div>
        )}
        {match.estArrivalAirport && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.grayText }}>
            <MapPin size={12} color={C.blue} />
            <span>To: <b>{match.estArrivalAirport}</b></span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.grayMid }}>
          <Clock size={12} />
          <span>{fmtTime(match.firstSeen || match.lastSeen)}</span>
        </div>
        <div style={{
          marginTop: 4,
          padding: '3px 8px',
          background: isArr ? C.successBg : C.blueLight,
          color: isArr ? C.success : C.navy,
          borderRadius: 20, fontSize: 11, fontWeight: 600,
          textAlign: 'center',
        }}>
          {isArr ? 'Detected' : 'No time'}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ onClose }) {
  const [osUser, setOsUser] = useState(() => localStorage.getItem(SK.openskyUser) || '');
  const [osPass, setOsPass] = useState(() => localStorage.getItem(SK.openskyPass) || '');
  const [ck, setCk]         = useState(() => localStorage.getItem(SK.claudeKey) || '');

  function save() {
    localStorage.setItem(SK.openskyUser, osUser.trim());
    localStorage.setItem(SK.openskyPass, osPass.trim());
    localStorage.setItem(SK.claudeKey,   ck.trim());
    onClose(true);
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: C.grayMid, marginBottom: 6,
  };
  const sectionStyle = {
    background: C.white, border: `1px solid ${C.grayLine}`,
    borderRadius: 12, padding: '20px 20px 16px',
  };

  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,26,87,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div className="slide-up" style={{
        background: C.white, borderRadius: 16, padding: '32px 36px',
        boxShadow: '0 24px 64px rgba(0,26,87,0.25)',
        width: '100%', maxWidth: 480,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 20, color: C.dark }}>
            Settings
          </h2>
          <X size={20} color={C.grayMid} style={{ cursor: 'pointer' }} onClick={() => onClose(false)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 12 }}>
              OpenSky Network
            </div>
            <div style={{ fontSize: 12, color: C.grayMid, marginBottom: 14, lineHeight: 1.5 }}>
              Free account at <a href="https://opensky-network.org" target="_blank" rel="noreferrer"
                style={{ color: C.blue }}>opensky-network.org</a> extends history to 7 days.
              Anonymous access limited to last 1 hour.
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Username</label>
              <input className="inp" value={osUser} onChange={e => setOsUser(e.target.value)}
                placeholder="Optional" autoComplete="off" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input className="inp" type="password" value={osPass} onChange={e => setOsPass(e.target.value)}
                placeholder="Optional" autoComplete="off" />
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 12 }}>
              Claude API Key
            </div>
            <div style={{ fontSize: 12, color: C.grayMid, marginBottom: 14, lineHeight: 1.5 }}>
              Used as fallback web search when OpenSky returns no matches. Get a key at{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: C.blue }}>console.anthropic.com</a>.
            </div>
            <label style={labelStyle}>API Key</label>
            <input className="inp" type="password" value={ck} onChange={e => setCk(e.target.value)}
              placeholder="sk-ant-..." autoComplete="off" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
          <button onClick={() => onClose(false)} style={{
            background: C.white, border: `1.5px solid ${C.navy}`, color: C.navy,
            borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={save} style={{
            background: C.navy, border: 'none', color: C.white,
            borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main app ───────────────────────────────────────────────────────────────

export default function App() {
  const [airport, setAirport]       = useState(null);
  const [query, setQuery]           = useState('');
  const [dropOpen, setDropOpen]     = useState(false);
  const [hours, setHours]           = useState(24);
  const [results, setResults]       = useState(null);
  const [status, setStatus]         = useState('idle'); // idle|scanning|done|error
  const [statusMsg, setStatusMsg]   = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast]           = useState(null);
  const dropRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredAirports = AIRPORTS.filter(a => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      a.iata.toLowerCase().includes(q) ||
      a.icao4.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  }).slice(0, 12);

  function selectAirport(a) {
    setAirport(a);
    setQuery(`${a.iata} — ${a.name}`);
    setDropOpen(false);
  }

  // ── scan ────────────────────────────────────────────────────────────────

  const scanFlights = useCallback(async () => {
    if (!airport) {
      setToast({ msg: 'Please select an airport first.', type: 'error' });
      return;
    }
    setStatus('scanning');
    setResults(null);

    const end   = new Date();
    const begin = new Date(end.getTime() - hours * 3600 * 1000);

    const osUser = localStorage.getItem(SK.openskyUser) || '';
    const osPass = localStorage.getItem(SK.openskyPass) || '';
    const ckKey  = localStorage.getItem(SK.claudeKey)   || '';

    // cap anonymous to 1h
    const effectiveBegin = !osUser
      ? new Date(end.getTime() - Math.min(hours, 1) * 3600 * 1000)
      : begin;

    if (!osUser && hours > 1) {
      setStatusMsg(`No OpenSky credentials — limiting to last 1 hour. Add credentials in Settings for ${hours}h.`);
    } else {
      setStatusMsg(`Scanning ${airport.icao4} for the last ${hours} hour${hours === 1 ? '' : 's'}…`);
    }

    let flights = [];
    let openskyOk = false;

    try {
      const url = `https://opensky-network.org/api/flights/airport?airport=${airport.icao4}&begin=${ts(effectiveBegin)}&end=${ts(end)}`;
      const headers = {};
      if (osUser && osPass) {
        headers['Authorization'] = 'Basic ' + btoa(`${osUser}:${osPass}`);
      }
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`OpenSky ${resp.status}`);
      flights = await resp.json();
      openskyOk = true;
      setStatusMsg(`OpenSky returned ${flights.length} flight record${flights.length !== 1 ? 's' : ''}. Cross-referencing…`);
    } catch (err) {
      setStatusMsg(`OpenSky unavailable (${err.message}). ${ckKey ? 'Trying Claude web search…' : 'Add a Claude API key in Settings as fallback.'}`);
    }

    // ── match ──────────────────────────────────────────────────────────────
    const matches = [];
    if (openskyOk && flights.length) {
      for (const flight of flights) {
        const icao = (flight.icao24 || '').toLowerCase().trim();
        const cs   = (flight.callsign || '').trim().replace(/\s/g, '');

        const ac = AIRCRAFT.find(a =>
          (icao && a.icao24.toLowerCase() === icao) ||
          (cs && a.registration.replace(/-/g, '') === cs.replace(/-/g, ''))
        );
        if (ac) {
          matches.push({ ...flight, aircraft: ac });
        }
      }
    }

    if (matches.length) {
      setResults({ matches, webResults: null, totalFlights: flights.length });
      setStatus('done');
      setStatusMsg(`Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} among ${flights.length} flights.`);
      return;
    }

    // ── Claude fallback ────────────────────────────────────────────────────
    if (ckKey) {
      setStatusMsg('No ADS-B matches. Searching news via Claude…');
      try {
        const client = new Anthropic({ apiKey: ckKey, dangerouslyAllowBrowser: true });
        const resp = await client.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Search for news about prominent individuals, celebrities, politicians, or VIPs who flew into or out of ${airport.name} (${airport.iata}) in the last ${hours} hours. Focus on private jets and notable arrivals or departures. Summarize what you find concisely.`,
          }],
        });

        // extract text blocks
        let webText = '';
        for (const block of resp.content) {
          if (block.type === 'text') webText += block.text + '\n';
        }
        setResults({ matches: [], webResults: webText.trim() || 'No notable results found in recent news.', totalFlights: flights.length });
        setStatus('done');
        setStatusMsg('Claude web search complete.');
      } catch (err) {
        setStatus('error');
        setStatusMsg(`Claude error: ${err.message}`);
        setToast({ msg: `Claude API error: ${err.message}`, type: 'error' });
      }
    } else {
      // no matches, no Claude key
      setResults({ matches: [], webResults: null, totalFlights: flights.length });
      setStatus('done');
      setStatusMsg(
        openskyOk
          ? `Scanned ${flights.length} flights — no known VIP aircraft detected.`
          : 'OpenSky unavailable and no Claude API key configured.'
      );
    }
  }, [airport, hours]);

  // ── render ───────────────────────────────────────────────────────────────

  const cardStyle = {
    background: C.white,
    border: `1px solid ${C.grayLine}`,
    borderRadius: 14,
    boxShadow: '0 2px 12px rgba(0,47,167,0.06)',
  };

  return (
    <>
      <GlobalStyles />

      {/* header */}
      <div style={{
        background: C.navyDark, padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plane size={20} color={C.white} />
          </div>
          <span style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: 20, color: C.white, letterSpacing: '-0.02em',
          }}>
            JetWatch
          </span>
          <span style={{
            background: C.blue + '30', color: C.blue,
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            VIP Flight Tracker
          </span>
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          background: 'transparent', border: `1.5px solid ${C.navyMid}`,
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, color: C.grayMid,
          transition: 'all .15s',
        }}>
          <Settings size={16} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Settings</span>
        </button>
      </div>

      {/* main content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* controls card */}
        <div style={{ ...cardStyle, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 700,
            fontSize: 16, color: C.dark, marginBottom: 20,
          }}>
            Scan for VIP Flights
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* airport picker */}
            <div style={{ flex: 2, minWidth: 240, position: 'relative' }} ref={dropRef}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: C.grayMid, marginBottom: 6,
              }}>Airport</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color={C.grayMid} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <input
                  className="inp"
                  style={{ paddingLeft: 36 }}
                  value={query}
                  placeholder="Search airport (name, IATA, ICAO)…"
                  onChange={e => { setQuery(e.target.value); setDropOpen(true); setAirport(null); }}
                  onFocus={() => setDropOpen(true)}
                />
                <ChevronDown size={15} color={C.grayMid} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
              </div>
              {dropOpen && filteredAirports.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: C.white, border: `1px solid ${C.grayLine}`,
                  borderRadius: 10, boxShadow: '0 8px 32px rgba(0,26,87,0.12)',
                  maxHeight: 280, overflowY: 'auto', zIndex: 200,
                }}>
                  {filteredAirports.map(a => (
                    <div key={a.icao4} className="dropdown-item" onClick={() => selectAirport(a)}>
                      <span style={{ fontWeight: 600, color: C.dark }}>{a.iata}</span>
                      <span style={{ color: C.grayMid, marginLeft: 6 }}>({a.icao4})</span>
                      <span style={{ color: C.grayText, marginLeft: 8, fontSize: 13 }}>
                        {a.name} · {a.city}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* hours picker */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: C.grayMid, marginBottom: 6,
              }}>Time Window</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 24, 48, 72].map(h => (
                  <button key={h}
                    className={`pill-btn${hours === h ? ' active' : ''}`}
                    onClick={() => setHours(h)}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* scan button */}
            <button
              onClick={scanFlights}
              disabled={status === 'scanning'}
              style={{
                background: status === 'scanning' ? C.grayLine : C.navy,
                border: 'none', color: C.white,
                borderRadius: 8, padding: '10px 28px',
                fontWeight: 700, fontSize: 15,
                cursor: status === 'scanning' ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background .15s',
                whiteSpace: 'nowrap',
              }}>
              {status === 'scanning'
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Scanning…</>
                : <><Search size={16} /> Scan</>}
            </button>
          </div>
        </div>

        {/* status bar */}
        {statusMsg && (
          <div style={{
            ...cardStyle,
            padding: '12px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10,
            borderLeft: `4px solid ${status === 'error' ? C.red : status === 'done' ? C.success : C.blue}`,
          }}>
            {status === 'scanning' && <Loader2 size={15} color={C.blue} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
            {status === 'done'     && <CheckCircle size={15} color={C.success} style={{ flexShrink: 0 }} />}
            {status === 'error'    && <AlertCircle size={15} color={C.red} style={{ flexShrink: 0 }} />}
            <span style={{ fontSize: 13, color: C.grayText }}>{statusMsg}</span>
          </div>
        )}

        {/* results */}
        {results && (
          <div>
            {results.matches.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                  fontSize: 15, color: C.dark, marginBottom: 14,
                }}>
                  {results.matches.length} VIP Match{results.matches.length !== 1 ? 'es' : ''} Found
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.matches.map((m, i) => (
                    <ResultCard key={i} match={m} />
                  ))}
                </div>
              </>
            )}

            {results.webResults && (
              <div style={{ ...cardStyle, padding: '24px 28px' }} className="slide-up">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Search size={16} color={C.blue} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>Claude Web Search Results</div>
                    <div style={{ fontSize: 11, color: C.grayMid }}>No ADS-B matches — searched recent news</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 14, color: C.grayText, lineHeight: 1.7,
                  borderTop: `1px solid ${C.grayLine}`, paddingTop: 16,
                  whiteSpace: 'pre-wrap',
                }}>
                  {results.webResults}
                </div>
              </div>
            )}

            {results.matches.length === 0 && !results.webResults && (
              <div style={{ ...cardStyle, padding: '48px 28px', textAlign: 'center' }} className="slide-up">
                <Plane size={40} color={C.grayLine} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: 16, color: C.dark, marginBottom: 6 }}>
                  No VIP aircraft detected
                </div>
                <div style={{ fontSize: 14, color: C.grayMid, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                  {results.totalFlights > 0
                    ? `${results.totalFlights} flights were scanned but none matched our VIP aircraft database.`
                    : 'No flight data was returned for this airport and time window.'}
                  {' '}Add a Claude API key in Settings to enable web search fallback.
                </div>
              </div>
            )}
          </div>
        )}

        {/* idle state */}
        {status === 'idle' && !results && (
          <div style={{ ...cardStyle, padding: '56px 28px', textAlign: 'center' }} className="fade-in">
            <Plane size={48} color={C.grayLine} style={{ marginBottom: 16 }} />
            <div style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 700,
              fontSize: 18, color: C.dark, marginBottom: 8,
            }}>
              Ready to scan
            </div>
            <div style={{ fontSize: 14, color: C.grayMid, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Select an airport and time window, then click <strong>Scan</strong> to check for VIP aircraft
              using ADS-B data from OpenSky Network. Add your API credentials in{' '}
              <button onClick={() => setShowSettings(true)} style={{
                background: 'none', border: 'none', color: C.blue,
                cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: 0,
              }}>Settings</button>.
            </div>
          </div>
        )}
      </div>

      {/* settings panel */}
      {showSettings && (
        <SettingsPanel onClose={saved => {
          setShowSettings(false);
          if (saved) setToast({ msg: 'Settings saved.', type: 'success' });
        }} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
