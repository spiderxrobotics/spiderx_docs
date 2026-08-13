import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Waits for all <img> elements inside a root to finish loading,
 * and for web fonts to be ready. Prevents blank/half-rendered captures.
 */
async function waitForAssets(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
    )
  );

  if ('fonts' in document) {
    try {
      await (document as any).fonts.ready;
    } catch {
      /* ignore font-loading API failures */
    }
  }
}

/** Waits two animation frames so the browser fully reflows/repaints
 * after a style change before we measure/capture anything. */
function waitForReflow(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Renders and exports the letterhead canvas A4 pages directly to a PDF file.
 * Uses html2canvas-pro + jsPDF for pixel-perfect 1:1 A4 canvas screenshots matching screen preview.
 * Falls back to browser print dialog if canvas generation fails.
 */
export async function exportLetterheadToPdf(filename: string = 'SpiderX_Letterhead_Document.pdf') {
  const pageElements = document.querySelectorAll<HTMLElement>('.a4-container');
  if (!pageElements || pageElements.length === 0) {
    window.print();
    return;
  }

  // Temporarily reset canvas scale zoom to 100% so capture dimensions are exact 1:1 A4 (210mm x 297mm)
  const zoomWrapper = document.querySelector<HTMLElement>('.a4-zoom-wrapper');
  const previousTransform = zoomWrapper?.style.transform ?? '';
  const previousTransition = zoomWrapper?.style.transition ?? '';

  if (zoomWrapper) {
    zoomWrapper.style.transition = 'none';
    zoomWrapper.style.transform = 'none';
  }

  // Hide UI overlay controls & ruler guides
  const nonPrintables = document.querySelectorAll<HTMLElement>('.no-print');
  nonPrintables.forEach((el) => {
    el.style.display = 'none';
  });

  try {
    await waitForReflow();
    await Promise.all(Array.from(pageElements).map((el) => waitForAssets(el)));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 300 DPI high-resolution capture
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: 1600,
        width: pageEl.offsetWidth,
        height: pageEl.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedPages = clonedDoc.querySelectorAll<HTMLElement>('.a4-container');
          clonedPages.forEach((clonedPage) => {
            clonedPage.style.transform = 'none';
            clonedPage.style.boxShadow = 'none';
            clonedPage.style.border = 'none';
            clonedPage.style.margin = '0';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(`html2canvas produced an empty canvas for page ${i + 1}`);
      }

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (err) {
    console.error('Error generating direct PDF via html2canvas/jsPDF, falling back to browser print:', err);
    window.print();
  } finally {
    if (zoomWrapper) {
      zoomWrapper.style.transform = previousTransform;
      zoomWrapper.style.transition = previousTransition;
    }

    nonPrintables.forEach((el) => {
      el.style.display = '';
    });
  }
}