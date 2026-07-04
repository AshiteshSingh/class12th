'use client';

export default function JudgeTable({ judgeId, participants, onScoreChange, onChestChange }) {
    return (
        <div className="table-wrapper">
            <h2>Judge {judgeId} Scores</h2>
            <table className="judge-table" data-judge={judgeId}>
                <thead>
                    <tr>
                        <th>SI NO</th>
                        <th>CHEST NO</th>
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
                                    <input 
                                        type="text" 
                                        className="chest-input" 
                                        placeholder={`Chest ${index + 1}`} 
                                        value={p.chestNo || ''}
                                        onChange={(e) => onChestChange(index, e.target.value)}
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
