/**
 * Utility to parse Markdown (.md) text into SpiderX Document Body Blocks
 * Auto-detects Headings, Lists (chunked for granular page flow), Tables (with Total row detection),
 * Subjects, Recipient Info, Signatures, and Recipient Acceptance metadata.
 */

export interface ParsedMarkdownResult {
  paragraphs: string[];
  subject?: string;
  mainHeading?: string;
  docHeaderAddress?: string;
  refNumber?: string;
  date?: string;
  recipient?: {
    name?: string;
    addressLine1?: string;
    cityStateZip?: string;
    email?: string;
  };
  recipientAcceptance?: {
    enabled: boolean;
    title?: string;
    text?: string;
  };
}

export interface DistributedPagesResult {
  page1Paragraphs: string[];
  additionalPages: { id: string; pageNumber: number; paragraphs: string[] }[];
}

export function parseMarkdownToDocumentBlocks(mdText: string): ParsedMarkdownResult {
  if (!mdText) return { paragraphs: [] };

  const lines = mdText.split(/\r?\n/);
  const blocks: string[] = [];
  let currentListItems: string[] = [];
  let currentListType: 'ol' | 'ul' | null = null;
  let currentTableRows: string[][] = [];
  let currentParagraphLines: string[] = [];

  let extractedSubject: string | undefined = undefined;
  let extractedRefNumber: string | undefined = undefined;
  let extractedDate: string | undefined = undefined;
  let extractedRecipient: ParsedMarkdownResult['recipient'] = undefined;
  let extractedRecipientAcceptance: ParsedMarkdownResult['recipientAcceptance'] = undefined;

  let inRecipientSection = false;

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join(' ').trim();
      if (text) {
        // Filter out raw Markdown signature line residue / standalone Sincerely / company headers
        if (
          !/^\\[\s_]*/.test(text) &&
          !/^_{3,}$/.test(text) &&
          !/^sincerely\s*,?$/i.test(text) &&
          !/^hr\s*&\s*talent/i.test(text) &&
          !/^(regd\.?\s*office|company\s*address|corporate\s*office)/i.test(text) &&
          !/^spiderx\s+robotics\s+private\s+limited$/i.test(text)
        ) {
          // Check for Subject line pattern (e.g. "Subject: OFFER OF EMPLOYMENT")
          if (/^subject\s*:\s*/i.test(text) && !extractedSubject) {
            extractedSubject = text.replace(/^subject\s*:\s*/i, '').trim();
          } else {
            blocks.push(text);
          }
        }
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      const tag = currentListType === 'ol' ? 'ol' : 'ul';
      const cls = currentListType === 'ol' ? 'decimal' : 'disc';

      // Chunk list items into small 2-item blocks for granular page splitting without large gaps
      const chunkSize = 2;
      for (let i = 0; i < currentListItems.length; i += chunkSize) {
        const chunk = currentListItems.slice(i, i + chunkSize);
        const itemsHtml = chunk.map((it) => `<li>${it}</li>`).join('');
        blocks.push(`<${tag} class="${cls}">${itemsHtml}</${tag}>`);
      }

      currentListItems = [];
      currentListType = null;
    }
  };

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headers = currentTableRows[0] || [];
      const dataRows = currentTableRows.slice(1).filter((r) => {
        // Filter out markdown table divider rows like |---|---|
        return !r.every((cell) => /^[\s:-]+$/.test(cell));
      });

      if (headers.length > 0) {
        // Auto-detect if last row is Total / Summary row
        const isTotalRow =
          dataRows.length > 1 &&
          dataRows[dataRows.length - 1].some((c) =>
            /total|summary|gross|net|amount due/i.test(c)
          );

        const thStyle = 'padding: 6px 10px; border: 1px solid #6b3587; background-color: #7f469b; color: #ffffff; font-weight: 700; text-align: left; font-size: 11px;';
        const tdStyle = 'padding: 5px 10px; border: 1px solid #e2e8f0; color: #334155; font-size: 11px;';
        const totalTdStyle = 'padding: 6px 10px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; background-color: rgba(127, 70, 155, 0.08); font-size: 11px;';

        const headHtml = `<thead style="background-color: #7f469b;"><tr style="background-color: #7f469b;">${headers.map((h) => `<th style="${thStyle}">${h || ''}</th>`).join('')}</tr></thead>`;
        let bodyHtml = '';
        let footHtml = '';

        if (isTotalRow && dataRows.length > 1) {
          const bodyR = dataRows.slice(0, -1);
          const totalR = dataRows[dataRows.length - 1];
          bodyHtml = `<tbody>${bodyR
            .map((r, rIdx) => `<tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">${r.map((c) => `<td style="${tdStyle}">${c || ''}</td>`).join('')}</tr>`)
            .join('')}</tbody>`;
          footHtml = `<tfoot><tr class="total-row" style="background-color: rgba(127, 70, 155, 0.08);">${totalR
            .map((c) => `<td style="${totalTdStyle}">${c || ''}</td>`)
            .join('')}</tr></tfoot>`;
        } else {
          bodyHtml = `<tbody>${dataRows
            .map((r, rIdx) => `<tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">${r.map((c) => `<td style="${tdStyle}">${c || ''}</td>`).join('')}</tr>`)
            .join('')}</tbody>`;
        }

        const tableStyle = 'width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;';
        blocks.push(`<table class="spiderx-table" style="${tableStyle}">${headHtml}${bodyHtml}${footHtml}</table>`);
      }
      currentTableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Blank line -> flush active buffer
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      if (inRecipientSection) inRecipientSection = false;
      continue;
    }

    // Ignore horizontal divider lines (--- or ***) so they don't break pages prematurely
    if (/^(---|[*]{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // Explicit page break divider (only <!-- pagebreak --> or \pagebreak)
    if (/^(<!--\s*pagebreak\s*-->|\\pagebreak)$/i.test(line)) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push('<!-- PAGE_BREAK -->');
      continue;
    }

    // Ignore raw Markdown signature line residue / underscores / company name header / regd office
    if (
      /^\\[\s_]*/.test(line) ||
      /^_{3,}$/.test(line) ||
      /^sincerely\s*,?$/i.test(line) ||
      /^(regd\.?\s*office|company\s*address|corporate\s*office)/i.test(line) ||
      /^spiderx\s+robotics\s+private\s+limited$/i.test(line) ||
      /^#\s+spiderx\s+robotics\s+private\s+limited$/i.test(line)
    ) {
      flushParagraph();
      continue;
    }

    // Date & Ref Number line (e.g. "Date: August 24, 2026 Ref No: SX-HRD-OFF-2026-089...")
    if (/date\s*:\s*/i.test(line) && /ref\s*(no|num|number)?\s*:\s*/i.test(line)) {
      flushParagraph();
      const dateM = line.match(/date\s*:\s*([^|RefStatus\n]+)/i);
      const refM = line.match(/ref\s*(no|num|number)?\s*:\s*([^|StatusDate\n]+)/i);
      if (dateM) extractedDate = dateM[1].trim();
      if (refM) extractedRefNumber = refM[2].trim();
      continue;
    } else if (/^date\s*:\s*/i.test(line) && !extractedDate) {
      flushParagraph();
      extractedDate = line.replace(/^date\s*:\s*/i, '').trim();
      continue;
    } else if (/^ref\s*(no|num|number)?\s*:\s*/i.test(line) && !extractedRefNumber) {
      flushParagraph();
      extractedRefNumber = line.replace(/^ref\s*(no|num|number)?\s*:\s*/i, '').trim();
      continue;
    }

    // Signatory / Corporate signature line (e.g. "For SpiderX Robotics Private Limited", "Authorized Signatory")
    if (/^for\s+spiderx/i.test(line) || /^authorized\s+signatory/i.test(line)) {
      flushParagraph();
      continue; // Handled by corporate signatory footer
    }

    // Candidate / Student / Employee Acceptance detection
    if (/^candidate\s+acceptance/i.test(line) || /^employee\s+acceptance/i.test(line) || /^student\s+acceptance/i.test(line)) {
      flushParagraph();
      extractedRecipientAcceptance = {
        enabled: true,
        title: line,
      };
      continue;
    }

    if (/^i\s+have\s+read,\s*understood/i.test(line)) {
      if (extractedRecipientAcceptance) {
        extractedRecipientAcceptance.text = line;
      }
      continue;
    }

    if (/^signature\s*:\s*/i.test(line) || /^date\s*:\s*_+/i.test(line)) {
      continue; // Ignore raw Markdown signature line underscoring
    }

    // TO: Recipient section start (e.g. "TO: Sivakumar Thirumurugan 64, Kamatchi...")
    if (/^to\s*:\s*/i.test(line)) {
      flushParagraph();
      inRecipientSection = true;
      const recipientText = line.replace(/^to\s*:\s*/i, '').trim();

      const emailMatch = recipientText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const cleanRecText = emailMatch ? recipientText.replace(emailMatch[0], '').trim() : recipientText;

      const parts = cleanRecText.split(',').map((p) => p.trim());
      extractedRecipient = {
        name: parts[0] || cleanRecText,
        addressLine1: parts.length > 2 ? parts.slice(1, -1).join(', ') : parts[1] || '',
        cityStateZip: parts.length > 1 ? parts[parts.length - 1] : '',
        email: emailMatch ? emailMatch[0] : '',
      };
      continue;
    }

    if (inRecipientSection) {
      if (line.startsWith('#') || /^subject\s*:\s*/i.test(line) || /^dear\s+/i.test(line)) {
        inRecipientSection = false;
      } else {
        if (extractedRecipient) {
          const em = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (em && !extractedRecipient.email) {
            extractedRecipient.email = em[0];
          } else if (!extractedRecipient.addressLine1) {
            extractedRecipient.addressLine1 = line;
          } else {
            extractedRecipient.cityStateZip = `${
              extractedRecipient.cityStateZip ? extractedRecipient.cityStateZip + ', ' : ''
            }${line}`;
          }
        }
        continue;
      }
    }

    // Subject line
    if (/^subject\s*:\s*/i.test(line) && !extractedSubject) {
      flushParagraph();
      extractedSubject = line.replace(/^subject\s*:\s*/i, '').trim();
      continue;
    }

    // Markdown Table row: starts and ends with |
    if (line.startsWith('|') && line.endsWith('|')) {
      flushParagraph();
      flushList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      currentTableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Markdown Headings
    if (line.startsWith('#')) {
      flushParagraph();
      flushList();
      if (line.startsWith('# ')) {
        const hText = line.slice(2).trim();
        blocks.push(`<h1>${hText}</h1>`);
      } else if (line.startsWith('## ')) {
        blocks.push(`<h2>${line.slice(3).trim()}</h2>`);
      } else if (line.startsWith('### ')) {
        blocks.push(`<h3>${line.slice(4).trim()}</h3>`);
      } else {
        blocks.push(`<h2>${line.replace(/^#+\s*/, '').trim()}</h2>`);
      }
      continue;
    }

    // Ordered list item (e.g. 1. Item)
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      flushParagraph();
      if (currentListType && currentListType !== 'ol') {
        flushList();
      }
      currentListType = 'ol';
      currentListItems.push(olMatch[2].trim());
      continue;
    }

    // Unordered list item (e.g. - Item, * Item, + Item)
    const ulMatch = line.match(/^[\*\-\+]\s+(.*)/);
    if (ulMatch) {
      flushParagraph();
      if (currentListType && currentListType !== 'ul') {
        flushList();
      }
      currentListType = 'ul';
      currentListItems.push(ulMatch[1].trim());
      continue;
    }

    // Normal paragraph text
    if (currentListType) {
      flushList();
    }
    currentParagraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();

  return {
    paragraphs: blocks,
    subject: extractedSubject,
    refNumber: extractedRefNumber,
    date: extractedDate,
    recipient: extractedRecipient,
    recipientAcceptance: extractedRecipientAcceptance,
  };
}

/**
 * Calculates visual height weight for document blocks
 * 1.0 weight unit = ~1 line of formatted text (~4.0mm height)
 */
export function getBlockWeight(html: string): number {
  if (!html) return 0.5;

  // Table block weight: 1.2 header base + 1.1 per row
  if (html.includes('<table')) {
    const trCount = (html.match(/<tr/gi) || []).length;
    return Math.max(2.2, 1.2 + trCount * 1.1);
  }

  // List block weight: 0.5 container base + 1.0 per item
  if (html.includes('<ol') || html.includes('<ul')) {
    const liCount = (html.match(/<li/gi) || []).length;
    return Math.max(0.8, 0.5 + liCount * 1.0);
  }

  // Heading weights (includes line height + top/bottom margins)
  if (html.startsWith('<h1>')) return 2.0;
  if (html.startsWith('<h2>')) return 1.6;
  if (html.startsWith('<h3>')) return 1.3;

  // Text length weighting (based on ~70 characters per 10.5pt line)
  const cleanText = html.replace(/<[^>]*>/g, '');
  if (!cleanText) return 0.5;

  const estimatedLines = Math.ceil(cleanText.length / 70);
  return Math.max(0.8, estimatedLines * 0.9 + 0.2);
}

/**
 * Dynamically calculates available weight capacity based on actual top/bottom margin clearances in mm
 * 1.0 weight unit = 4.0mm height
 */
export function calculatePageWeightCapacity(
  topMm: number = 40,
  bottomMm: number = 52,
  hasRecipient: boolean = false,
  isPage1: boolean = true
): number {
  // Reserved heights on Page 1 vs Page N (in mm)
  const refDateH = isPage1 ? 12 : 0;
  const recipientH = isPage1 && hasRecipient ? 34 : 0;
  const subjectH = isPage1 ? 16 : 0;
  const headerH = !isPage1 ? 12 : 0;
  const footerH = 12; // Base continuation notice height reserve

  const reservedH = topMm + bottomMm + refDateH + recipientH + subjectH + headerH + footerH;
  const availableMm = Math.max(20, 297 - reservedH);

  // 1 weight unit = 4.0mm
  return Number((availableMm / 4.0).toFixed(1));
}

/**
 * Height-weighted dynamic page distribution algorithm
 * Uses chunked list blocks to fill Page 1 and Page N densely (~95%) without gaps or footer collisions
 */
export function distributeBlocksAcrossPages(
  allBlocks: string[],
  targetPage1Weight?: number,
  targetPageNWeight?: number,
  layoutOptions?: {
    marginTopMm?: number;
    marginBottomMm?: number;
    page2MarginTopMm?: number;
    page2MarginBottomMm?: number;
    hasRecipient?: boolean;
  }
): DistributedPagesResult {
  const p1Top = layoutOptions?.marginTopMm ?? 40;
  const p1Bottom = layoutOptions?.marginBottomMm ?? 52;
  const p2Top = layoutOptions?.page2MarginTopMm ?? 38;
  const p2Bottom = layoutOptions?.page2MarginBottomMm ?? 52;
  const hasRec = layoutOptions?.hasRecipient ?? true;

  const actualTargetPage1 = targetPage1Weight ?? calculatePageWeightCapacity(p1Top, p1Bottom, hasRec, true);
  const actualTargetPageN = targetPageNWeight ?? calculatePageWeightCapacity(p2Top, p2Bottom, false, false);
  const cleanBlocks = allBlocks.filter((b) => b !== '<!-- PAGE_BREAK -->');

  // Check if explicit page breaks exist
  const hasExplicitBreaks = allBlocks.includes('<!-- PAGE_BREAK -->');

  if (hasExplicitBreaks) {
    const pageSegments: string[][] = [[]];
    for (const b of allBlocks) {
      if (b === '<!-- PAGE_BREAK -->') {
        if (pageSegments[pageSegments.length - 1].length > 0) {
          pageSegments.push([]);
        }
      } else {
        pageSegments[pageSegments.length - 1].push(b);
      }
    }

    const page1Paragraphs = pageSegments[0] || [];
    const additionalPages = pageSegments.slice(1).map((seg, idx) => ({
      id: `page-${idx + 2}-${Date.now()}-${idx}`,
      pageNumber: idx + 2,
      paragraphs: seg,
    }));

    return { page1Paragraphs, additionalPages };
  }

  // Calculate total weight
  let totalWeight = 0;
  cleanBlocks.forEach((b) => {
    totalWeight += getBlockWeight(b);
  });

  // If total content fits on Page 1 without overflow, keep all on Page 1
  if (totalWeight <= actualTargetPage1) {
    return {
      page1Paragraphs: cleanBlocks,
      additionalPages: [],
    };
  }

  // Distribute blocks dynamically using height weights
  const page1Paragraphs: string[] = [];
  const remainingBlocks: string[] = [...cleanBlocks];

  let currentWeight = 0;
  while (remainingBlocks.length > 0) {
    const nextBlock = remainingBlocks[0];
    const w = getBlockWeight(nextBlock);

    if (currentWeight > 0 && currentWeight + w > actualTargetPage1) {
      // Prevent Orphan Headings: If the last item on Page 1 is a heading (h1, h2, h3), push it to Page 2
      if (page1Paragraphs.length > 0) {
        const lastBlock = page1Paragraphs[page1Paragraphs.length - 1];
        if (lastBlock.startsWith('<h1') || lastBlock.startsWith('<h2') || lastBlock.startsWith('<h3')) {
          remainingBlocks.unshift(page1Paragraphs.pop()!);
        }
      }
      break;
    }

    page1Paragraphs.push(remainingBlocks.shift()!);
    currentWeight += w;
  }

  const additionalPages: { id: string; pageNumber: number; paragraphs: string[] }[] = [];
  let pageNum = 2;

  while (remainingBlocks.length > 0) {
    const pageBlocks: string[] = [];
    let pWeight = 0;

    while (remainingBlocks.length > 0) {
      const nextBlock = remainingBlocks[0];
      const w = getBlockWeight(nextBlock);

      if (pWeight > 0 && pWeight + w > actualTargetPageN) {
        // Prevent Orphan Headings on additional pages
        if (pageBlocks.length > 0) {
          const lastBlock = pageBlocks[pageBlocks.length - 1];
          if (lastBlock.startsWith('<h1') || lastBlock.startsWith('<h2') || lastBlock.startsWith('<h3')) {
            remainingBlocks.unshift(pageBlocks.pop()!);
          }
        }
        break;
      }

      pageBlocks.push(remainingBlocks.shift()!);
      pWeight += w;
    }

    if (pageBlocks.length > 0) {
      additionalPages.push({
        id: `page-${pageNum}-${Date.now()}-${pageNum}`,
        pageNumber: pageNum,
        paragraphs: pageBlocks,
      });
      pageNum++;
    }
  }

  return {
    page1Paragraphs,
    additionalPages,
  };
}

