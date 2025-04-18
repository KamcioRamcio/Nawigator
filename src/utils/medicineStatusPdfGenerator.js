import autoTable from 'jspdf-autotable';
import {jsPDF} from "jspdf";
import RobotoRegular from '../fonts/Roboto-normal.js';
import logoImage from '../assets/logo_black.png';

export const generateMedicineStatusPDF = (data, selectedDate) => {
    // Create PDF document
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    const currentDate = new Date().toLocaleDateString('pl-PL');
    const reportDate = selectedDate ? new Date(selectedDate).toLocaleDateString('pl-PL') : currentDate;

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
    doc.text(`Stan lekow na dzien: ${reportDate}`, doc.internal.pageSize.width / 2, 30, {align: 'center'});

    // Define table columns
    const tableColumn = ["Nazwa leku", "Data ważności", "Obecny status", "Nowy status", "Ilość minimalna", "Ilość na statku"];

    // Process data
    const tableRows = data.map(item => [
        item.nazwa_leku,
        item.data_waznosci,
        item.current_status,
        item.projected_status,
        item.ilosc_minimalna,
        item.stan_magazynowy_ilosc
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
        }
    });

    // Save the PDF
    doc.save(`Status_lekow_${reportDate.replace(/\./g, '-')}.pdf`);
};