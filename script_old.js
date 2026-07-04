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

    // Store consolidated results data
    let combinedResultsData = [];
    let judgesData = { 1: [], 2: [], 3: [] };

    // Calculate Results
    const calcCombinedBtn = document.getElementById('calcCombinedBtn');
    const exportCombinedBtn = document.getElementById('exportCombinedBtn');
    const combinedResultsTbody = document.querySelector('#combinedResultsTable tbody');
    const combinedResultsTable = document.getElementById('combinedResultsTable');

    calcCombinedBtn.addEventListener('click', () => {
        combinedResultsTbody.innerHTML = '';
        combinedResultsData = [];
        judgesData = { 1: [], 2: [], 3: [] };

        // 1. Gather all individual scores for all judges
        for (let j = 1; j <= 3; j++) {
            for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
                const chestNo = document.querySelector(`.chest-input[data-judge="${j}"][data-row="${i}"]`).value || `Participant ${i}`;
                const s1 = parseFloat(document.querySelector(`.score-input.p-clarity[data-judge="${j}"][data-row="${i}"]`).value) || 0;
                const s2 = parseFloat(document.querySelector(`.score-input.v-mod[data-judge="${j}"][data-row="${i}"]`).value) || 0;
                const s3 = parseFloat(document.querySelector(`.score-input.conf[data-judge="${j}"][data-row="${i}"]`).value) || 0;
                const s4 = parseFloat(document.querySelector(`.score-input.o-impact[data-judge="${j}"][data-row="${i}"]`).value) || 0;
                const s5 = parseFloat(document.querySelector(`.score-input.e-deliv[data-judge="${j}"][data-row="${i}"]`).value) || 0;
                const total = s1 + s2 + s3 + s4 + s5;

                judgesData[j].push({
                    sino: i,
                    chestNo,
                    s1, s2, s3, s4, s5,
                    total,
                    average: (total / 5).toFixed(2),
                    rank: null,
                    points: 0
                });
            }

            // Calculate local ranks/points for individual judge sheets
            const sortedLocal = [...new Set(judgesData[j].map(p => parseFloat(p.total)))].sort((a, b) => b - a);
            judgesData[j].forEach(p => {
                const rankIndex = sortedLocal.indexOf(p.total);
                p.rank = rankIndex + 1;
                if (p.rank === 1) p.points = 10;
                else if (p.rank === 2) p.points = 7;
                else if (p.rank === 3) p.points = 5;
                else p.points = 0;
            });
        }

        // 2. Gather combined results
        for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
            const chestNo = judgesData[1][i - 1].chestNo;
            const t1 = judgesData[1][i - 1].total;
            const t2 = judgesData[2][i - 1].total;
            const t3 = judgesData[3][i - 1].total;
            
            const grandTotal = t1 + t2 + t3;
            const average = grandTotal / 3;

            combinedResultsData.push({
                sino: i,
                chestNo,
                t1, t2, t3,
                grandTotal,
                average: average.toFixed(2),
                rank: null,
                points: 0
            });
        }

        // Sort by final average descending to find combined ranks
        const sortedGrand = [...new Set(combinedResultsData.map(p => parseFloat(p.average)))].sort((a, b) => b - a);
        
        combinedResultsData.forEach(p => {
            const rankIndex = sortedGrand.indexOf(parseFloat(p.average));
            p.rank = rankIndex + 1;
            
            if (p.rank === 1) p.points = 10;
            else if (p.rank === 2) p.points = 7;
            else if (p.rank === 3) p.points = 5;
            else p.points = 0;
        });

        // Render Combined Results Table
        combinedResultsData.forEach(p => {
            const tr = document.createElement('tr');
            
            if (p.rank === 1) tr.classList.add('first-place');
            if (p.rank === 2) tr.classList.add('second-place');
            if (p.rank === 3) tr.classList.add('third-place');

            let rankClass = '';
            if (p.rank === 1) rankClass = 'rank-1';
            if (p.rank === 2) rankClass = 'rank-2';
            if (p.rank === 3) rankClass = 'rank-3';

            tr.innerHTML = `
                <td>${p.sino}</td>
                <td>${p.chestNo}</td>
                <td>${p.t1}</td>
                <td>${p.t2}</td>
                <td>${p.t3}</td>
                <td><strong>${p.grandTotal}</strong></td>
                <td>${p.average}</td>
                <td class="${rankClass}">${p.rank}${getOrdinal(p.rank)}</td>
                <td><strong>${p.points}</strong></td>
            `;
            combinedResultsTbody.appendChild(tr);
        });

        combinedResultsTable.style.display = 'table';
        exportCombinedBtn.disabled = false;
    });

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // Colors for Excel Highlights
    const EXCEL_HIGHLIGHTS = {
        1: { fill: 'FFFFD700', font: 'FF000000' }, // Gold (Yellow)
        2: { fill: 'FFE2E8F0', font: 'FF000000' }, // Silver (Light gray)
        3: { fill: 'FFFFE4C4', font: 'FF000000' }  // Bronze (Soft peach/orange)
    };

    function applyWinnerHighlight(excelRow, rank) {
        if (EXCEL_HIGHLIGHTS[rank]) {
            const fillStyle = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: EXCEL_HIGHLIGHTS[rank].fill }
            };
            const fontStyle = { bold: true, color: { argb: EXCEL_HIGHLIGHTS[rank].font } };
            
            // Highlight SINO (Col A) and CHEST NO (Col B)
            const cellSino = excelRow.getCell(1);
            const cellChest = excelRow.getCell(2);

            cellSino.fill = fillStyle;
            cellSino.font = fontStyle;
            cellChest.fill = fillStyle;
            cellChest.font = fontStyle;
        }
    }

    // Export Combined Report
    exportCombinedBtn.addEventListener('click', async () => {
        if (typeof ExcelJS === 'undefined') {
            alert('Excel library is loading, please wait or check your internet connection.');
            return;
        }

        const workbook = new ExcelJS.Workbook();

        // 1. Generate Judge Sheets
        for (let j = 1; j <= 3; j++) {
            const sheet = workbook.addWorksheet(`Judge ${j}`);
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
                fgColor: { argb: 'FF3B82F6' }
            };
            sheet.getRow(1).alignment = { horizontal: 'center' };

            // Add rows
            judgesData[j].forEach((row, index) => {
                const rowIndex = index + 2;
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

                // Apply dynamic formulas for Excel native sum & average
                excelRow.getCell('total').value = { formula: `SUM(C${rowIndex}:G${rowIndex})`, result: row.total };
                excelRow.getCell('average').value = { formula: `H${rowIndex}/5`, result: parseFloat(row.average) };

                // Highlight SINO and CHEST NO for top 3
                applyWinnerHighlight(excelRow, row.rank);
            });

            // Add borders to all cells
            sheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
        }

        // 2. Generate Consolidated Results Sheet
        const grandSheet = workbook.addWorksheet('Grand Results');
        grandSheet.columns = [
            { header: 'SI NO', key: 'sino', width: 10 },
            { header: 'CHEST NO', key: 'chestNo', width: 15 },
            { header: 'Judge 1 Total', key: 't1', width: 15 },
            { header: 'Judge 2 Total', key: 't2', width: 15 },
            { header: 'Judge 3 Total', key: 't3', width: 15 },
            { header: 'Grand Total (150)', key: 'grandTotal', width: 20 },
            { header: 'Average (50)', key: 'average', width: 18 },
            { header: 'Rank', key: 'rank', width: 10 },
            { header: 'Points', key: 'points', width: 10 }
        ];

        // Style headers
        grandSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        grandSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF10B981' } // Green for final leaderboard
        };
        grandSheet.getRow(1).alignment = { horizontal: 'center' };

        combinedResultsData.forEach((row, index) => {
            const rowIndex = index + 2;
            grandSheet.addRow({
                sino: row.sino,
                chestNo: row.chestNo,
                t1: row.t1,
                t2: row.t2,
                t3: row.t3,
                rank: row.rank,
                points: row.points
            });

            const excelRow = grandSheet.getRow(rowIndex);
            excelRow.alignment = { horizontal: 'center' };

            // Formulas for Grand Total and Final Average
            excelRow.getCell('grandTotal').value = { formula: `SUM(C${rowIndex}:E${rowIndex})`, result: row.grandTotal };
            excelRow.getCell('average').value = { formula: `F${rowIndex}/3`, result: parseFloat(row.average) };

            // Highlight SINO and CHEST NO for top 3 final results
            applyWinnerHighlight(excelRow, row.rank);
        });

        // Add borders to all cells
        grandSheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Generate and save workbook
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Grand_Finale_Combined_Results.xlsx');
    });
});
