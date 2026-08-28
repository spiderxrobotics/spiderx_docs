export interface RecipientInfo {
  showRecipient?: boolean; // Toggle to show/hide the "To," recipient block (e.g. for Board Resolutions, Memos)
  name: string;
  designation: string;
  organization: string;
  addressLine1: string;
  addressLine2: string;
  cityStateZip: string;
  email: string;
  phone: string;
}

export interface DirectorSignatory {
  mode: 'single' | 'dual'; // 1 Director vs 2 Directors (Dual Signatures)
  headerText?: string; // e.g. "For and on behalf of"
  headerCompanyName?: string; // Top header company name above signatures (e.g. "SPIDERX ROBOTICS PRIVATE LIMITED")
  
  // Director 1 Credentials
  name: string;
  designation: string;
  companyName: string;
  din?: string; // e.g. "DIN: 11816122"
  signatureImage: string | null; // Data URL or URL
  showSignature: boolean;
  sealImage: string | null; // Data URL or URL for official stamp/seal
  showSeal: boolean;
  sealScale: number; // 0.5 to 1.5
  sealOpacity: number; // 0.1 to 1.0
  sealPosition: 'left' | 'right' | 'behind-signature';
  alignment: 'left' | 'center' | 'right';

  // Director 2 Credentials (Second Signatory for Dual Mode)
  director2Name: string;
  director2Designation: string;
  director2CompanyName: string;
  director2Din?: string; // e.g. "DIN: 11816121"
  director2SignatureImage: string | null;
  showDirector2Signature: boolean;
  director2SealImage: string | null;
  showDirector2Seal: boolean;
  
  // Alignment arrangement for dual signatories
  dualLayout: 'side-by-side' | 'stacked' | 'split-left-right';

  // Candidate / Recipient / Employee / Student Acceptance Block (Right Column)
  showRecipientAcceptance?: boolean;
  recipientAcceptanceTitle?: string; // e.g. "Candidate Acceptance", "Employee Acceptance", "Student Acceptance"
  recipientAcceptanceText?: string; // e.g. "I have read, understood, and accepted the terms of this offer."
  showAcceptanceSignatureLine?: boolean;
  showAcceptanceDateLine?: boolean;
}

export interface KeyValuePair {
  id: string;
  label: string;
  value: string;
}

export interface TableRow {
  label: string;
  value: string;
}

export interface DocumentPage {
  id: string;
  pageNumber: number; // 2, 3, 4, etc.
  title?: string;
  paragraphs: string[];
  showBulletPoints?: boolean;
  bulletTitle?: string;
  bulletPoints?: string[];
  showTable?: boolean;
  tableTitle?: string;
  tableRows?: TableRow[];

  // Custom margin clearance overrides per page (in mm)
  marginTopMm?: number;
  marginBottomMm?: number;
  paddingLeftMm?: number;
  paddingRightMm?: number;
}

export interface MultiPageSettings {
  enableMultiPage?: boolean;
  showContinuedNotice?: boolean; // Displays "...Continued on Next Page" at bottom of pages
  continuedNoticeText?: string; // Custom string e.g. "...Continued on Next Page"
  showPageNumbers?: boolean; // Displays "Page X of Y" in footer
  showHeaderRefNumber?: boolean; // Displays refNumber in continuation page header (Default: false)
  showContinuationNoticeHeader?: boolean; // Displays "(Continuation — Page X)" in header (Default: false)
  showHeaderBarOnContinuation?: boolean; // Displays top header bar on continuation pages (Default: true)
  pages?: DocumentPage[]; // Dynamic list of additional pages (Page 2, Page 3, Page 4...)
  page2Paragraphs?: string[]; // Backward compatibility fallback
  pageNumber?: number;
  totalPages?: number;
}

export interface DocumentBody {
  // Document Headings & Preamble Metadata
  docHeaderCin?: string; // e.g. "CIN: U72100TN2026PTC195120"
  docHeaderAddress?: string; // e.g. "56, ROJA STREET BHARATHIYAR NAGAR..."
  showMainHeading?: boolean;
  mainHeading?: string; // e.g. "BOARD RESOLUTION"
  showSubHeading?: boolean;
  subHeading?: string; // Preamble e.g. "CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING..."

  // Subject & Title Styling
  subject: string;
  showSubject: boolean;
  subjectStyle?: 'boxed' | 'centered-header' | 'plain'; // Boxed badge vs Centered title vs Plain text

  // Paragraphs & Dynamic Content
  paragraphs: string[];

  // Bullet / Numbered Lists
  bulletPoints: string[];
  showBulletPoints: boolean;
  bulletTitle: string;
  listStyle?: 'disc' | 'decimal'; // 'disc' (bullet points) vs 'decimal' (1, 2, 3... numbered list)

  // Dynamic Tables & Key-Value Pairs
  keyValuePairs: KeyValuePair[];
  showKeyValuePairs: boolean;
  showTable?: boolean;
  tableTitle?: string;
  tableRows?: TableRow[];

  // Closing Salutation & Footer Metadata
  closingSalutation: string;
  showPlaceDate?: boolean; // Bottom-left Date & Place display
  placeLocation?: string; // e.g. "Place: MADURAI"
  dateTextFooter?: string; // e.g. "Date: AUGUST 09, 2026"

  multiPage?: MultiPageSettings;
}

export interface LayoutSettings {
  // Margins in mm (Standard A4 is 210 x 297 mm)
  marginTopMm: number; // Space reserved for Page 1 letterhead top header
  marginBottomMm: number; // Space reserved for Page 1 letterhead bottom footer
  paddingLeftMm: number;
  paddingRightMm: number;
  
  // Additional Pages (Page 2 to N) Clearance Overrides (in mm)
  page2MarginTopMm?: number; // Space reserved for Page 2+ header (e.g. 28mm)
  page2MarginBottomMm?: number; // Space reserved for Page 2+ footer (e.g. 25mm)
  page2PaddingLeftMm?: number;
  page2PaddingRightMm?: number;
  
  // Font & Visuals
  fontFamily: 'Inter' | 'Roboto' | 'Cinzel' | 'Playfair Display' | 'Courier New' | 'Times New Roman';
  fontSizePt: number; // Base font size e.g. 11pt, 12pt
  lineHeight: number; // 1.2 to 2.0
  textColor: string;
  accentColor: string;
  
  // Letterhead Background Image
  letterheadImage: string | null;
  showLetterheadBackground: boolean; // Show background on web UI preview
  includeLetterheadInPrint: boolean; // Print background image (Digital PDF) vs Hide background (Pre-printed stationary)
  letterheadOpacity: number; // 0.1 to 1.0
  
  // Guide Overlays
  showAlignmentGuides: boolean;
}

export interface DocumentData {
  id: string;
  title: string;
  refNumber: string;
  date: string;
  recipient: RecipientInfo;
  body: DocumentBody;
  signatory: DirectorSignatory;
  layout: LayoutSettings;
}
