export interface RecipientInfo {
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
  
  // Director 1 Credentials
  name: string;
  designation: string;
  companyName: string;
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
  director2SignatureImage: string | null;
  showDirector2Signature: boolean;
  director2SealImage: string | null;
  showDirector2Seal: boolean;
  
  // Alignment arrangement for dual signatories
  dualLayout: 'side-by-side' | 'stacked' | 'split-left-right';
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
}

export interface MultiPageSettings {
  enableMultiPage?: boolean;
  showContinuedNotice?: boolean; // Displays "...Continued on Next Page" at bottom of pages
  continuedNoticeText?: string; // Custom string e.g. "...Continued on Next Page"
  showPageNumbers?: boolean; // Displays "Page X of Y" in footer
  pages?: DocumentPage[]; // Dynamic list of additional pages (Page 2, Page 3, Page 4...)
  page2Paragraphs?: string[]; // Backward compatibility fallback
  pageNumber?: number;
  totalPages?: number;
}

export interface DocumentBody {
  subject: string;
  showSubject: boolean;
  paragraphs: string[];
  bulletPoints: string[];
  showBulletPoints: boolean;
  bulletTitle: string;
  keyValuePairs: KeyValuePair[];
  showKeyValuePairs: boolean;
  showTable?: boolean;
  tableTitle?: string;
  tableRows?: TableRow[];
  closingSalutation: string;
  multiPage?: MultiPageSettings;
}

export interface LayoutSettings {
  // Margins in mm (Standard A4 is 210 x 297 mm)
  marginTopMm: number; // Space reserved for letterhead top header
  marginBottomMm: number; // Space reserved for letterhead bottom footer
  paddingLeftMm: number;
  paddingRightMm: number;
  
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
