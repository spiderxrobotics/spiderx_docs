import { DocumentData } from '@/types/letterhead';

export const RAW_SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="none" stroke="#7f469b" stroke-width="4" stroke-dasharray="6,3" />
  <circle cx="100" cy="100" r="88" fill="none" stroke="#7f469b" stroke-width="2" />
  <circle cx="100" cy="100" r="62" fill="none" stroke="#7f469b" stroke-width="1.5" stroke-dasharray="3,3" />
  <path id="sealTextPathUpper" d="M 25,100 A 75,75 0 1,1 175,100" fill="none" />
  <path id="sealTextPathLower" d="M 175,100 A 75,75 0 1,1 25,100" fill="none" />
  <text font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#7f469b" letter-spacing="2">
    <textPath href="#sealTextPathUpper" startOffset="50%" text-anchor="middle">SPIDERX ROBOTICS PRIVATE LIMITED</textPath>
  </text>
  <text font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#7f469b" letter-spacing="1.5">
    <textPath href="#sealTextPathLower" startOffset="50%" text-anchor="middle">★ OFFICIAL CORPORATE SEAL ★</textPath>
  </text>
  <g transform="translate(100,100) scale(0.65)">
    <polygon points="0,-35 9,-10 35,-10 14,5 22,30 0,15 -22,30 -14,5 -35,-10 -9,-10" fill="#7f469b" opacity="0.9" />
  </g>
  <text x="100" y="152" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="#7f469b" text-anchor="middle" letter-spacing="1">MADURAI, INDIA</text>
</svg>`;

export const RAW_SIGNATURE1_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100">
  <path d="M 20 60 C 40 10, 60 90, 80 40 C 95 10, 110 80, 130 50 C 145 25, 160 75, 180 45 C 195 20, 220 80, 260 40 M 40 55 L 240 50 M 70 30 C 110 5, 150 95, 210 35" fill="none" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export const RAW_SIGNATURE2_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100">
  <path d="M 25 70 C 50 20, 75 80, 100 30 C 120 15, 140 85, 165 40 C 185 10, 205 90, 235 35 M 50 65 L 250 45 M 80 40 L 220 60" fill="none" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export const SAMPLE_SEAL_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SEAL_SVG)}`;
export const SAMPLE_SIGNATURE1_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE1_SVG)}`;
export const SAMPLE_SIGNATURE2_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE2_SVG)}`;

export const DEFAULT_DOCUMENT: DocumentData = {
  id: 'doc-default-01',
  title: 'Untitled Document',
  refNumber: '',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  recipient: {
    showRecipient: true,
    name: '',
    designation: '',
    organization: '',
    addressLine1: '',
    addressLine2: '',
    cityStateZip: '',
    email: '',
    phone: '',
  },
  body: {
    subject: '',
    showSubject: false,
    docHeaderCin: '',
    docHeaderAddress: '',
    showMainHeading: false,
    mainHeading: '',
    showSubHeading: false,
    subHeading: '',
    paragraphs: [''],
    showBulletPoints: false,
    bulletTitle: '',
    bulletPoints: [],
    showKeyValuePairs: false,
    tableTitle: '',
    keyValuePairs: [],
    closingSalutation: 'Sincerely,',
    multiPage: {
      enableMultiPage: false,
      showContinuedNotice: true,
      continuedNoticeText: '...Continued on Next Page',
      pageNumber: 1,
      totalPages: 1,
    },
  },
  signatory: {
    mode: 'dual',
    headerText: 'For and on behalf of',
    companyName: '',
    name: '',
    designation: '',
    din: '',
    signatureImage: null,
    showSignature: true,
    sealImage: null,
    showSeal: false,
    sealScale: 1.0,
    sealOpacity: 0.9,
    sealPosition: 'behind-signature',
    alignment: 'left',

    director2Name: '',
    director2Designation: '',
    director2Din: '',
    director2CompanyName: '',
    director2SignatureImage: null,
    showDirector2Signature: true,
    director2SealImage: null,
    showDirector2Seal: false,
    dualLayout: 'side-by-side',
    showRecipientAcceptance: true,
    recipientAcceptanceTitle: 'Candidate Acceptance',
    recipientAcceptanceText: 'I have read, understood, and accepted the terms of this offer.',
    showAcceptanceSignatureLine: true,
    showAcceptanceDateLine: true,
  },
  layout: {
    marginTopMm: 34,
    marginBottomMm: 40,
    paddingLeftMm: 24,
    paddingRightMm: 24,
    fontFamily: 'Inter',
    fontSizePt: 10.5,
    lineHeight: 1.45,
    textColor: '#0f172a',
    accentColor: '#7f469b',
    letterheadImage: null,
    showLetterheadBackground: false,
    includeLetterheadInPrint: true,
    letterheadOpacity: 1.0,
    showAlignmentGuides: false,
  },
};

export const BLANK_GUEST_DOCUMENT: DocumentData = DEFAULT_DOCUMENT;

export const PRESET_TEMPLATES: { name: string; description: string; template: Partial<DocumentData> }[] = [
  {
    name: 'SpiderX Official Authorization',
    description: 'Formal authorization letter with project scope and clearance level table.',
    template: DEFAULT_DOCUMENT,
  },
];
