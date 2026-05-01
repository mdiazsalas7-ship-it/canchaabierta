import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Prospect } from '../types';

// =========================================================
// LIB — Generación de PDF
// =========================================================

export const exportProspectToPDF = async (prospect: Prospect): Promise<void> => {
  // Espera a que las imágenes carguen en el componente printable
  await new Promise((r) => setTimeout(r, 800));

  const element = document.getElementById('printable-area');
  if (!element) throw new Error('Área de impresión no encontrada');

  // Captura como canvas en alta resolución
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pdfWidth = 210;
  const pdfHeight = 297;
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Páginas adicionales si el contenido excede A4
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  const today = new Date().toISOString().slice(0, 10);
  const safeName = (prospect.name || 'prospecto').replace(/\s+/g, '-');
  const fileName = `ScoutBall-${safeName}-${today}.pdf`;
  pdf.save(fileName);
};