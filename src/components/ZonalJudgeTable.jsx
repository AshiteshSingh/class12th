'use client';

export default function ZonalJudgeTable({ judgeId, participants, onScoreChange, onChestChange, onNameClick }) {
    return (
        <div className="table-wrapper">
            <h2>Judge {judgeId} Scores</h2>
            <table className="judge-table" data-judge={judgeId}>
                <thead>
                    <tr>
                        <th style={{ width: '60px' }}>SI NO</th>
                        <th style={{ width: '220px' }}>PARTICIPANT NAME</th>
                        <th style={{ width: '110px' }}>CHEST NO</th>
                        <th>Pronunciation Clarity (10)</th>
                        <th>Voice Modulation (10)</th>
                        <th>Confidence (10)</th>
                        <th>Overall Impact (10)</th>
                        <th>Effectiveness (10)</th>
                        <th>TOTAL (50)</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((p, index) => {
                        const total = (p.s1 || 0) + (p.s2 || 0) + (p.s3 || 0) + (p.s4 || 0) + (p.s5 || 0);
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
                                <td>
                                    <input type="number" min="0" max="10" className="score-input p-clarity" value={p.s1 === 0 && p.s1Str === '' ? '' : p.s1} onChange={(e) => onScoreChange(index, 's1', e.target.value)} />
                                </td>
                                <td>
                                    <input type="number" min="0" max="10" className="score-input v-mod" value={p.s2 === 0 && p.s2Str === '' ? '' : p.s2} onChange={(e) => onScoreChange(index, 's2', e.target.value)} />
                                </td>
                                <td>
                                    <input type="number" min="0" max="10" className="score-input conf" value={p.s3 === 0 && p.s3Str === '' ? '' : p.s3} onChange={(e) => onScoreChange(index, 's3', e.target.value)} />
                                </td>
                                <td>
                                    <input type="number" min="0" max="10" className="score-input o-impact" value={p.s4 === 0 && p.s4Str === '' ? '' : p.s4} onChange={(e) => onScoreChange(index, 's4', e.target.value)} />
                                </td>
                                <td>
                                    <input type="number" min="0" max="10" className="score-input e-deliv" value={p.s5 === 0 && p.s5Str === '' ? '' : p.s5} onChange={(e) => onScoreChange(index, 's5', e.target.value)} />
                                </td>
                                <td className="total-cell">{total}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
