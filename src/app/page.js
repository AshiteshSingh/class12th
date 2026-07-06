'use client';

import { useState, useMemo } from 'react';
import JudgeTable from '../components/JudgeTable';
import { exportCombinedReport } from '../utils/exportExcel';

const NUM_PARTICIPANTS = 8;
const SCORE_MAX = 10;

const initialJudgeState = Array.from({ length: NUM_PARTICIPANTS }, (_, i) => ({
    sino: i + 1,
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

export default function Home() {
    const [activeTab, setActiveTab] = useState('judge1');
    const [judges, setJudges] = useState({
        1: JSON.parse(JSON.stringify(initialJudgeState)),
        2: JSON.parse(JSON.stringify(initialJudgeState)),
        3: JSON.parse(JSON.stringify(initialJudgeState)),
    });
    
    const [combinedResults, setCombinedResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [eventName, setEventName] = useState('');
    const [categoryName, setCategoryName] = useState('');

    const clearAllData = () => {
        setEventName('');
        setCategoryName('');
        setJudges({
            1: JSON.parse(JSON.stringify(initialJudgeState)),
            2: JSON.parse(JSON.stringify(initialJudgeState)),
            3: JSON.parse(JSON.stringify(initialJudgeState)),
        });
        setCombinedResults([]);
        setShowResults(false);
    };

    const fillDemoData = () => {
        setEventName('Declamation Contest');
        setCategoryName('Senior Group');
        
        setJudges(prev => {
            const next = { ...prev };
            for (let j = 1; j <= 3; j++) {
                for (let i = 0; i < NUM_PARTICIPANTS; i++) {
                    const p = next[j][i];
                    p.chestNo = `C${i + 1}`;
                    
                    // Generate random scores
                    p.s1 = Math.floor(Math.random() * 6) + 5; // 5 to 10
                    p.s1Str = String(p.s1);
                    p.s2 = Math.floor(Math.random() * 6) + 5;
                    p.s2Str = String(p.s2);
                    p.s3 = Math.floor(Math.random() * 6) + 5;
                    p.s3Str = String(p.s3);
                    p.s4 = Math.floor(Math.random() * 6) + 5;
                    p.s4Str = String(p.s4);
                    p.s5 = Math.floor(Math.random() * 6) + 5;
                    p.s5Str = String(p.s5);
                    
                    p.total = p.s1 + p.s2 + p.s3 + p.s4 + p.s5;
                    p.average = (p.total / 5).toFixed(2);
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

    const handleScoreChange = (judgeId, participantIndex, field, value) => {
        let numericValue = parseFloat(value);
        if (isNaN(numericValue)) numericValue = 0;
        if (numericValue > SCORE_MAX) numericValue = SCORE_MAX;
        if (numericValue < 0) numericValue = 0;
        
        setJudges(prev => {
            const next = { ...prev };
            next[judgeId][participantIndex][field] = numericValue;
            next[judgeId][participantIndex][`${field}Str`] = value;
            
            // Calc total for this judge row
            const p = next[judgeId][participantIndex];
            p.total = p.s1 + p.s2 + p.s3 + p.s4 + p.s5;
            p.average = (p.total / 5).toFixed(2);
            
            return next;
        });
    };

    const calculateResults = () => {
        // Deep copy to avoid mutating state directly during calc
        const judgesData = JSON.parse(JSON.stringify(judges));
        const combined = [];
        
        // 1. Calculate ranks for individual judges
        for (let j = 1; j <= 3; j++) {
            const sortedLocal = [...new Set(judgesData[j].map(p => p.total))].sort((a, b) => b - a);
            judgesData[j].forEach(p => {
                const rankIndex = sortedLocal.indexOf(p.total);
                p.rank = rankIndex + 1;
                if (p.rank === 1) p.points = 10;
                else if (p.rank === 2) p.points = 7;
                else if (p.rank === 3) p.points = 5;
                else p.points = 0;
            });
        }
        
        // 2. Combine results
        for (let i = 0; i < NUM_PARTICIPANTS; i++) {
            const chestNo = judgesData[1][i].chestNo || `Participant ${i + 1}`;
            const t1 = judgesData[1][i].total;
            const t2 = judgesData[2][i].total;
            const t3 = judgesData[3][i].total;
            
            const grandTotal = t1 + t2 + t3;
            const average = grandTotal / 3;
            
            combined.push({
                sino: i + 1,
                chestNo,
                t1, t2, t3,
                grandTotal,
                average: average.toFixed(2),
                rank: null,
                points: 0
            });
        }
        
        // 3. Sort by average descending to find ranks
        const sortedGrand = [...new Set(combined.map(p => parseFloat(p.average)))].sort((a, b) => b - a);
        combined.forEach(p => {
            const rankIndex = sortedGrand.indexOf(parseFloat(p.average));
            p.rank = rankIndex + 1;
            
            if (p.rank === 1) p.points = 10;
            else if (p.rank === 2) p.points = 7;
            else if (p.rank === 3) p.points = 5;
            else p.points = 0;
        });
        
        setJudges(judgesData);
        setCombinedResults(combined);
        setShowResults(true);
    };

    const handleExport = async () => {
        if (!showResults) return;
        await exportCombinedReport(judges, combinedResults, eventName, categoryName);
    };

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return (
        <div className="app-container">
            <header>
                <h1>Grand Finale Judging System</h1>
                <p>Score participants across 5 categories</p>
            </header>

            {/* Event Name & Category Inputs */}
            <div className="event-meta-container" style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="meta-field" style={{ flex: '1 1 250px' }}>
                    <label htmlFor="eventName">Event Name:</label>
                    <input 
                        type="text" 
                        id="eventName" 
                        placeholder="e.g. Declamation, Debate" 
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>
                <div className="meta-field" style={{ flex: '1 1 250px' }}>
                    <label htmlFor="categoryName">Category:</label>
                    <input 
                        type="text" 
                        id="categoryName" 
                        placeholder="e.g. Sub-Junior, Junior, Senior" 
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </div>
                <div className="meta-field" style={{ flex: '0 0 auto', display: 'flex', gap: '0.75rem' }}>
                    <button className="btn secondary" onClick={fillDemoData} style={{ background: '#6366f1', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', minWidth: '150px' }}>
                        Fill Demo Data
                    </button>
                    <button className="btn secondary" onClick={clearAllData} style={{ background: '#ef4444', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)', minWidth: '120px' }}>
                        Clear All
                    </button>
                </div>
            </div>

            <nav className="tabs">
                <button className={`tab-btn ${activeTab === 'judge1' ? 'active' : ''}`} onClick={() => setActiveTab('judge1')}>Judge 1</button>
                <button className={`tab-btn ${activeTab === 'judge2' ? 'active' : ''}`} onClick={() => setActiveTab('judge2')}>Judge 2</button>
                <button className={`tab-btn ${activeTab === 'judge3' ? 'active' : ''}`} onClick={() => setActiveTab('judge3')}>Judge 3</button>
                <button className={`tab-btn results-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Results</button>
            </nav>

            <main className="content">
                {activeTab === 'judge1' && (
                    <section className="tab-content active">
                        <JudgeTable 
                            judgeId={1} 
                            participants={judges[1]} 
                            onScoreChange={(idx, field, val) => handleScoreChange(1, idx, field, val)}
                            onChestChange={handleChestChange}
                        />
                    </section>
                )}
                {activeTab === 'judge2' && (
                    <section className="tab-content active">
                        <JudgeTable 
                            judgeId={2} 
                            participants={judges[2]} 
                            onScoreChange={(idx, field, val) => handleScoreChange(2, idx, field, val)}
                            onChestChange={handleChestChange}
                        />
                    </section>
                )}
                {activeTab === 'judge3' && (
                    <section className="tab-content active">
                        <JudgeTable 
                            judgeId={3} 
                            participants={judges[3]} 
                            onScoreChange={(idx, field, val) => handleScoreChange(3, idx, field, val)}
                            onChestChange={handleChestChange}
                        />
                    </section>
                )}
                {activeTab === 'results' && (
                    <section className="tab-content active">
                        <div className="results-section">
                            <h2>Grand Leaderboard</h2>
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
        </div>
    );
}
