// src/utils/orderPdfGenerator.js
import autoTable from 'jspdf-autotable';
import { jsPDF } from "jspdf";
import RobotoRegular from '../fonts/Roboto-normal.js';
import logoImage from '../assets/logo_black.png';
import {SUB_CATEGORIES, SUB_SUB_CATEGORIES, SUB_CATEGORIES_EQ} from './categories_map.js';
export const generateOrderPDF = (orderData) => {
    // Initialize PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    const currentDate = new Date().toLocaleDateString('pl-PL');

    // Setup fonts
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto", "normal"); // Ustaw domyślnie na normal

    // Add logo
    doc.addImage(logoImage, 'PNG', 10, 5, 30, 30);

    // Header section
    doc.setFontSize(14);
    doc.setFont("Roboto", "bold");
    doc.text("POLITECHNIKA MORSKA W SZCZECINIE", doc.internal.pageSize.width / 2, 15, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont("Roboto", "normal");
    doc.text("NAWIGATOR XXI", doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Date and introduction text
    doc.setFontSize(10);
    doc.text(`Data:             `, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    doc.text('Proszę o zamówienie na Statek niżej wymienionych leków oraz środków medycznych.', 15, 50);
    doc.text('Jak najdłuższa data ważności.', 15, 55);

    // Medicines table
    if (orderData.medicines && orderData.medicines.length > 0) {
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.text("Leki:", 15, 65);
        doc.setFont("Roboto", "normal");

        const medicinesColumns = ["Lp.", "Nazwa", "Ilosc", "Opakowanie"];
        const medicinesRows = orderData.medicines.map(item => {
            const mappedSubCategory = SUB_CATEGORIES[item.id_pod_kategorii] || item.id_pod_kategorii;
            const mappedSubSubCategory = SUB_SUB_CATEGORIES[item.id_pod_pod_kategorii] || item.id_pod_pod_kategorii;

            return [
                (item.id_kategorii || '') + '.' + (mappedSubCategory || '0') + (mappedSubSubCategory || '0'),
                item.nazwa_leku || '',
                item.ilosc || '',
                item.opakowanie || '',
            ];
        });

        autoTable(doc, {
            head: [medicinesColumns],
            body: medicinesRows,
            startY: 70,
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                font: "Roboto",
                fontStyle: "bold"
            },
            styles: {
                font: "Roboto",
                fontStyle: "normal"
            },
            didParseCell: function (data) {
                if (data.cell.text) {
                    data.cell.text = data.cell.text.map(t => String(t));
                }
            }
        });
    }

    // Equipment table
    if (orderData.equipment && orderData.equipment.length > 0) {
        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 55;

        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.text("Sprzet:", 15, startY - 5);
        doc.setFont("Roboto", "normal");

        const equipmentColumns = ["Nazwa", "Ilosc"];
        const equipmentRows = orderData.equipment.map(item => {
            const mappedSubCategory = SUB_CATEGORIES_EQ[item.id_pod_kategorii] || item.id_pod_kategorii;

            return [
                ((Number(item.id_kategorii) || 0) + 9) + '.' + (mappedSubCategory || '0'),
                item.nazwa_sprzetu || '',
                item.ilosc || '',
            ];
        });

        autoTable(doc, {
            head: [equipmentColumns],
            body: equipmentRows,
            startY: startY,
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                font: "Roboto",
                fontStyle: "bold"
            },
            styles: {
                font: "Roboto",
                fontStyle: "normal"
            },
            didParseCell: function (data) {
                if (data.cell.text) {
                    data.cell.text = data.cell.text.map(t => String(t));
                }
            }
        });
    }

    // Footer section
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 120;

    doc.setFontSize(10);
    doc.setFont("Roboto", "normal"); // Upewnij się, że jest normal
    doc.text("Kierownik Sekcji Eksploatacji Statku", 20, finalY + 30);
    doc.line(20, finalY + 20, 80, finalY + 20);

    // Generate and save PDF
    const safeName = orderData.nazwa.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = currentDate.replace(/\./g, '-');
    doc.save(`Zamowienie_${safeName}_${safeDate}.pdf`);
};
