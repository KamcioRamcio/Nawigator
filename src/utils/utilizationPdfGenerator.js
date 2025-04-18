import autoTable from 'jspdf-autotable';
import {jsPDF} from "jspdf";
// Import the custom font
import RobotoRegular from '../fonts/Roboto-normal.js';
import logoImage from '../assets/logo_black.png';

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
    doc.setFont("Roboto", "bold");
    doc.text("POLITECHNIKA MORSKA W SZCZECINIE", doc.internal.pageSize.width / 2, 15, {align: 'center'});
    doc.setFontSize(13);
    doc.text("MV NAWIGATOR XXI", doc.internal.pageSize.width / 2, 20, {align: 'center'});
    doc.setFontSize(10);
    doc.text(`Utylizacja : ${currentDate}`, doc.internal.pageSize.width / 2, 30, {align: 'center'});

    // Define table data with only L group items


    const tableColumn = ["Nazwa", "Ilość", "Opakowanie", "Data ważności", "Ilość nominalna"];

    // Process data to handle Polish characters
    const tableRows = data
        .filter(item => item.grupa === 'L')
        .map(item => [
            item.nazwa,
            item.ilosc,
            item.opakowanie || '',
            item.data_waznosci || '',
            item.ilosc_nominalna || ''
        ]);

    // Generate the table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        headStyles: {
            fillColor: [51, 51, 51],
            textColor: 255,
            font: "Roboto",
            fontStyle: 'normal'
        },
        styles: {
            font: "Roboto"
        },
        didDrawCell: (data) => {
            // Custom processing for cells if needed
        }
    });

    // Save the PDF
    doc.save(`Utylizacja_${currentDate.replace(/\./g, '-')}.pdf`);
};
