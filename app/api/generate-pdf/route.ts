import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const { htmlContent, styleTags, title } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'Missing htmlContent in request body' }, { status: 400 });
    }

    // Determine request origin base URL for relative image assets (e.g. /letter_head.png)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Full HTML wrapper with Google Fonts, page styles, Tailwind CSS, and base tag
    const fullPageHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <base href="${baseUrl}/">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title || 'SpiderX Document'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet">
          ${styleTags || ''}
          <style>
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .a4-container {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              position: relative !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
              background-color: #ffffff !important;
              box-sizing: border-box !important;
            }
            .a4-container:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(fullPageHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(title || 'SpiderX_Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Puppeteer PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF via server-side Puppeteer', details: error.message },
      { status: 500 }
    );
  }
}
