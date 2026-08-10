// NOTE: using html2canvas-pro instead of html2canvas.
// Stock html2canvas cannot parse modern CSS color functions
// (lab(), oklch(), lch(), color-mix()) which Tailwind v4 / shadcn
// theme variables use by default — it throws "Attempting to parse
// an unsupported color function" and aborts the whole capture.
// html2canvas-pro is a drop-in fork that adds support for these.
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
 * Directly renders and exports the letterhead canvas A4 pages to a PDF file.
 * Preserves high resolution letterhead background images, seals, signatures, and typography.
 */
export async function exportLetterheadToPdf(filename: string = 'SpiderX_Letterhead_Document.pdf') {
  const pageElements = document.querySelectorAll<HTMLElement>('.a4-container');
  if (!pageElements || pageElements.length === 0) {
    window.print();
    return;
  }

  // The "Editor Canvas Zoom" control applies transform: scale(zoomScale) to
  // this wrapper. html2canvas computes its capture region from the LIVE,
  // on-screen bounding box of the target element, so if the page is zoomed
  // to (say) 90%, html2canvas crops a 90%-sized region — and any attempt to
  // "undo" the transform only inside the hidden clone makes the clone's
  // content size mismatch that crop region, producing a blank capture with
  // no error. The reliable fix is to neutralize the zoom on the REAL page
  // before capturing (so original and clone always agree), then restore it.
  const zoomWrapper = document.querySelector<HTMLElement>('.a4-zoom-wrapper');
  const previousTransform = zoomWrapper?.style.transform ?? '';
  const previousTransition = zoomWrapper?.style.transition ?? '';

  if (zoomWrapper) {
    // Disable the CSS transition too, so the reset is instant rather than
    // animating — we don't want to capture mid-animation.
    zoomWrapper.style.transition = 'none';
    zoomWrapper.style.transform = 'none';
  }

  // Temporarily hide elements with .no-print class (e.g. margin alignment guides) during capture
  const nonPrintables = document.querySelectorAll<HTMLElement>('.no-print');
  nonPrintables.forEach((el) => {
    el.style.display = 'none';
  });

  try {
    // Let the browser actually reflow at 100% zoom before we measure/capture.
    await waitForReflow();

    // Make sure every letterhead image / logo / signature image and web font
    // has actually finished loading before we screenshot anything.
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
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        width: pageEl.offsetWidth,
        height: pageEl.offsetHeight,
        onclone: (clonedDoc) => {
          // Zoom is already neutral on the live page, so we just tidy up
          // cosmetic UI chrome that shouldn't appear in the exported PDF.
          const clonedPage = clonedDoc.querySelectorAll<HTMLElement>('.a4-container')[i];
          if (clonedPage) {
            clonedPage.style.boxShadow = 'none';
            clonedPage.style.border = 'none';
            clonedPage.style.margin = '0';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Guard: if html2canvas produced an essentially blank canvas, fail
      // loudly instead of silently shipping an empty PDF page.
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(`html2canvas produced an empty canvas for page ${i + 1}`);
      }

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Exact A4 dimensions: 210mm x 297mm
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename);
  } catch (err) {
    console.error('Error generating direct PDF via html2canvas/jsPDF, falling back to browser print:', err);
    window.print();
  } finally {
    // Restore the user's zoom level exactly as it was.
    if (zoomWrapper) {
      zoomWrapper.style.transform = previousTransform;
      zoomWrapper.style.transition = previousTransition;
    }

    // Restore display styles for non-printable UI elements
    nonPrintables.forEach((el) => {
      el.style.display = '';
    });
  }
}