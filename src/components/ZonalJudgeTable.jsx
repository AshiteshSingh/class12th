'use client';

import { DEFAULT_CRITERIA } from '../utils/participants';

export default function ZonalJudgeTable({ judgeId, participants, onScoreChange, onChestChange, onNameClick, onSortByChestNo, criteria }) {
    const activeCriteria = criteria && criteria.length > 0 ? criteria : DEFAULT_CRITERIA;

    return (
        <div className="table-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ margin: 0 }}>Judge {judgeId} Scores</h2>
                {onSortByChestNo && (
                    <button
                        type="button"
                        onClick={onSortByChestNo}
                        style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            padding: '0.45rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--primary-color)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                            e.currentTarget.style.color = '#60a5fa';
                        }}
                    >
                        🔢 Sort by Chest No (1 → 13)
                    </button>
                )}
            </div>
            <table className="judge-table" data-judge={judgeId}>
                <thead>
                    <tr>
                        <th style={{ width: '60px' }}>SI NO</th>
                        <th style={{ width: '220px' }}>PARTICIPANT NAME</th>
                        <th style={{ width: '110px' }}>CHEST NO</th>
                        {activeCriteria.map((c, idx) => (
                            <th key={idx}>{c.label} ({c.max})</th>
                        ))}
                        <th>TOTAL (50)</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((p, index) => {
                        const total = activeCriteria.reduce((sum, c) => sum + (p[c.key] || 0), 0);
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => onNameClick(index)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: p.participantName ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                                            border: p.participantName ? '1px solid rgba(59, 130, 246, 0.35)' : '1px dashed var(--border-color)',
                                            color: p.participantName ? '#93c5fd' : 'var(--text-muted)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-family)',
                                            fontSize: '0.88rem',
                                            fontWeight: p.participantName ? 600 : 400,
                                            textAlign: 'left',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = p.participantName ? 'rgba(59, 130, 246, 0.35)' : 'var(--border-color)'}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.participantName || '+ Select Student'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.3rem' }}>
                                            {p.participantName ? '✏️' : '👤'}
                                        </span>
                                    </button>
                                </td>
                                <td>
                                    <input 
                                        type="text" 
                                        className="chest-input" 
                                        placeholder={`Chest ${index + 1}`} 
                                        value={p.chestNo || ''}
                                        onChange={(e) => onChestChange(index, e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                                {activeCriteria.map((c, cIdx) => (
                                    <td key={cIdx}>
                                        <input
                                            type="number"
                                            min="0"
                                            max={c.max}
                                            className="score-input"
                                            value={p[c.key] === 0 && p[`${c.key}Str`] === '' ? '' : p[c.key]}
                                            onChange={(e) => onScoreChange(index, c.key, e.target.value, c.max)}
                                        />
                                    </td>
                                ))}
                                <td className="total-cell">{total}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
