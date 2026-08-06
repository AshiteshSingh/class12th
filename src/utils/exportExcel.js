import ExcelJS from 'exceljs';
import { ZONAL_PARTICIPANTS } from './participants';

const EXCEL_HIGHLIGHTS = {
    1: { fill: 'FFFFD700', font: 'FF000000' }, // Gold (Yellow)
    2: { fill: 'FF93C5FD', font: 'FF000000' }, // Blue (Light blue)
    3: { fill: 'FFFCA5A5', font: 'FF000000' }  // Red (Light red/pink)
};

function applyWinnerHighlight(excelRow, rank, maxCols = 11) {
    if (EXCEL_HIGHLIGHTS[rank]) {
        for (let col = 1; col <= maxCols; col++) {
            const cell = excelRow.getCell(col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: EXCEL_HIGHLIGHTS[rank].fill }
            };
            cell.font = { 
                bold: true, 
                color: { argb: EXCEL_HIGHLIGHTS[rank].font } 
            };
        }
    }
}

// Helper to infer Category if not explicitly provided
function resolveEventAndCategory(eventName, categoryName, rowsData = [], isZonal = false) {
    let finalEventName = eventName && eventName.trim() ? eventName.trim() : (isZonal ? 'ASISC Zonal Competition' : 'Grand Finale Competition');
    let finalCategoryName = categoryName && categoryName.trim() ? categoryName.trim() : '';

    if (!finalCategoryName && isZonal && Array.isArray(rowsData)) {
        // Try to infer category from participant names
        const names = rowsData.map(r => r.participantName || r.name || '').filter(Boolean);
        const subJuniorNames = ZONAL_PARTICIPANTS['Sub-Junior Category'] || [];
        const juniorNames = ZONAL_PARTICIPANTS['Junior Category'] || [];
        const seniorNames = ZONAL_PARTICIPANTS['Senior Category'] || [];

        let subJrCount = 0, jrCount = 0, srCount = 0;
        names.forEach(n => {
            if (subJuniorNames.includes(n)) subJrCount++;
            if (juniorNames.includes(n)) jrCount++;
            if (seniorNames.includes(n)) srCount++;
        });

        if (subJrCount > 0 && subJrCount >= jrCount && subJrCount >= srCount) {
            finalCategoryName = 'Sub-Junior';
        } else if (jrCount > 0 && jrCount >= srCount) {
            finalCategoryName = 'Junior';
        } else if (srCount > 0) {
            finalCategoryName = 'Senior';
        }
    }

    if (!finalCategoryName) {
        finalCategoryName = isZonal ? 'Zonal Category' : 'General Category';
    }

    return { finalEventName, finalCategoryName };
}

export const exportCombinedReport = async (judgesData, combinedResultsData, eventName, categoryName, isZonal = false) => {
    const workbook = new ExcelJS.Workbook();
    const systemTitle = isZonal ? 'ASISC ZONAL JUDGING SYSTEM' : 'GRAND FINALE JUDGING SYSTEM';

    const { finalEventName, finalCategoryName } = resolveEventAndCategory(eventName, categoryName, combinedResultsData, isZonal);

    // 1. Generate Judge Sheets
    for (let j = 1; j <= 3; j++) {
        const sheet = workbook.addWorksheet(`Judge ${j}`);

        sheet.getCell('A1').value = `${systemTitle} - JUDGE ${j}`;
        sheet.getCell('A1').font = { name: 'Outfit', size: 14, bold: true };
        
        sheet.getCell('A2').value = `Event Name: ${finalEventName}`;
        sheet.getCell('A2').font = { name: 'Outfit', size: 11, bold: true };
        
        sheet.getCell('A3').value = `Category: ${finalCategoryName}`;
        sheet.getCell('A3').font = { name: 'Outfit', size: 11, bold: true };

        const headers = isZonal
            ? ['SI NO', 'PARTICIPANT NAME', 'CHEST NO', 'Pronunciation Clarity (10)', 'Voice Modulation (10)', 'Confidence (10)', 'Overall Impact (10)', 'Effectiveness (10)', 'Total (50)', 'Average (10)', 'Rank', 'Points']
            : ['SI NO', 'CHEST NO', 'Pronunciation Clarity (10)', 'Voice Modulation (10)', 'Confidence (10)', 'Overall Impact (10)', 'Effectiveness (10)', 'Total (50)', 'Average (10)', 'Rank', 'Points'];

        const headerRow = sheet.getRow(5);
        headerRow.values = headers;
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
        };
        headerRow.alignment = { horizontal: 'center' };

        const colWidths = isZonal
            ? [10, 25, 15, 25, 25, 20, 25, 20, 15, 15, 10, 10]
            : [10, 15, 25, 25, 20, 25, 20, 15, 15, 10, 10];
        
        colWidths.forEach((w, idx) => {
            sheet.getColumn(idx + 1).width = w;
        });

        judgesData[j].forEach((row, index) => {
            const rowIndex = index + 6;
            const dataRow = sheet.getRow(rowIndex);
            
            if (isZonal) {
                dataRow.values = [
                    row.sino,
                    row.participantName || '',
                    row.chestNo,
                    row.s1, row.s2, row.s3, row.s4, row.s5,
                    '', '',
                    row.rank,
                    row.points
                ];
                dataRow.getCell(9).value = { formula: `SUM(D${rowIndex}:H${rowIndex})`, result: row.total };
                dataRow.getCell(10).value = { formula: `I${rowIndex}/5`, result: parseFloat(row.average) };
            } else {
                dataRow.values = [
                    row.sino,
                    row.chestNo,
                    row.s1, row.s2, row.s3, row.s4, row.s5,
                    '', '',
                    row.rank,
                    row.points
                ];
                dataRow.getCell(8).value = { formula: `SUM(C${rowIndex}:G${rowIndex})`, result: row.total };
                dataRow.getCell(9).value = { formula: `H${rowIndex}/5`, result: parseFloat(row.average) };
            }
            
            dataRow.alignment = { horizontal: 'center' };
            applyWinnerHighlight(dataRow, row.rank, headers.length);
        });

        sheet.eachRow((row, rowNum) => {
            if (rowNum >= 5) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };
                });
            }
        });
    }

    // 2. Generate Consolidated Results Sheet
    const grandSheet = workbook.addWorksheet('Grand Results');

    grandSheet.getCell('A1').value = `${systemTitle} - GRAND LEADERBOARD`;
    grandSheet.getCell('A1').font = { name: 'Outfit', size: 14, bold: true };
    
    grandSheet.getCell('A2').value = `Event Name: ${finalEventName}`;
    grandSheet.getCell('A2').font = { name: 'Outfit', size: 11, bold: true };
    
    grandSheet.getCell('A3').value = `Category: ${finalCategoryName}`;
    grandSheet.getCell('A3').font = { name: 'Outfit', size: 11, bold: true };

    const grandHeaders = isZonal
        ? ['SI NO', 'PARTICIPANT NAME', 'CHEST NO', 'Judge 1 Total', 'Judge 2 Total', 'Judge 3 Total', 'Grand Total (150)', 'Average (50)', 'Rank', 'Points']
        : ['SI NO', 'CHEST NO', 'Judge 1 Total', 'Judge 2 Total', 'Judge 3 Total', 'Grand Total (150)', 'Average (50)', 'Rank', 'Points'];

    const grandHeaderRow = grandSheet.getRow(5);
    grandHeaderRow.values = grandHeaders;
    grandHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    grandHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' }
    };
    grandHeaderRow.alignment = { horizontal: 'center' };

    const grandColWidths = isZonal
        ? [10, 25, 15, 15, 15, 15, 20, 18, 10, 10]
        : [10, 15, 15, 15, 15, 20, 18, 10, 10];
    
    grandColWidths.forEach((w, idx) => {
        grandSheet.getColumn(idx + 1).width = w;
    });

    combinedResultsData.forEach((row, index) => {
        const rowIndex = index + 6;
        const dataRow = grandSheet.getRow(rowIndex);

        if (isZonal) {
            dataRow.values = [
                row.sino,
                row.participantName || '',
                row.chestNo,
                row.t1, row.t2, row.t3,
                '', '',
                row.rank,
                row.points
            ];
            dataRow.getCell(7).value = { formula: `SUM(D${rowIndex}:F${rowIndex})`, result: row.grandTotal };
            dataRow.getCell(8).value = { formula: `G${rowIndex}/3`, result: parseFloat(row.average) };
        } else {
            dataRow.values = [
                row.sino,
                row.chestNo,
                row.t1, row.t2, row.t3,
                '', '',
                row.rank,
                row.points
            ];
            dataRow.getCell(6).value = { formula: `SUM(C${rowIndex}:E${rowIndex})`, result: row.grandTotal };
            dataRow.getCell(7).value = { formula: `F${rowIndex}/3`, result: parseFloat(row.average) };
        }

        dataRow.alignment = { horizontal: 'center' };
        applyWinnerHighlight(dataRow, row.rank, grandHeaders.length);
    });

    grandSheet.eachRow((row, rowNum) => {
        if (rowNum >= 5) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
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
        const sanitizedEvent = finalEventName.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = isZonal ? `Zonal_Combined_Results_${sanitizedEvent}.xlsx` : `Grand_Finale_Combined_Results_${sanitizedEvent}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};

export const exportCombinedSheet = async (combinedResultsData, eventName, categoryName, isZonal = false) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Combined');

    const { finalEventName, finalCategoryName } = resolveEventAndCategory(eventName, categoryName, combinedResultsData, isZonal);

    sheet.getCell('A1').value = isZonal ? 'ASISC ZONAL COMBINED RESULTS' : 'COMBINED RESULTS';
    sheet.getCell('A1').font = { name: 'Outfit', size: 14, bold: true };

    sheet.getCell('A2').value = `Event Name: ${finalEventName}`;
    sheet.getCell('A2').font = { name: 'Outfit', size: 11, bold: true };

    sheet.getCell('A3').value = `Category: ${finalCategoryName}`;
    sheet.getCell('A3').font = { name: 'Outfit', size: 11, bold: true };

    const headers = isZonal
        ? ['SL No', 'Participant Name', 'CH No', 'Judge 1 (50)', 'Judge 2 (50)', 'Judge 3 (50)', 'Total (150)', 'Result']
        : ['SL No', 'CH No', 'Judge 1 (50)', 'Judge 2 (50)', 'Judge 3 (50)', 'Total (150)', 'Result'];

    const headerRow = sheet.getRow(5);
    headerRow.values = headers;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' }
    };
    headerRow.alignment = { horizontal: 'center' };

    const colWidths = isZonal
        ? [10, 25, 15, 18, 18, 18, 18, 12]
        : [10, 15, 18, 18, 18, 18, 12];
    
    colWidths.forEach((w, idx) => {
        sheet.getColumn(idx + 1).width = w;
    });

    const ordinalSuffix = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    };

    combinedResultsData.forEach((row, index) => {
        const rowIndex = index + 6;
        const dataRow = sheet.getRow(rowIndex);

        const judge1 = row.j1 !== undefined ? (parseFloat(row.j1) || 0) : row.t1;
        const judge2 = row.j2 !== undefined ? (parseFloat(row.j2) || 0) : row.t2;
        const judge3 = row.j3 !== undefined ? (parseFloat(row.j3) || 0) : row.t3;
        const grandTotal = judge1 + judge2 + judge3;

        if (isZonal) {
            dataRow.values = [
                row.sino,
                row.participantName || '',
                row.chestNo,
                judge1, judge2, judge3,
                '',
                row.rank ? `${row.rank}${ordinalSuffix(row.rank)}` : ''
            ];
            dataRow.getCell(7).value = {
                formula: `SUM(D${rowIndex}:F${rowIndex})`,
                result: grandTotal
            };
        } else {
            dataRow.values = [
                row.sino,
                row.chestNo,
                judge1, judge2, judge3,
                '',
                row.rank ? `${row.rank}${ordinalSuffix(row.rank)}` : ''
            ];
            dataRow.getCell(6).value = {
                formula: `SUM(C${rowIndex}:E${rowIndex})`,
                result: grandTotal
            };
        }

        dataRow.alignment = { horizontal: 'center' };
        applyWinnerHighlight(dataRow, row.rank, headers.length);
    });

    sheet.eachRow((row, rowNum) => {
        if (rowNum >= 5) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
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
        const sanitizedEvent = finalEventName.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = isZonal ? `Zonal_Combined_${sanitizedEvent}.xlsx` : `Combined_Results_${sanitizedEvent}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};
