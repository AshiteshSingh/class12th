import ExcelJS from 'exceljs';

const EXCEL_HIGHLIGHTS = {
    1: { fill: 'FFFFD700', font: 'FF000000' }, // Gold (Yellow)
    2: { fill: 'FF93C5FD', font: 'FF000000' }, // Blue (Light blue)
    3: { fill: 'FFFCA5A5', font: 'FF000000' }  // Red (Light red/pink)
};

function applyWinnerHighlight(excelRow, rank, maxCols = 11) {
    if (EXCEL_HIGHLIGHTS[rank]) {
        const fillStyle = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: EXCEL_HIGHLIGHTS[rank].fill }
        };
        const fontStyle = { bold: true, color: { argb: EXCEL_HIGHLIGHTS[rank].font } };
        
        // Highlight the entire row up to maxCols
        for (let col = 1; col <= maxCols; col++) {
            const cell = excelRow.getCell(col);
            cell.fill = fillStyle;
            cell.font = fontStyle;
        }
    }
}

export const exportCombinedReport = async (judgesData, combinedResultsData, eventName, categoryName) => {
    const workbook = new ExcelJS.Workbook();

    // 1. Generate Judge Sheets
    for (let j = 1; j <= 3; j++) {
        const sheet = workbook.addWorksheet(`Judge ${j}`);

        // Add Event & Category Info at the Top
        sheet.getCell('A1').value = `JUDGING SHEET - JUDGE ${j}`;
        sheet.getCell('A1').font = { name: 'Outfit', size: 14, bold: true };
        
        sheet.getCell('A2').value = `Event Name: ${eventName || 'N/A'}`;
        sheet.getCell('A2').font = { name: 'Outfit', size: 11, bold: true };
        
        sheet.getCell('A3').value = `Category: ${categoryName || 'N/A'}`;
        sheet.getCell('A3').font = { name: 'Outfit', size: 11, bold: true };

        // Table headers at Row 5
        const headers = [
            'SI NO', 'CHEST NO', 
            'Pronunciation Clarity (10)', 'Voice Modulation (10)', 'Confidence (10)', 
            'Overall Impact (10)', 'Effectiveness (10)', 
            'Total (50)', 'Average (10)', 'Rank', 'Points'
        ];
        const headerRow = sheet.getRow(5);
        headerRow.values = headers;
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
        };
        headerRow.alignment = { horizontal: 'center' };

        // Define column widths manually
        const colWidths = [10, 15, 25, 25, 20, 25, 20, 15, 15, 10, 10];
        colWidths.forEach((w, idx) => {
            sheet.getColumn(idx + 1).width = w;
        });

        // Add rows manually starting at Row 6
        judgesData[j].forEach((row, index) => {
            const rowIndex = index + 6;
            const dataRow = sheet.getRow(rowIndex);
            dataRow.values = [
                row.sino,
                row.chestNo,
                row.s1,
                row.s2,
                row.s3,
                row.s4,
                row.s5,
                '', // Total
                '', // Average
                row.rank,
                row.points
            ];
            dataRow.alignment = { horizontal: 'center' };

            dataRow.getCell(8).value = { formula: `SUM(C${rowIndex}:G${rowIndex})`, result: row.total };
            dataRow.getCell(9).value = { formula: `H${rowIndex}/5`, result: parseFloat(row.average) };

            applyWinnerHighlight(dataRow, row.rank, 11);
        });

        // Add borders to all cells from Row 5 onwards
        sheet.eachRow((row, rowNum) => {
            if (rowNum >= 5) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });
    }

    // 2. Generate Consolidated Results Sheet
    const grandSheet = workbook.addWorksheet('Grand Results');

    // Add Event & Category Info at the Top
    grandSheet.getCell('A1').value = `GRAND LEADERBOARD`;
    grandSheet.getCell('A1').font = { name: 'Outfit', size: 14, bold: true };
    
    grandSheet.getCell('A2').value = `Event Name: ${eventName || 'N/A'}`;
    grandSheet.getCell('A2').font = { name: 'Outfit', size: 11, bold: true };
    
    grandSheet.getCell('A3').value = `Category: ${categoryName || 'N/A'}`;
    grandSheet.getCell('A3').font = { name: 'Outfit', size: 11, bold: true };

    const grandHeaders = [
        'SI NO', 'CHEST NO', 
        'Judge 1 Total', 'Judge 2 Total', 'Judge 3 Total', 
        'Grand Total (150)', 'Average (50)', 'Rank', 'Points'
    ];
    const grandHeaderRow = grandSheet.getRow(5);
    grandHeaderRow.values = grandHeaders;
    grandHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    grandHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' } // Green for final leaderboard
    };
    grandHeaderRow.alignment = { horizontal: 'center' };

    const grandColWidths = [10, 15, 15, 15, 15, 20, 18, 10, 10];
    grandColWidths.forEach((w, idx) => {
        grandSheet.getColumn(idx + 1).width = w;
    });

    combinedResultsData.forEach((row, index) => {
        const rowIndex = index + 6;
        const dataRow = grandSheet.getRow(rowIndex);
        dataRow.values = [
            row.sino,
            row.chestNo,
            row.t1,
            row.t2,
            row.t3,
            '', // Grand Total
            '', // Average
            row.rank,
            row.points
        ];
        dataRow.alignment = { horizontal: 'center' };

        dataRow.getCell(6).value = { formula: `SUM(C${rowIndex}:E${rowIndex})`, result: row.grandTotal };
        dataRow.getCell(7).value = { formula: `F${rowIndex}/3`, result: parseFloat(row.average) };

        applyWinnerHighlight(dataRow, row.rank, 9);
    });

    // Add borders to all cells from Row 5 onwards
    grandSheet.eachRow((row, rowNum) => {
        if (rowNum >= 5) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Grand_Finale_Combined_Results.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};
