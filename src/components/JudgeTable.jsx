'use client';

import { DEFAULT_CRITERIA } from '../utils/participants';

export default function JudgeTable({ judgeId, participants, onScoreChange, onChestChange, criteria }) {
    const activeCriteria = criteria && criteria.length > 0 ? criteria : DEFAULT_CRITERIA;

    return (
        <div className="table-wrapper">
            <h2>Judge {judgeId} Scores</h2>
            <table className="judge-table" data-judge={judgeId}>
                <thead>
                    <tr>
                        <th>SI NO</th>
                        <th>CHEST NO</th>
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
                                    <input 
                                        type="text" 
                                        className="chest-input" 
                                        placeholder={`Chest ${index + 1}`} 
                                        value={p.chestNo || ''}
                                        onChange={(e) => onChestChange(index, e.target.value)}
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
