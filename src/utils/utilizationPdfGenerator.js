import autoTable from 'jspdf-autotable';
import {jsPDF} from "jspdf";
import RobotoRegular from '../fonts/Roboto-normal.js';
import logoImage from '../assets/logo_black.png';
import {SUB_CATEGORIES, SUB_SUB_CATEGORIES, SUB_CATEGORIES_EQ} from './categories_map.js';

// Helper function to format date to dd-mm-yyyy
const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    try {
        // Check if it's already in dd-mm-yyyy or dd.mm.yyyy format
        if (/^\d{2}[-\.]\d{2}[-\.]\d{4}$/.test(dateString)) {
            return dateString.replace(/\./g, '-');
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

export const generateUtilizationPDF = (data) => {
    // Create PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    const currentDate = new Date().toLocaleDateString('pl-PL');

    // Add the custom font
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
    doc.setFont("Roboto", "normal");
    doc.text("POLITECHNIKA MORSKA W SZCZECINIE", doc.internal.pageSize.width / 2, 15, {align: 'center'});
    doc.setFontSize(13);
    doc.text("NAWIGATOR XXI", doc.internal.pageSize.width / 2, 20, {align: 'center'});
    doc.setFontSize(12);
    doc.text(`Utylizacja`, doc.internal.pageSize.width / 2, 30, {align: 'center'});
    doc.setFontSize(10);
    doc.text(`Data: `, doc.internal.pageSize.width / 2, 35, {align: 'center'});

    let startY = 45;

    // Add notes if they exist
    if (data.uwagi && data.uwagi.trim()) {
        doc.setFontSize(10);
        doc.text('Uwagi:', 10, startY + 5);
        doc.setFontSize(9);

        const splitText = doc.splitTextToSize(data.uwagi, doc.internal.pageSize.width - 20);
        doc.text(splitText, 10, startY + 10);

        startY += 10 + (splitText.length * 5);
    }

    // Medicines table
    if (data.medicines && data.medicines.length > 0) {
        doc.setFontSize(11);
        doc.text('Leki:', 10, startY + 5);

        const medicinesColumns = ["Lp.", "Nazwa leku", "Ilość", "Opakowanie", "Data ważności"];

        const medicinesRows = data.medicines.map(item => {
            // Format category IDs in the same way as in orderPdfGenerator
            const categoryId = item.id_kategorii || '';
            const subCategoryId = item.id_pod_kategorii ? SUB_CATEGORIES[item.id_pod_kategorii] || item.id_pod_kategorii : '0';
            const subSubCategoryId = item.id_pod_pod_kategorii ? SUB_SUB_CATEGORIES[item.id_pod_pod_kategorii] || item.id_pod_pod_kategorii : '0';

            const categoryString = `${categoryId}.${subCategoryId}${subSubCategoryId}`;

            return [
                categoryString,
                item.nazwa_leku || '',
                item.ilosc || '',
                item.opakowanie || '',
                formatDateToDDMMYYYY(item.data_waznosci) || '',
            ];
        });

        // Generate the medicines table
        autoTable(doc, {
            head: [medicinesColumns],
            body: medicinesRows,
            startY: startY + 10,
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                font: "Roboto",
                fontStyle: 'normal'
            },
            styles: {
                font: "Roboto"
            },
            didParseCell: function (data) {
                if (data.cell.text) {
                    data.cell.text = data.cell.text.map(t => String(t));
                }
            }
        });

        // Update startY to position after the table
        startY = doc.lastAutoTable.finalY + 10;
    }

    // Equipment table
    if (data.equipment && data.equipment.length > 0) {
        doc.setFontSize(11);
        doc.text('Sprzęt:', 10, startY + 5);

        const equipmentColumns = ["Lp.", "Nazwa sprzętu", "Ilość", "Data ważności"];

        const equipmentRows = data.equipment.map(item => {
            // Format category IDs for equipment in the same way as in orderPdfGenerator
            const categoryId = item.id_kategorii ? ((Number(item.id_kategorii) || 0) + 9) : '';
            const subCategoryId = item.id_pod_kategorii ? SUB_CATEGORIES_EQ[item.id_pod_kategorii] || item.id_pod_kategorii : '0';

            const categoryString = `${categoryId}.${subCategoryId}`;

            return [
                categoryString,
                item.nazwa_sprzetu || '',
                item.ilosc || '',
                formatDateToDDMMYYYY(item.data_waznosci) || '',
            ];
        });

        // Generate the equipment table
        autoTable(doc, {
            head: [equipmentColumns],
            body: equipmentRows,
            startY: startY + 10,
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                font: "Roboto",
                fontStyle: 'normal'
            },
            styles: {
                font: "Roboto"
            },
            didParseCell: function (data) {
                if (data.cell.text) {
                    data.cell.text = data.cell.text.map(t => String(t));
                }
            }
        });
    }

    // Add signature fields
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 20;

    doc.line(20, finalY + 20, 80, finalY + 20);
    doc.line(doc.internal.pageSize.width - 80, finalY + 20, doc.internal.pageSize.width - 20, finalY + 20);

    doc.setFontSize(10);
    doc.text("Podpis osoby przygotowującej", 50, finalY + 25, {align: 'center'});
    doc.text("Podpis osoby zatwierdzającej", doc.internal.pageSize.width - 50, finalY + 25, {align: 'center'});

    // Save the PDF
    const formattedDate = currentDate.replace(/\./g, '-');
    const fileName = `Utylizacja_${data.nazwa ? data.nazwa.replace(/\s+/g, '_') + '_' : ''}${formattedDate}.pdf`;
    doc.save(fileName);};
