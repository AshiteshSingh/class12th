'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ZonalJudgeTable from '../../components/ZonalJudgeTable';
import ParticipantModal from '../../components/ParticipantModal';
import { exportCombinedReport, exportCombinedSheet } from '../../utils/exportExcel';
import { ALL_ZONAL_PARTICIPANTS, getCriteriaForEvent } from '../../utils/participants';

const NUM_PARTICIPANTS = 13;
const SCORE_MAX = 10;

// ─── Competition Data ──────────────────────────────────────────────────────────
const COMPETITIONS = [
    {
        group: 'Literary Competitions',
        color: '#3b82f6',
        events: [
            { name: 'Declamation', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Debate', categories: ['Junior', 'Senior'] },
            { name: 'Prepared Speech', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Story Telling', categories: ['Sub-Junior'] },
            { name: 'Quiz', categories: ['Sub-Junior', 'Junior', 'Senior'] },
        ],
    },
    {
        group: 'Cultural Competitions',
        color: '#10b981',
        events: [
            { name: 'Solo Song', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Group Song', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Solo Dance', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Group Dance (Girls)', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Group Dance (Boys)', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Fancy Dress', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Stand-up Comedy', categories: ['Junior', 'Senior'] },
            { name: 'Rangoli', categories: ['Open Category'] },
            { name: 'Flower Arrangement (Fresh Flowers)', categories: ['Open Category'] },
            { name: 'Static Tableau', categories: ['Open Category'] },
        ],
    },
    {
        group: 'Fine Arts and Designs',
        color: '#f59e0b',
        events: [
            { name: 'Painting', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Pencil Sketch', categories: ['Sub-Junior', 'Junior', 'Senior'] },
            { name: 'Digital Sketch', categories: ['Only Senior'] },
            { name: 'Digital Photography', categories: ['Only Senior'] },
        ],
    },
];

const initialJudgeState = Array.from({ length: NUM_PARTICIPANTS }, (_, i) => ({
    sino: i + 1,
    participantName: '',
    chestNo: '',
    s1: 0, s1Str: '',
    s2: 0, s2Str: '',
    s3: 0, s3Str: '',
    s4: 0, s4Str: '',
    s5: 0, s5Str: '',
    total: 0,
    average: 0,
    rank: null,
    points: 0
}));

// Helper to extract integer value from chest number strings ("C1" -> 1, "Chest 5" -> 5)
const parseChestNumber = (chestStr) => {
    if (!chestStr) return Infinity;
    const match = String(chestStr).match(/\d+/);
    return match ? parseInt(match[0], 10) : Infinity;
};

// ─── Event Dropdown ────────────────────────────────────────────────────────────
function EventDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${open ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    color: value ? 'var(--text-main)' : 'var(--text-muted)',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-family)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: open ? '0 0 10px rgba(59,130,246,0.2)' : 'none',
                    userSelect: 'none',
                }}
            >
                <span>{value || 'Select Event…'}</span>
                <span style={{
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'none',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                }}>▼</span>
            </div>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: '#1e293b', border: '1px solid var(--border-color)',
                    borderRadius: '10px', zIndex: 1000, maxHeight: '340px', overflowY: 'auto',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                }}>
                    {COMPETITIONS.map(group => (
                        <div key={group.group}>
                            <div style={{
                                padding: '0.5rem 1rem 0.35rem',
                                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.09em',
                                textTransform: 'uppercase', color: group.color,
                                borderBottom: `1px solid ${group.color}30`,
                                background: `${group.color}10`,
                                position: 'sticky', top: 0,
                            }}>
                                {group.group}
                            </div>
                            {group.events.map(event => (
                                <div
                                    key={event.name}
                                    onClick={() => { onChange(event.name, event.categories); setOpen(false); }}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        cursor: 'pointer',
                                        color: value === event.name ? '#60a5fa' : 'var(--text-main)',
                                        background: value === event.name ? 'rgba(59,130,246,0.12)' : 'transparent',
                                        fontWeight: value === event.name ? 600 : 400,
                                        fontSize: '0.95rem',
                                        transition: 'background 0.15s',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        borderLeft: value === event.name ? `3px solid #3b82f6` : '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { if (value !== event.name) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { if (value !== event.name) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span>{event.name}</span>
                                    {value === event.name && <span style={{ color: '#60a5fa', fontSize: '0.8rem' }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Category Multi-Select Chips ───────────────────────────────────────────────
function CategorySelector({ availableCategories, selectedCategories, onToggle }) {
    if (!availableCategories || availableCategories.length === 0) {
        return (
            <div style={{
                padding: '0.8rem 1rem',
                background: 'rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                minHeight: '42px',
                display: 'flex',
                alignItems: 'center',
            }}>
                Select an event first…
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
            minHeight: '42px', alignItems: 'center',
            padding: '0.4rem 0',
        }}>
            {availableCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onToggle(cat)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(124,58,237,0.22)' : 'rgba(0,0,0,0.2)',
                            color: isSelected ? '#c4b5fd' : 'var(--text-muted)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 0 8px rgba(124,58,237,0.35)' : 'none',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}
                    >
                        {isSelected && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main Zonal Page ───────────────────────────────────────────────────────────
export default function ZonalPage() {
    const [activeTab, setActiveTab] = useState('judge1');
    const [combinedDownloading, setCombinedDownloading] = useState(false);

    // Modal state for selecting participant names
    const [modalOpen, setModalOpen] = useState(false);
    const [activeRowIndex, setActiveRowIndex] = useState(null);

    // Manual Combined state
    const NUM_MANUAL = 13;
    const initManualRow = (i) => ({ sino: String(i + 1), participantName: '', chestNo: '', j1: '', j2: '', j3: '', total: 0, rank: null });
    const [manualRows, setManualRows] = useState(() => Array.from({ length: NUM_MANUAL }, (_, i) => initManualRow(i)));
    const [manualRanksCalculated, setManualRanksCalculated] = useState(false);
    const [autoFilled, setAutoFilled] = useState(false);

    const [judges, setJudges] = useState({
        1: JSON.parse(JSON.stringify(initialJudgeState)),
        2: JSON.parse(JSON.stringify(initialJudgeState)),
        3: JSON.parse(JSON.stringify(initialJudgeState)),
    });

    const [combinedResults, setCombinedResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [eventName, setEventName] = useState('Story Telling');
    const [availableCategories, setAvailableCategories] = useState(['Sub-Junior']);
    const [selectedCategories, setSelectedCategories] = useState(['Sub-Junior']);
    const [eventType, setEventType] = useState('individual');

    const categoryName = selectedCategories.join(', ');

    // Collect all assigned participant names across judges for badge feedback
    const assignedNames = judges[1].map(p => p.participantName).filter(Boolean);

    const fillRosterForCategory = (catName) => {
        let catKey = 'Sub-Junior';
        if (catName.includes('Junior') && !catName.includes('Sub')) catKey = 'Junior';
        if (catName.includes('Senior')) catKey = 'Senior';
        if (catName.includes('Sub')) catKey = 'Sub-Junior';

        const categoryParticipants = ALL_ZONAL_PARTICIPANTS.filter(p => p.categoryShort === catKey);

        setJudges(prev => {
            const next = { ...prev };
            for (let j = 1; j <= 3; j++) {
                for (let i = 0; i < NUM_PARTICIPANTS; i++) {
                    const p = next[j][i];
                    if (categoryParticipants[i]) {
                        p.participantName = categoryParticipants[i].name;
                        p.chestNo = `C${i + 1}`;
                    } else {
                        p.participantName = '';
                        p.chestNo = '';
                        p.s1 = 0; p.s1Str = '';
                        p.s2 = 0; p.s2Str = '';
                        p.s3 = 0; p.s3Str = '';
                        p.s4 = 0; p.s4Str = '';
                        p.s5 = 0; p.s5Str = '';
                        p.total = 0;
                        p.average = 0;
                    }
                }
            }
            return next;
        });
    };

    useEffect(() => {
        fillRosterForCategory('Sub-Junior');
    }, []);

    const handleEventSelect = (name, cats) => {
        setEventName(name);
        setAvailableCategories(cats);
        const initialCats = cats.length === 1 ? [...cats] : [];
        setSelectedCategories(initialCats);

        if (initialCats.length > 0) {
            fillRosterForCategory(initialCats[0]);
        }
    };

    const handleCategoryToggle = (cat) => {
        setSelectedCategories(prev => {
            const next = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
            if (next.length > 0) {
                fillRosterForCategory(next[0]);
            }
            return next;
        });
    };

    const handleOpenModal = (index) => {
        setActiveRowIndex(index);
        setModalOpen(true);
    };

    const handleSelectParticipant = (name) => {
        if (activeRowIndex !== null) {
            setJudges(prev => {
                const next = { ...prev };
                next[1][activeRowIndex].participantName = name;
                next[2][activeRowIndex].participantName = name;
                next[3][activeRowIndex].participantName = name;
                return next;
            });
        }
    };

    // ── Ascending Sort by Chest Number ──────────────────────────────────────────
    const sortByChestNumber = () => {
        setJudges(prev => {
            const indices = Array.from({ length: NUM_PARTICIPANTS }, (_, i) => i);
            indices.sort((a, b) => {
                const chestA = parseChestNumber(prev[1][a].chestNo);
                const chestB = parseChestNumber(prev[1][b].chestNo);
                if (chestA !== chestB) return chestA - chestB;
                return a - b;
            });

            const next = { 1: [], 2: [], 3: [] };
            for (let j = 1; j <= 3; j++) {
                indices.forEach((origIdx, newIdx) => {
                    const row = { ...prev[j][origIdx], sino: newIdx + 1 };
                    next[j].push(row);
                });
            }
            return next;
        });

        setManualRows(prev => {
            const sorted = [...prev].sort((a, b) => {
                const chestA = parseChestNumber(a.chestNo);
                const chestB = parseChestNumber(b.chestNo);
                return chestA - chestB;
            }).map((row, idx) => ({ ...row, sino: String(idx + 1) }));
            return applyRanks(sorted);
        });

        if (showResults) {
            calculateResults();
        }
    };

    // ── Auto-Assign Chest Nos C1..C13 ──────────────────────────────────────────
    const autoAssignChestNos = () => {
        setJudges(prev => {
            const next = { ...prev };
            for (let j = 1; j <= 3; j++) {
                for (let i = 0; i < NUM_PARTICIPANTS; i++) {
                    next[j][i].chestNo = `C${i + 1}`;
                }
            }
            return next;
        });
    };

    const clearAllData = () => {
        setEventName('');
        setAvailableCategories([]);
        setSelectedCategories([]);
        setEventType('individual');
        setJudges({
            1: JSON.parse(JSON.stringify(initialJudgeState)),
            2: JSON.parse(JSON.stringify(initialJudgeState)),
            3: JSON.parse(JSON.stringify(initialJudgeState)),
        });
        setCombinedResults([]);
        setShowResults(false);
        setManualRows(Array.from({ length: NUM_MANUAL }, (_, i) => initManualRow(i)));
        setManualRanksCalculated(false);
        setAutoFilled(false);
    };

    const handleEventTypeChange = (newType) => {
        setEventType(newType);
        if (showResults) {
            calculateResults(newType);
        }
    };

    const fillDemoData = () => {
        setEventName('Story Telling');
        setAvailableCategories(['Sub-Junior']);
        setSelectedCategories(['Sub-Junior']);

        setJudges(prev => {
            const next = { ...prev };
            // Pick first 13 participants from ALL_ZONAL_PARTICIPANTS to ensure full table
            const demoParticipants = ALL_ZONAL_PARTICIPANTS.slice(0, NUM_PARTICIPANTS);

            for (let j = 1; j <= 3; j++) {
                for (let i = 0; i < NUM_PARTICIPANTS; i++) {
                    const p = next[j][i];
                    if (demoParticipants[i]) {
                        p.participantName = demoParticipants[i].name;
                        p.chestNo = `C${i + 1}`;
                        p.s1 = Math.floor(Math.random() * 4) + 7;
                        p.s1Str = String(p.s1);
                        p.s2 = Math.floor(Math.random() * 4) + 7;
                        p.s2Str = String(p.s2);
                        p.s3 = Math.floor(Math.random() * 4) + 7;
                        p.s3Str = String(p.s3);
                        p.s4 = Math.floor(Math.random() * 4) + 7;
                        p.s4Str = String(p.s4);
                        p.s5 = Math.floor(Math.random() * 4) + 7;
                        p.s5Str = String(p.s5);
                        p.total = p.s1 + p.s2 + p.s3 + p.s4 + p.s5;
                        p.average = (p.total / 5).toFixed(2);
                    } else {
                        p.participantName = '';
                        p.chestNo = '';
                        p.s1 = 0; p.s1Str = '';
                        p.s2 = 0; p.s2Str = '';
                        p.s3 = 0; p.s3Str = '';
                        p.s4 = 0; p.s4Str = '';
                        p.s5 = 0; p.s5Str = '';
                        p.total = 0;
                        p.average = 0;
                    }
                }
            }
            return next;
        });

        setShowResults(false);
    };

    const handleChestChange = (participantIndex, value) => {
        setJudges(prev => {
            const next = { ...prev };
            next[1][participantIndex].chestNo = value;
            next[2][participantIndex].chestNo = value;
            next[3][participantIndex].chestNo = value;
            return next;
        });
    };

    const handleScoreChange = (judgeId, participantIndex, field, value, maxAllowed) => {
        const criteriaList = getCriteriaForEvent(eventName);
        const criterion = criteriaList.find(c => c.key === field);
        const limit = maxAllowed !== undefined ? maxAllowed : (criterion ? criterion.max : 10);

        let numericValue = parseFloat(value);
        if (isNaN(numericValue)) numericValue = 0;
        if (numericValue > limit) numericValue = limit;
        if (numericValue < 0) numericValue = 0;

        setJudges(prev => {
            const next = { ...prev };
            next[judgeId][participantIndex][field] = numericValue;
            next[judgeId][participantIndex][`${field}Str`] = value;
            const p = next[judgeId][participantIndex];
            p.total = criteriaList.reduce((sum, c) => sum + (p[c.key] || 0), 0);
            p.average = (p.total / 5).toFixed(2);
            return next;
        });
    };

    const calculateResults = (type) => {
        const activeType = (type && typeof type === 'string') ? type : eventType;
        const judgesData = JSON.parse(JSON.stringify(judges));
        const combined = [];

        const firstPoints = activeType === 'group' ? 20 : 10;
        const secondPoints = activeType === 'group' ? 15 : 7;
        const thirdPoints = activeType === 'group' ? 10 : 5;

        for (let j = 1; j <= 3; j++) {
            const sortedLocal = [...new Set(judgesData[j].map(p => p.total))].sort((a, b) => b - a);
            judgesData[j].forEach(p => {
                const rankIndex = sortedLocal.indexOf(p.total);
                p.rank = rankIndex + 1;
                if (p.rank === 1) p.points = firstPoints;
                else if (p.rank === 2) p.points = secondPoints;
                else if (p.rank === 3) p.points = thirdPoints;
                else p.points = 0;
            });
        }

        for (let i = 0; i < NUM_PARTICIPANTS; i++) {
            const participantName = judgesData[1][i].participantName;
            if (!participantName && judgesData[1][i].total === 0) continue;

            const nameToUse = participantName || `Student ${i + 1}`;
            const chestNo = judgesData[1][i].chestNo || `C${i + 1}`;
            const t1 = judgesData[1][i].total;
            const t2 = judgesData[2][i].total;
            const t3 = judgesData[3][i].total;
            const grandTotal = t1 + t2 + t3;
            const average = grandTotal / 3;
            combined.push({
                sino: i + 1, participantName: nameToUse, chestNo, t1, t2, t3, grandTotal,
                average: average.toFixed(2), rank: null, points: 0
            });
        }

        const sortedGrand = [...new Set(combined.map(p => parseFloat(p.average)))].sort((a, b) => b - a);
        combined.forEach(p => {
            const rankIndex = sortedGrand.indexOf(parseFloat(p.average));
            p.rank = rankIndex + 1;
            if (p.rank === 1) p.points = firstPoints;
            else if (p.rank === 2) p.points = secondPoints;
            else if (p.rank === 3) p.points = thirdPoints;
            else p.points = 0;
        });

        setJudges(judgesData);
        setCombinedResults(combined);
        setShowResults(true);
    };

    const handleExport = async () => {
        if (!showResults) return;
        await exportCombinedReport(judges, combinedResults, eventName, categoryName, true);
    };

    const handleCombinedDownload = async () => {
        if (!manualRanksCalculated) return;
        setCombinedDownloading(true);
        try {
            await exportCombinedSheet(manualRows, eventName, categoryName, true);
        } finally {
            setCombinedDownloading(false);
        }
    };

    // ── Manual Combined helpers ──────────────────────────────────────────────────
    const applyRanks = (rows) => {
        const withTotals = rows.map(r => ({
            ...r,
            total: (parseFloat(r.j1) || 0) + (parseFloat(r.j2) || 0) + (parseFloat(r.j3) || 0)
        }));
        const uniqueTotals = [...new Set(withTotals.map(r => r.total))].sort((a, b) => b - a);
        return withTotals.map(r => ({ ...r, rank: uniqueTotals.indexOf(r.total) + 1 }));
    };

    const handleManualChange = (rowIdx, field, value) => {
        setManualRows(prev => {
            const next = prev.map((r, i) => i === rowIdx ? { ...r, [field]: value } : r);
            return applyRanks(next);
        });
        setManualRanksCalculated(true);
        setAutoFilled(false);
    };

    const addManualRow = () => {
        setManualRows(prev => [...prev, initManualRow(prev.length)]);
        setManualRanksCalculated(false);
    };

    const clearManualRows = () => {
        setManualRows(Array.from({ length: NUM_MANUAL }, (_, i) => initManualRow(i)));
        setManualRanksCalculated(false);
        setAutoFilled(false);
    };

    const autoFillFromJudges = () => {
        const raw = judges[1].map((p, i) => ({
            sino: String(i + 1),
            participantName: p.participantName || '',
            chestNo: p.chestNo || '',
            j1: String(judges[1][i].total),
            j2: String(judges[2][i].total),
            j3: String(judges[3][i].total),
            total: judges[1][i].total + judges[2][i].total + judges[3][i].total,
            rank: null,
        }));
        setManualRows(applyRanks(raw));
        setManualRanksCalculated(true);
        setAutoFilled(true);
    };

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return (
        <div className="app-container">
            {/* System Switcher Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Link
                    href="/"
                    style={{
                        padding: '0.6rem 1.4rem',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        transition: 'all 0.3s'
                    }}
                >
                    🏆 Grand Finale System
                </Link>
                <Link
                    href="/zonal"
                    style={{
                        padding: '0.6rem 1.4rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    🌟 ASISC Zonal System
                </Link>
            </div>

            <header>
                <h1>ASISC Zonal Judging System</h1>
                <p>Interactive participant selection and scoring for ASISC Zonal Competitions</p>
            </header>

            {/* ── Event Meta Bar ── */}
            <div className="event-meta-container" style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                {/* Event Dropdown */}
                <div className="meta-field" style={{ flex: '1 1 220px' }}>
                    <label>Event Name:</label>
                    <EventDropdown value={eventName} onChange={handleEventSelect} />
                </div>

                {/* Category multi-select chips */}
                <div className="meta-field" style={{ flex: '2 1 280px' }}>
                    <label>
                        Category:
                        {availableCategories.length > 1 && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.73rem', color: '#7c3aed', fontWeight: 400 }}>
                                (select one or more)
                            </span>
                        )}
                    </label>
                    <CategorySelector
                        availableCategories={availableCategories}
                        selectedCategories={selectedCategories}
                        onToggle={handleCategoryToggle}
                    />
                </div>

                {/* Event Type toggle */}
                <div className="meta-field" style={{ flex: '1 1 180px' }}>
                    <label>Event Type:</label>
                    <div style={{
                        display: 'flex', gap: '0.5rem',
                        background: 'rgba(0,0,0,0.2)', padding: '0.25rem',
                        borderRadius: '6px', border: '1px solid var(--border-color)',
                        height: '42px', alignItems: 'center',
                    }}>
                        <button
                            type="button"
                            onClick={() => handleEventTypeChange('individual')}
                            style={{
                                flex: 1, height: '100%',
                                background: eventType === 'individual' ? 'var(--primary-color)' : 'transparent',
                                color: eventType === 'individual' ? '#fff' : 'var(--text-muted)',
                                border: 'none', borderRadius: '4px', cursor: 'pointer',
                                fontWeight: '600', transition: 'all 0.2s ease', outline: 'none'
                            }}
                        >
                            Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => handleEventTypeChange('group')}
                            style={{
                                flex: 1, height: '100%',
                                background: eventType === 'group' ? 'var(--primary-color)' : 'transparent',
                                color: eventType === 'group' ? '#fff' : 'var(--text-muted)',
                                border: 'none', borderRadius: '4px', cursor: 'pointer',
                                fontWeight: '600', transition: 'all 0.2s ease', outline: 'none'
                            }}
                        >
                            Group
                        </button>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="meta-field" style={{ flex: '0 0 auto', display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                        className="btn secondary"
                        onClick={() => selectedCategories.length > 0 && fillRosterForCategory(selectedCategories[0])}
                        style={{ background: '#7c3aed', boxShadow: '0 4px 15px rgba(124,58,237,0.4)', minWidth: '150px' }}
                    >
                        👥 Fill Roster
                    </button>
                    <button
                        className="btn secondary"
                        onClick={sortByChestNumber}
                        style={{ background: '#3b82f6', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', minWidth: '150px' }}
                    >
                        🔢 Sort by Chest No
                    </button>
                    <button
                        className="btn secondary"
                        onClick={autoAssignChestNos}
                        style={{ background: '#059669', boxShadow: '0 4px 15px rgba(5,150,105,0.4)', minWidth: '130px' }}
                    >
                        ⚡ Auto C1..C13
                    </button>
                    <button
                        className="btn secondary"
                        onClick={fillDemoData}
                        style={{ background: '#6366f1', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', minWidth: '130px' }}
                    >
                        Fill Demo Data
                    </button>
                    <button
                        className="btn secondary"
                        onClick={clearAllData}
                        style={{ background: '#ef4444', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', minWidth: '100px' }}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* ── Selection Summary Badge ── */}
            {eventName && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
                    marginBottom: '1.5rem', marginTop: '-0.5rem',
                    padding: '0.55rem 1rem', borderRadius: '8px',
                    background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.22)',
                    fontSize: '0.88rem',
                }}>
                    <span style={{ color: '#a78bfa', fontWeight: 700 }}>📋 Event:</span>
                    <span style={{ color: '#e2e8f0' }}>{eventName}</span>
                    {selectedCategories.length > 0 && (
                        <>
                            <span style={{ color: '#334155' }}>·</span>
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>🏷 Category:</span>
                            <span style={{ color: '#e2e8f0' }}>{categoryName}</span>
                        </>
                    )}
                    <span style={{ color: '#334155' }}>·</span>
                    <span style={{ color: '#a78bfa', fontWeight: 700 }}>⚡ Type:</span>
                    <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>{eventType}</span>
                </div>
            )}

            <nav className="tabs">
                <button className={`tab-btn ${activeTab === 'judge1' ? 'active' : ''}`} onClick={() => setActiveTab('judge1')}>Judge 1</button>
                <button className={`tab-btn ${activeTab === 'judge2' ? 'active' : ''}`} onClick={() => setActiveTab('judge2')}>Judge 2</button>
                <button className={`tab-btn ${activeTab === 'judge3' ? 'active' : ''}`} onClick={() => setActiveTab('judge3')}>Judge 3</button>
                <button className={`tab-btn combined-btn ${activeTab === 'combined' ? 'active' : ''}`} onClick={() => setActiveTab('combined')}>Combined</button>
                <button className={`tab-btn results-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Results</button>
            </nav>

            <main className="content">
                {activeTab === 'judge1' && (
                    <section className="tab-content active">
                        <ZonalJudgeTable
                            judgeId={1}
                            participants={judges[1]}
                            onScoreChange={(idx, field, val, maxVal) => handleScoreChange(1, idx, field, val, maxVal)}
                            onChestChange={handleChestChange}
                            onNameClick={handleOpenModal}
                            onSortByChestNo={sortByChestNumber}
                            criteria={getCriteriaForEvent(eventName)}
                        />
                    </section>
                )}
                {activeTab === 'judge2' && (
                    <section className="tab-content active">
                        <ZonalJudgeTable
                            judgeId={2}
                            participants={judges[2]}
                            onScoreChange={(idx, field, val, maxVal) => handleScoreChange(2, idx, field, val, maxVal)}
                            onChestChange={handleChestChange}
                            onNameClick={handleOpenModal}
                            onSortByChestNo={sortByChestNumber}
                            criteria={getCriteriaForEvent(eventName)}
                        />
                    </section>
                )}
                {activeTab === 'judge3' && (
                    <section className="tab-content active">
                        <ZonalJudgeTable
                            judgeId={3}
                            participants={judges[3]}
                            onScoreChange={(idx, field, val, maxVal) => handleScoreChange(3, idx, field, val, maxVal)}
                            onChestChange={handleChestChange}
                            onNameClick={handleOpenModal}
                            onSortByChestNo={sortByChestNumber}
                            criteria={getCriteriaForEvent(eventName)}
                        />
                    </section>
                )}
                {activeTab === 'combined' && (
                    <section className="tab-content active">
                        <div className="results-section">
                            <h2>Zonal Combined Results
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.75rem',
                                    color: autoFilled ? '#a78bfa' : '#0ea5e9',
                                    background: autoFilled ? 'rgba(167,139,250,0.12)' : 'rgba(14,165,233,0.12)',
                                    border: `1px solid ${autoFilled ? 'rgba(167,139,250,0.3)' : 'rgba(14,165,233,0.3)'}`,
                                    padding: '0.2rem 0.65rem', borderRadius: '20px',
                                    verticalAlign: 'middle', letterSpacing: '0.03em',
                                    transition: 'all 0.3s ease',
                                }}>
                                    {autoFilled ? '⚡ Auto-filled from Judges' : '✏️ Manual Entry'}
                                </span>
                            </h2>

                            <div className="action-bar" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
                                <button className="btn secondary" onClick={autoFillFromJudges}
                                    style={{ background: '#7c3aed', boxShadow: '0 4px 15px rgba(124,58,237,0.4)', minWidth: '160px' }}
                                >
                                    ⚡ Auto-fill from Judges
                                </button>
                                <button className="btn secondary" onClick={sortByChestNumber}
                                    style={{ background: '#3b82f6', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', minWidth: '150px' }}
                                >
                                    🔢 Sort by Chest No
                                </button>
                                <button className="btn secondary" onClick={addManualRow}
                                    style={{ background: '#6366f1', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', minWidth: '120px' }}
                                >
                                    + Add Row
                                </button>
                                <button className="btn secondary" onClick={clearManualRows}
                                    style={{ background: '#ef4444', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', minWidth: '100px' }}
                                >
                                    Clear
                                </button>
                                <button
                                    className="btn secondary"
                                    onClick={handleCombinedDownload}
                                    disabled={!manualRanksCalculated || combinedDownloading}
                                    style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
                                >
                                    {combinedDownloading ? 'Downloading…' : '⬇ Download Excel'}
                                </button>
                            </div>

                            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                                <table className="judge-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>SL No</th>
                                            <th style={{ width: '220px' }}>Participant Name</th>
                                            <th style={{ width: '110px' }}>CH No</th>
                                            <th>Judge 1 (50)</th>
                                            <th>Judge 2 (50)</th>
                                            <th>Judge 3 (50)</th>
                                            <th>Total (150)</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {manualRows.map((row, idx) => {
                                            let rowClass = '';
                                            let rankClass = '';
                                            if (row.rank === 1) { rowClass = 'first-place'; rankClass = 'rank-1'; }
                                            else if (row.rank === 2) { rowClass = 'second-place'; rankClass = 'rank-2'; }
                                            else if (row.rank === 3) { rowClass = 'third-place'; rankClass = 'rank-3'; }
                                            return (
                                                <tr key={idx} className={rowClass}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="chest-input"
                                                            placeholder={`${idx + 1}`}
                                                            value={row.sino}
                                                            onChange={e => handleManualChange(idx, 'sino', e.target.value)}
                                                            style={{ width: '56px', textAlign: 'center' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="chest-input"
                                                            placeholder="Participant Name"
                                                            value={row.participantName || ''}
                                                            onChange={e => handleManualChange(idx, 'participantName', e.target.value)}
                                                            style={{ width: '100%', textAlign: 'left' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="chest-input"
                                                            placeholder={`CH ${idx + 1}`}
                                                            value={row.chestNo}
                                                            onChange={e => handleManualChange(idx, 'chestNo', e.target.value)}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number" min="0" max="50"
                                                            className="score-input"
                                                            placeholder="0"
                                                            value={row.j1}
                                                            onChange={e => handleManualChange(idx, 'j1', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number" min="0" max="50"
                                                            className="score-input"
                                                            placeholder="0"
                                                            value={row.j2}
                                                            onChange={e => handleManualChange(idx, 'j2', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number" min="0" max="50"
                                                            className="score-input"
                                                            placeholder="0"
                                                            value={row.j3}
                                                            onChange={e => handleManualChange(idx, 'j3', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="total-cell">
                                                        <strong>{row.total}</strong>
                                                    </td>
                                                    <td className={rankClass} style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                                                        {row.rank
                                                            ? <strong>{row.rank}{getOrdinal(row.rank)}</strong>
                                                            : <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>—</span>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'results' && (
                    <section className="tab-content active">
                        <div className="results-section">
                            <h2>Zonal Grand Leaderboard</h2>
                            <div className="action-bar">
                                <button className="btn primary" onClick={calculateResults}>Calculate Final Results</button>
                                <button className="btn secondary" onClick={handleExport} disabled={!showResults}>Download Combined Excel</button>
                            </div>

                            {showResults && (
                                <div className="table-wrapper">
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                <th>SI NO</th>
                                                <th>PARTICIPANT NAME</th>
                                                <th>CHEST NO</th>
                                                <th>Judge 1 Total</th>
                                                <th>Judge 2 Total</th>
                                                <th>Judge 3 Total</th>
                                                <th>Grand Total (150)</th>
                                                <th>Average (50)</th>
                                                <th>Rank</th>
                                                <th>Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {combinedResults.map((p, idx) => {
                                                let rowClass = '';
                                                let rankClass = '';
                                                if (p.rank === 1) { rowClass = 'first-place'; rankClass = 'rank-1'; }
                                                else if (p.rank === 2) { rowClass = 'second-place'; rankClass = 'rank-2'; }
                                                else if (p.rank === 3) { rowClass = 'third-place'; rankClass = 'rank-3'; }
                                                return (
                                                    <tr key={idx} className={rowClass}>
                                                        <td>{p.sino}</td>
                                                        <td style={{ fontWeight: 600, textAlign: 'left' }}>{p.participantName}</td>
                                                        <td>{p.chestNo}</td>
                                                        <td>{p.t1}</td>
                                                        <td>{p.t2}</td>
                                                        <td>{p.t3}</td>
                                                        <td><strong>{p.grandTotal}</strong></td>
                                                        <td>{p.average}</td>
                                                        <td className={rankClass}>{p.rank}{getOrdinal(p.rank)}</td>
                                                        <td><strong>{p.points}</strong></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Participant Selection Modal */}
            <ParticipantModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelectParticipant}
                currentName={activeRowIndex !== null ? judges[1][activeRowIndex]?.participantName : ''}
                assignedNames={assignedNames}
            />
        </div>
    );
}
