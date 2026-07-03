document.addEventListener('DOMContentLoaded', () => {
    const NUM_PARTICIPANTS = 8;
    const SCORE_MAX = 10;
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Initialize Judge Tables
    const judgeTables = document.querySelectorAll('.judge-table tbody');
    judgeTables.forEach((tbody, judgeIndex) => {
        for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i}</td>
                <td><input type="text" class="chest-input" data-judge="${judgeIndex + 1}" data-row="${i}" placeholder="Chest ${i}"></td>
                <td><input type="number" min="0" max="10" class="score-input p-clarity" data-judge="${judgeIndex + 1}" data-row="${i}"></td>
                <td><input type="number" min="0" max="10" class="score-input v-mod" data-judge="${judgeIndex + 1}" data-row="${i}"></td>
                <td><input type="number" min="0" max="10" class="score-input conf" data-judge="${judgeIndex + 1}" data-row="${i}"></td>
                <td><input type="number" min="0" max="10" class="score-input o-impact" data-judge="${judgeIndex + 1}" data-row="${i}"></td>
                <td><input type="number" min="0" max="10" class="score-input e-deliv" data-judge="${judgeIndex + 1}" data-row="${i}"></td>
                <td class="total-cell" id="total-j${judgeIndex + 1}-r${i}">0</td>
            `;
            tbody.appendChild(tr);
        }
    });

    // Sync chest numbers across judges
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('chest-input')) {
            const row = e.target.dataset.row;
            const val = e.target.value;
            document.querySelectorAll(`.chest-input[data-row="${row}"]`).forEach(input => {
                if (input !== e.target) input.value = val;
            });
        }
    });

    // Calculate Row Totals
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('score-input')) {
            // Validate input
            let val = parseFloat(e.target.value);
            if (val > SCORE_MAX) e.target.value = SCORE_MAX;
            if (val < 0) e.target.value = 0;

            const judge = e.target.dataset.judge;
            const row = e.target.dataset.row;
            
            const rowInputs = document.querySelectorAll(`.score-input[data-judge="${judge}"][data-row="${row}"]`);
            let total = 0;
            rowInputs.forEach(input => {
                total += parseFloat(input.value) || 0;
            });
            
            document.getElementById(`total-j${judge}-r${row}`).innerText = total;
        }
    });

    // Store results data per judge
    const judgeResultsData = {
        1: [],
        2: [],
        3: []
    };

    // Calculate Results per judge
    const calcBtns = document.querySelectorAll('.calc-btn');
    
    calcBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const judge = e.target.dataset.judge;
            const resultsTable = document.getElementById(`resultsTable-${judge}`);
            const resultsTbody = resultsTable.querySelector('tbody');
            const exportBtn = document.querySelector(`.export-btn[data-judge="${judge}"]`);
            
            resultsTbody.innerHTML = '';
            judgeResultsData[judge] = [];

            // Collect Totals
            for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
                const chestNo = document.querySelector(`.chest-input[data-judge="${judge}"][data-row="${i}"]`).value || `Participant ${i}`;
                const total = parseFloat(document.getElementById(`total-j${judge}-r${i}`).innerText) || 0;
                
                const s1 = parseFloat(document.querySelector(`.p-clarity[data-judge="${judge}"][data-row="${i}"]`).value) || 0;
                const s2 = parseFloat(document.querySelector(`.v-mod[data-judge="${judge}"][data-row="${i}"]`).value) || 0;
                const s3 = parseFloat(document.querySelector(`.conf[data-judge="${judge}"][data-row="${i}"]`).value) || 0;
                const s4 = parseFloat(document.querySelector(`.o-impact[data-judge="${judge}"][data-row="${i}"]`).value) || 0;
                const s5 = parseFloat(document.querySelector(`.e-deliv[data-judge="${judge}"][data-row="${i}"]`).value) || 0;

                // Average based on 5 criteria
                const average = total / 5;

                judgeResultsData[judge].push({
                    sino: i,
                    chestNo: chestNo,
                    s1: s1,
                    s2: s2,
                    s3: s3,
                    s4: s4,
                    s5: s5,
                    total: total,
                    average: average.toFixed(2),
                    rank: null,
                    points: 0
                });
            }

            // Calculate Ranks and Points
            // Sort by average descending to find ranks
            const sortedScores = [...new Set(judgeResultsData[judge].map(p => parseFloat(p.average)))].sort((a, b) => b - a);
            
            judgeResultsData[judge].forEach(p => {
                const rankIndex = sortedScores.indexOf(parseFloat(p.average));
                p.rank = rankIndex + 1; // 1st, 2nd, 3rd, etc.
                
                if (p.rank === 1) p.points = 10;
                else if (p.rank === 2) p.points = 7;
                else if (p.rank === 3) p.points = 5;
                else p.points = 0;
            });

            // Render Results Table
            judgeResultsData[judge].forEach(p => {
                const tr = document.createElement('tr');
                if (p.rank === 1) tr.classList.add('first-place');
                if (p.rank === 2) tr.classList.add('second-place');
                if (p.rank === 3) tr.classList.add('third-place');
                
                let rankClass = '';
                if(p.rank === 1) rankClass = 'rank-1';
                if(p.rank === 2) rankClass = 'rank-2';
                if(p.rank === 3) rankClass = 'rank-3';

                tr.innerHTML = `
                    <td>${p.sino}</td>
                    <td>${p.chestNo}</td>
                    <td><strong>${p.total}</strong></td>
                    <td>${p.average}</td>
                    <td class="${rankClass}">${p.rank}${getOrdinal(p.rank)}</td>
                    <td><strong>${p.points}</strong></td>
                `;
                resultsTbody.appendChild(tr);
            });

            resultsTable.style.display = 'table';
            exportBtn.disabled = false;
        });
    });

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // Export to Excel with Highlighting using ExcelJS
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (typeof ExcelJS === 'undefined') {
                alert('Excel library is loading, please wait or check your internet connection.');
                return;
            }

            const judge = e.target.dataset.judge;
            const data = judgeResultsData[judge];

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet(`Judge ${judge} Results`);

            // Define columns
            sheet.columns = [
                { header: 'SI NO', key: 'sino', width: 10 },
                { header: 'CHEST NO', key: 'chestNo', width: 15 },
                { header: 'Pronunciation Clarity (10)', key: 's1', width: 25 },
                { header: 'Voice Modulation (10)', key: 's2', width: 25 },
                { header: 'Confidence (10)', key: 's3', width: 20 },
                { header: 'Overall Impact (10)', key: 's4', width: 25 },
                { header: 'Effectiveness (10)', key: 's5', width: 20 },
                { header: 'Total (50)', key: 'total', width: 15 },
                { header: 'Average (10)', key: 'average', width: 15 },
                { header: 'Rank', key: 'rank', width: 10 },
                { header: 'Points', key: 'points', width: 10 }
            ];

            // Style headers
            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF3B82F6' } // Primary color blue
            };
            sheet.getRow(1).alignment = { horizontal: 'center' };

            // Add Data & Highlight Winners
            data.forEach((row, index) => {
                const rowIndex = index + 2; // Data starts at row 2
                sheet.addRow({
                    sino: row.sino,
                    chestNo: row.chestNo,
                    s1: row.s1,
                    s2: row.s2,
                    s3: row.s3,
                    s4: row.s4,
                    s5: row.s5,
                    rank: row.rank,
                    points: row.points
                });

                const excelRow = sheet.getRow(rowIndex);
                excelRow.alignment = { horizontal: 'center' };
                
                // Add formulas for Total and Average
                excelRow.getCell('total').value = { formula: `SUM(C${rowIndex}:G${rowIndex})`, result: row.total };
                excelRow.getCell('average').value = { formula: `H${rowIndex}/5`, result: parseFloat(row.average) };

                // Highlight 1st Place entirely
                if (row.rank === 1) {
                    const fillStyle = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFD700' } // Gold/Yellow
                    };
                    const fontStyle = { bold: true, color: { argb: 'FF000000' } }; // Black text for contrast
                    
                    excelRow.eachCell({ includeEmpty: true }, (cell) => {
                        cell.fill = fillStyle;
                        cell.font = fontStyle;
                    });
                }
            });

            // Add borders to all cells
            sheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    };
                });
            });

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Judge_${judge}_Results.xlsx`);
        });
    });
});
