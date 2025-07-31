import autoTable from 'jspdf-autotable';
import {jsPDF} from "jspdf";
import RobotoRegular from '../fonts/Roboto-normal.js';
import logoImage from '../assets/logo_black.png';
import {SUB_CATEGORIES, SUB_SUB_CATEGORIES, SUB_CATEGORIES_EQ} from './categories_map.js';
import {useEffect} from "react";

export const generateEqPDF = (data, selectedDate) => {
    try {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        const currentDate = new Date().toLocaleDateString('pl-PL');

        doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");
        doc.setLanguage("pl");

        const imgWidth = 30;
        const imgHeight = 30;
        const imgX = 10;
        doc.addImage(logoImage, 'PNG', imgX, 5, imgWidth, imgHeight);

        // Add title and date
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("POLITECHNIKA MORSKA W SZCZECINIE", doc.internal.pageSize.width / 2, 15, {align: 'center'});
        doc.setFontSize(13);
        doc.text("MV NAWIGATOR XXI", doc.internal.pageSize.width / 2, 20, {align: 'center'});
        doc.setFontSize(10);
        doc.text(`Stan Sprzetu na dzien: ${selectedDate || currentDate}`, doc.internal.pageSize.width / 2, 30, {align: 'center'});


        const tableColumn = ["Lp.", "Nazwa", "Data waznosci", "Ilosc Akt.", "Termin"];

        const eqArray = Array.isArray(data) ? data : [data];

        const tableRows = eqArray.map((item, index) => {
            const mappedSubCategory = SUB_CATEGORIES_EQ[item.id_pod_kategorii] || item.id_pod_kategorii;
            return [
                (item.id_kategorii || '') + '.' + (mappedSubCategory || '0'),
                item.nazwa ?? '',
                item.data_waznosci ?? '',
                item.ilosc ?? '',
                item.termin ?? '',
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                font: "Roboto",
                fontStyle: "bold",
                halign: 'center',
                valign: 'middle'
            },
            styles: {
                font: "Roboto",
                fontStyle: "normal",
                overflow: 'linebreak',
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: {halign: 'center', cellWidth: 10},  // Lp.
                1: {halign: 'center', cellWidth: 100},   // Nazwa
                2: {halign: 'center', cellWidth: 50},  // Data ważności
                3: {halign: 'center', cellWidth: 50},  // Ilość Akt.
                4: {halign: 'center', cellWidth: 50},  // Termin
            },
            didParseCell: function (data) {
                if (data.cell.text) {
                    data.cell.text = data.cell.text.map(t => String(t || ''));
                }
            },
            willDrawCell: function (data) {
                // Make sure text always renders horizontally
                if (data.cell.styles.angle) {
                    data.cell.styles.angle = 0;
                }
            },
            didDrawPage: function (data) {
                // Add page number at the bottom
                doc.setFontSize(10);
                doc.text(`Strona ${data.pageNumber}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
            }
        });

        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;

        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.text("Kierownik Sekcji Eksploatacji Statku", 20, finalY + 20);
        doc.line(20, finalY + 10, 80, finalY + 10);

        const safeDate = selectedDate ? selectedDate.replace(/\./g, '-') : currentDate.replace(/\./g, '-');
        doc.save(`Zestawienie_${safeDate}.pdf`);
        console.log('PDF generated successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}