import { DocumentData } from '@/types/letterhead';

// Raw SVG strings
const RAW_HEADER_FOOTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1131" viewBox="0 0 800 1131">
  <rect width="800" height="1131" fill="#ffffff"/>
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>

  <path d="M0,0 L800,0 L800,90 L620,90 L580,120 L0,120 Z" fill="url(#headerGrad)" />
  <path d="M630,90 L800,90 L800,120 L590,120 Z" fill="url(#accentGrad)" opacity="0.8"/>
  
  <g transform="translate(45, 30)">
    <polygon points="25,5 45,16 45,38 25,49 5,38 5,16" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="25" cy="27" r="8" fill="#2563eb"/>
    <path d="M25,12 L25,19 M25,35 L25,42 M12,20 L18,23 M32,31 L38,34 M12,34 L18,31 M32,23 L38,20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    
    <text x="60" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="#ffffff" letter-spacing="2">SPIDERX</text>
    <text x="60" y="44" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="#93c5fd" letter-spacing="4">ROBOTICS &amp; AI LABS</text>
  </g>
  
  <g transform="translate(755, 35)" text-anchor="end" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">
    <text x="0" y="0" font-weight="bold">WWW.SPIDERXROBOTICS.COM</text>
    <text x="0" y="15" fill="#e0f2fe">info@spiderxrobotics.com | +1 (800) 555-0199</text>
    <text x="0" y="30" fill="#bae6fd">Innovation Hub, Tech Park, Suite 402</text>
  </g>

  <path d="M0,1055 L800,1055 L800,1131 L0,1131 Z" fill="#0f172a"/>
  <path d="M0,1050 L800,1050 L800,1055 L0,1055 Z" fill="url(#accentGrad)"/>
  
  <g transform="translate(45, 1090)" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">
    <text x="0" y="0" font-weight="bold" fill="#f8fafc">SpiderX Robotics Inc.</text>
    <text x="0" y="14">Confidential &amp; Official Document</text>
  </g>
  
  <g transform="translate(755, 1090)" text-anchor="end" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">
    <text x="0" y="0">ISO 9001:2025 Certified Robotics Research Facility</text>
    <text x="0" y="14" fill="#64748b">Page 1 of 1</text>
  </g>
</svg>`;

const RAW_SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <circle cx="80" cy="80" r="74" fill="none" stroke="#1e3a8a" stroke-width="4" stroke-dasharray="6,3"/>
  <circle cx="80" cy="80" r="66" fill="none" stroke="#1e3a8a" stroke-width="2"/>
  <circle cx="80" cy="80" r="48" fill="none" stroke="#1e3a8a" stroke-width="1.5"/>
  
  <path id="sealTextPathUpper" d="M 22,80 A 58,58 0 1,1 138,80" fill="none"/>
  <text font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#1e3a8a" letter-spacing="2">
    <textPath href="#sealTextPathUpper" startOffset="50%" text-anchor="middle">SPIDERX ROBOTICS INC.</textPath>
  </text>
  
  <path id="sealTextPathLower" d="M 138,80 A 58,58 0 0,1 22,80" fill="none"/>
  <text font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#1e3a8a" letter-spacing="1.5">
    <textPath href="#sealTextPathLower" startOffset="50%" text-anchor="middle">★ OFFICIAL CORPORATE SEAL ★</textPath>
  </text>

  <g transform="translate(80,80) scale(0.8)">
    <polygon points="0,-22 6,-7 22,-7 9,3 14,18 0,9 -14,18 -9,3 -22,-7 -6,-7" fill="#1e3a8a"/>
    <text x="0" y="28" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#1e3a8a" text-anchor="middle">DIRECTOR APPROVED</text>
  </g>
</svg>`;

const RAW_SIGNATURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="90" viewBox="0 0 260 90">
  <path d="M 20,65 Q 40,15 55,40 T 80,30 T 110,60 T 130,25 T 160,45 T 200,20 Q 230,25 245,40" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
  <path d="M 35,50 Q 80,75 170,55 Q 220,45 235,55" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
  <circle cx="195" cy="22" r="2.5" fill="#0f172a"/>
</svg>`;

export const DEFAULT_SPIDERX_LETTERHEAD_BG = '/letter_head.png';
export const SAMPLE_SEAL_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SEAL_SVG)}`;
export const SAMPLE_SIGNATURE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE_SVG)}`;

export const DEFAULT_DOCUMENT: DocumentData = {
  id: 'doc-default-01',
  title: 'Official Authorization Letter',
  refNumber: 'REF: SX/2026/08/104',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  recipient: {
    name: 'Dr. Evelyn Vance',
    designation: 'Head of Autonomous Systems',
    organization: 'Global AI & Robotics Consortium',
    addressLine1: '450 Innovation Parkway, Suite 12',
    addressLine2: 'Tech District',
    cityStateZip: 'San Francisco, CA 94105',
    email: 'e.vance@gairc-labs.org',
    phone: '+1 (415) 555-0182',
  },
  body: {
    subject: 'LETTER OF AUTHORIZATION & PROJECT COLLABORATION',
    showSubject: true,
    paragraphs: [
      'This letter serves as formal authorization confirming that SpiderX Robotics Pvt. Ltd. hereby grants full authorization to Dr. Evelyn Vance and the team at Global AI & Robotics Consortium to conduct joint research on autonomous robotic navigation platforms under Project Code SX-NAV-2026.',
      'All technical specifications, algorithmic models, and hardware blueprints shared during this collaboration remain protected under our bilateral Non-Disclosure Agreement. Authorized personnel are permitted access to SpiderX Test Facility Lab 4 for experimental validation.',
      'Should you require any further documentation or security clearance verification, please do not hesitate to contact the Office of the Executive Director.',
    ],
    showBulletPoints: true,
    bulletTitle: 'Key Authorization Provisions:',
    bulletPoints: [
      'Access Granted: SpiderX Autonomous Navigation SDK (v4.2 Enterprise Edition)',
      'Validity Period: August 10, 2026 through August 10, 2027',
      'Reporting Mandate: Quarterly Progress Briefing to the Board of Directors',
    ],
    showKeyValuePairs: true,
    tableTitle: 'Project & Clearance Identifiers:',
    keyValuePairs: [
      { id: 'kv-1', label: 'Clearance Level', value: 'Level 4 - Autonomous Hardware & AI' },
      { id: 'kv-2', label: 'Lead Representative', value: 'Dr. Evelyn Vance' },
      { id: 'kv-3', label: 'Primary Contact', value: 'contact@spiderxrobotics.com' },
    ],
    closingSalutation: 'Sincerely,',
    multiPage: {
      enableMultiPage: false,
      showContinuedNotice: true,
      continuedNoticeText: '...Continued on Next Page',
      pageNumber: 1,
      totalPages: 2,
    },
  },
  signatory: {
    mode: 'single', // 'single' (1 Director) or 'dual' (2 Directors)
    name: 'Alexander Mercer',
    designation: 'Managing Director & CEO',
    companyName: 'SpiderX Robotics Pvt. Ltd.',
    signatureImage: SAMPLE_SIGNATURE_SVG,
    showSignature: true,
    sealImage: SAMPLE_SEAL_SVG,
    showSeal: true,
    sealScale: 1.0,
    sealOpacity: 0.9,
    sealPosition: 'behind-signature',
    alignment: 'right',

    // Director 2 Defaults
    director2Name: 'Marcus Sterling',
    director2Designation: 'Executive Director & CTO',
    director2CompanyName: 'SpiderX Robotics Pvt. Ltd.',
    director2SignatureImage: SAMPLE_SIGNATURE_SVG,
    showDirector2Signature: true,
    director2SealImage: null,
    showDirector2Seal: false,
    dualLayout: 'side-by-side',
  },
  layout: {
    marginTopMm: 46, // Aligned perfectly with To : / Date : row in letter_head.png
    marginBottomMm: 40, // Clearance for purple footer banner
    paddingLeftMm: 24,
    paddingRightMm: 24,
    fontFamily: 'Inter',
    fontSizePt: 10.5,
    lineHeight: 1.45,
    textColor: '#1e1b4b',
    accentColor: '#5b21b6',
    letterheadImage: '/letter_head.png',
    showLetterheadBackground: true,
    includeLetterheadInPrint: true,
    letterheadOpacity: 1.0,
    showAlignmentGuides: true,
  },
};

export const PRESET_TEMPLATES: { name: string; description: string; template: Partial<DocumentData> }[] = [
  {
    name: 'SpiderX Official Authorization',
    description: 'Formal authorization letter with project scope and clearance level table.',
    template: DEFAULT_DOCUMENT,
  },
  {
    name: 'Executive Offer / Appointment Letter',
    description: 'Standard employment offer letter for engineering and leadership roles.',
    template: {
      title: 'Formal Offer of Employment',
      refNumber: `REF: SX/HR/${new Date().getFullYear()}/042`,
      body: {
        subject: 'OFFER OF EMPLOYMENT - SENIOR ROBOTICS ENGINEER',
        showSubject: true,
        paragraphs: [
          'On behalf of SpiderX Robotics Inc., I am delighted to offer you the position of Senior Robotics Engineer within our Autonomous Systems Division.',
          'We were thoroughly impressed with your technical expertise during the evaluation process and believe your background in ROS2, computer vision, and embedded control systems will be invaluable to our team.',
          'Please review the attached terms of employment and return a signed copy of this offer letter by August 20, 2026 to confirm your acceptance.',
        ],
        showBulletPoints: true,
        bulletTitle: 'Summary of Compensation & Benefits:',
        bulletPoints: [
          'Annual Base Compensation: $185,000 USD (Paid bi-weekly)',
          'Equity Grant: 25,000 Stock Options (4-year vesting schedule with 1-year cliff)',
          'Benefits: 100% Employer-Paid Medical, Dental, Vision & 401(k) Matching up to 5%',
          'Target Start Date: September 1, 2026',
        ],
        showKeyValuePairs: false,
        keyValuePairs: [],
        tableTitle: '',
        closingSalutation: 'Warm regards,',
      },
    },
  },
  {
    name: 'Commercial Quotation & Proposal',
    description: 'Official quote for hardware, software licensing, and engineering services.',
    template: {
      title: 'Commercial Hardware & Software Quotation',
      refNumber: `REF: SX/QUOTE/${new Date().getFullYear()}/889`,
      body: {
        subject: 'QUOTATION FOR SPIDERX ROBOTIC PLATFORM (SX-V4 CORE)',
        showSubject: true,
        paragraphs: [
          'Thank you for your interest in SpiderX Robotics platform products. Below is our formal commercial quotation for the requested hardware and enterprise software bundle.',
          'All components are tested and calibrated at our central manufacturing hub prior to dispatch. Lead time for delivery is estimated at 14 business days from PO receipt.',
        ],
        showBulletPoints: false,
        bulletTitle: '',
        bulletPoints: [],
        showKeyValuePairs: true,
        tableTitle: 'Pricing Breakdown & Quotation Terms:',
        keyValuePairs: [
          { id: 'q-1', label: 'SX-V4 Quadruped Base Chassis', value: '$34,500 USD' },
          { id: 'q-2', label: 'LiDAR & Vision Perception Sensor Suite', value: '$12,800 USD' },
          { id: 'q-3', label: 'SpiderX Autonomy Engine (1-Yr License)', value: '$8,500 USD' },
          { id: 'q-4', label: 'Estimated Total Investment', value: '$55,800 USD (Excl. Local Taxes)' },
          { id: 'q-5', label: 'Quotation Validity', value: '30 Days from Issue Date' },
        ],
        closingSalutation: 'Respectfully submitted,',
      },
    },
  },
];
