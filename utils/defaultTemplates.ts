import { DocumentData } from "@/types/letterhead";

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

const RAW_SIGNATURE1_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90">
  <g fill="none" stroke="#0f172a" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 20,45 Q 30,10 42,40 Q 50,20 58,42 T 72,25 Q 85,60 98,35 T 120,40 Q 135,20 150,45 T 180,25" stroke-width="2.5"/>
    <path d="M 25,58 Q 90,68 180,50 Q 215,42 230,52" stroke-width="2"/>
    <text x="140" y="70" font-family="'Segoe Script', 'Brush Script MT', cursive, sans-serif" font-size="14" fill="#0f172a" font-weight="bold" stroke="none">13/07/2026</text>
  </g>
</svg>`;

const RAW_SIGNATURE2_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90">
  <g fill="none" stroke="#0f172a" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 20,35 Q 35,15 45,30 Q 60,15 70,35 Q 85,20 100,45 Q 115,15 130,35 T 160,25 Q 175,40 190,20" stroke-width="2.5"/>
    <path d="M 20,55 Q 80,65 185,48 Q 210,40 225,50" stroke-width="2"/>
    <text x="140" y="70" font-family="'Segoe Script', 'Brush Script MT', cursive, sans-serif" font-size="14" fill="#0f172a" font-weight="bold" stroke="none">13/07/2026</text>
  </g>
</svg>`;

export const DEFAULT_SPIDERX_LETTERHEAD_BG = "/letter_head.png";
export const SAMPLE_SEAL_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SEAL_SVG)}`;
export const SAMPLE_SIGNATURE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE1_SVG)}`;
export const SAMPLE_SIGNATURE1_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE1_SVG)}`;
export const SAMPLE_SIGNATURE2_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(RAW_SIGNATURE2_SVG)}`;

export const DEFAULT_DOCUMENT: DocumentData = {
  id: "doc-default-01",
  title: "Official Authorization Letter",
  refNumber: "REF: SX/2026/08/104",
  date: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  recipient: {
    showRecipient: true,
    name: "Dr. Evelyn Vance",
    designation: "Head of Autonomous Systems",
    organization: "Global AI & Robotics Consortium",
    addressLine1: "450 Innovation Parkway, Suite 12",
    addressLine2: "Tech District",
    cityStateZip: "San Francisco, CA 94105",
    email: "e.vance@gairc-labs.org",
    phone: "+1 (415) 555-0182",
  },
  body: {
    subject: "LETTER OF AUTHORIZATION & PROJECT COLLABORATION",
    showSubject: true,
    paragraphs: [
      "This letter serves as formal authorization confirming that SPIDERX ROBOTICS PRIVATE LIMITED hereby grants full authorization to Dr. Evelyn Vance and the team at Global AI & Robotics Consortium to conduct joint research on autonomous robotic navigation platforms under Project Code SX-NAV-2026.",
      "All technical specifications, algorithmic models, and hardware blueprints shared during this collaboration remain protected under our bilateral Non-Disclosure Agreement. Authorized personnel are permitted access to SpiderX Test Facility Lab 4 for experimental validation.",
      "Should you require any further documentation or security clearance verification, please do not hesitate to contact the Office of the Executive Director.",
    ],
    showBulletPoints: true,
    bulletTitle: "Key Authorization Provisions:",
    bulletPoints: [
      "Access Granted: SpiderX Autonomous Navigation SDK (v4.2 Enterprise Edition)",
      "Validity Period: August 10, 2026 through August 10, 2027",
      "Reporting Mandate: Quarterly Progress Briefing to the Board of Directors",
    ],
    showKeyValuePairs: true,
    tableTitle: "Project & Clearance Identifiers:",
    keyValuePairs: [
      {
        id: "kv-1",
        label: "Clearance Level",
        value: "Level 4 - Autonomous Hardware & AI",
      },
      { id: "kv-2", label: "Lead Representative", value: "Dr. Evelyn Vance" },
      {
        id: "kv-3",
        label: "Primary Contact",
        value: "contact@spiderxrobotics.com",
      },
    ],
    closingSalutation: "Sincerely,",
    multiPage: {
      enableMultiPage: false,
      showContinuedNotice: true,
      continuedNoticeText: "...Continued on Next Page",
      pageNumber: 1,
      totalPages: 2,
    },
  },
  signatory: {
    mode: "dual", // Dual Directors by default
    headerText: "For and on behalf of",
    companyName: "SPIDERX ROBOTICS PRIVATE LIMITED",
    name: "Karuppanakumar JOTHIVENKATESH",
    designation: "Director & Shareholder",
    din: "DIN: 11816122",
    signatureImage: SAMPLE_SIGNATURE1_SVG,
    showSignature: true,
    sealImage: SAMPLE_SEAL_SVG,
    showSeal: false,
    sealScale: 1.0,
    sealOpacity: 0.9,
    sealPosition: "behind-signature",
    alignment: "left",

    // Director 2 Defaults
    director2Name: "Suresh Pandian Sankaranarayanan",
    director2Designation: "Director & Shareholder",
    director2Din: "DIN: 11816121",
    director2CompanyName: "SPIDERX ROBOTICS PRIVATE LIMITED",
    director2SignatureImage: SAMPLE_SIGNATURE2_SVG,
    showDirector2Signature: true,
    director2SealImage: null,
    showDirector2Seal: false,
    dualLayout: "side-by-side",
  },
  layout: {
    letterheadImage: null,
    showLetterheadBackground: false,
    includeLetterheadInPrint: true,
    fontFamily: 'Inter',
    fontSizePt: 10.5,
    lineHeight: 1.45,
    textColor: '#0f172a',
    accentColor: '#2563eb',
    letterheadOpacity: 1.0,
    marginTopMm: 34,
    marginBottomMm: 40,
    paddingLeftMm: 24,
    paddingRightMm: 24,
    showAlignmentGuides: false,
  },
};

export const BLANK_GUEST_DOCUMENT: DocumentData = {
  ...DEFAULT_DOCUMENT,
  title: "Blank Document",
  recipient: { ...DEFAULT_DOCUMENT.recipient, name: "", designation: "", organization: "", addressLine1: "", addressLine2: "", cityStateZip: "", email: "", phone: "" },
  body: { ...DEFAULT_DOCUMENT.body, subject: "", paragraphs: [""], bulletPoints: [], keyValuePairs: [] },
  signatory: { ...DEFAULT_DOCUMENT.signatory, name: "", designation: "", din: "", director2Name: "", director2Designation: "", director2Din: "" },
  layout: {
    letterheadImage: null,
    showLetterheadBackground: false,
    includeLetterheadInPrint: true,
    fontFamily: 'Inter',
    fontSizePt: 10.5,
    lineHeight: 1.45,
    textColor: '#0f172a',
    accentColor: '#2563eb',
    letterheadOpacity: 1.0,
    marginTopMm: 34,
    marginBottomMm: 40,
    paddingLeftMm: 24,
    paddingRightMm: 24,
    showAlignmentGuides: false,
  },
};

export const PRESET_TEMPLATES: {
  name: string;
  description: string;
  template: Partial<DocumentData>;
}[] = [
  {
    name: "SpiderX Official Authorization",
    description:
      "Formal authorization letter with project scope and clearance level table.",
    template: DEFAULT_DOCUMENT,
  },
  {
    name: "Official Board Resolution",
    description:
      "Corporate Board Resolution template without recipient block, for bank account operations and director authorizations.",
    template: {
      title: "BOARD RESOLUTION FOR BANK ACCOUNT OPERATION",
      refNumber: "",
      date: "AUGUST 09, 2026",
      recipient: {
        showRecipient: false, // Hides recipient section for Board Resolutions
        name: "",
        designation: "",
        organization: "",
        addressLine1: "",
        addressLine2: "",
        cityStateZip: "",
        email: "",
        phone: "",
      },
      body: {
        docHeaderCin: "CIN: U72100TN2026PTC195120",
        docHeaderAddress:
          "56, ROJA STREET BHARATHIYAR NAGAR, ALAGAPPAN NAGAR, MADURAI, TAMIL NADU, 625003",
        showMainHeading: true,
        mainHeading: "BOARD RESOLUTION",
        showSubHeading: true,
        subHeading:
          "CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF SPIDERX ROBOTICS PRIVATE LIMITED HELD ON AUGUST 09, 2026 AT 10:00 A.M. AT 56, ROJA STREET, BHARATHIYAR NAGAR, ALAGAPPAN NAGAR, MADURAI, TAMIL NADU, 625003.",
        subject:
          "Board Resolution for Authorising Directors to Operate the Bank Account",
        showSubject: true,
        subjectStyle: "centered-header",
        paragraphs: [
          '**"RESOLVED THAT** pursuant to the provisions of the Companies Act, 2013 and the Articles of Association of the Company, the consent of the Board be and is hereby accorded to open and maintain a Current Account in the name of **SPIDERX ROBOTICS PRIVATE LIMITED** with **CANARA BANK, MADURAI TVS NAGAR**.',
          "**RESOLVED FURTHER THAT** Mr. **Karuppanakumar JOTHIVENKATESH**, Director (DIN: **11816122**) and Mr. **Suresh Pandian Sankaranarayan**, Director (DIN: **11816121**) be and are hereby **jointly and severally authorised, with either director acting singly**, to:",
          "**RESOLVED FURTHER THAT** the Bank be and is hereby authorised to honour all cheques, bills of exchange, promissory notes, payment instructions and other instruments signed in accordance with this resolution and to act upon any instructions given by either of the above authorised signatories acting singly.",
          "**RESOLVED FURTHER THAT** a certified true copy of this resolution be provided to the Bank under the signature of any Director or the Company Secretary (if appointed), who is hereby authorised to certify the same.",
        ],
        showBulletPoints: true,
        bulletTitle: "",
        listStyle: "decimal",
        bulletPoints: [
          "Sign and execute all account opening forms, declarations, undertakings and other documents required by the Bank.",
          "Operate the Company's bank account by signing cheques, payment instructions, withdrawal forms, and other banking instruments.",
          "Issue instructions relating to fund transfers, NEFT, RTGS, IMPS, UPI, internet banking, mobile banking, and other electronic banking services.",
          "Deposit cheques, cash, drafts and other negotiable instruments into the Company's account.",
          "Apply for and operate debit cards, cheque books, internet banking facilities and any other banking products or services offered by the Bank.",
          "Execute indemnities, declarations, agreements and all other documents required by the Bank in connection with the operation of the account.",
          "Do all such acts, deeds and things as may be necessary for the effective operation and maintenance of the Company's banking relationship.",
        ],
        showKeyValuePairs: false,
        keyValuePairs: [],
        closingSalutation: "CERTIFIED TRUE COPY",
        showPlaceDate: true,
        dateTextFooter: "Date: AUGUST 09, 2026",
        placeLocation: "Place: MADURAI",
      },
      signatory: {
        mode: "dual",
        headerText: "For SPIDERX ROBOTICS PRIVATE LIMITED",
        companyName: "",
        name: "Karuppanakumar JOTHIVENKATESH",
        designation: "Director",
        din: "DIN: 11816122",
        signatureImage: SAMPLE_SIGNATURE1_SVG,
        showSignature: true,
        sealImage: SAMPLE_SEAL_SVG,
        showSeal: false,
        sealScale: 1.0,
        sealOpacity: 0.9,
        sealPosition: "behind-signature",
        alignment: "left",

        director2Name: "Suresh Pandian Sankaranarayan",
        director2Designation: "Director",
        director2Din: "DIN: 11816121",
        director2CompanyName: "",
        director2SignatureImage: SAMPLE_SIGNATURE2_SVG,
        showDirector2Signature: true,
        director2SealImage: null,
        showDirector2Seal: false,
        dualLayout: "side-by-side",
      },
    },
  },
  {
    name: "Executive Offer / Appointment Letter",
    description:
      "Standard employment offer letter for engineering and leadership roles.",
    template: {
      title: "Formal Offer of Employment",
      refNumber: `REF: SX/HR/${new Date().getFullYear()}/042`,
      recipient: {
        showRecipient: true,
        name: "Alex Johnson",
        designation: "Senior Robotics Engineer",
        organization: "SpiderX Robotics Pvt. Ltd.",
        addressLine1: "789 Innovation Way",
        addressLine2: "Tech District",
        cityStateZip: "Madurai, TN 625003",
        email: "a.johnson@example.com",
        phone: "+91 98765 43210",
      },
      body: {
        subject: "OFFER OF EMPLOYMENT - SENIOR ROBOTICS ENGINEER",
        showSubject: true,
        paragraphs: [
          "On behalf of SPIDERX ROBOTICS PRIVATE LIMITED, I am delighted to offer you the position of Senior Robotics Engineer within our Autonomous Systems Division.",
          "We were thoroughly impressed with your technical expertise during the evaluation process and believe your background in ROS2, computer vision, and embedded control systems will be invaluable to our team.",
          "Please review the attached terms of employment and return a signed copy of this offer letter by August 20, 2026 to confirm your acceptance.",
        ],
        showBulletPoints: true,
        bulletTitle: "Summary of Compensation & Benefits:",
        bulletPoints: [
          "Annual Base Compensation: Competitive Industry Package",
          "Equity Grant: Stock Options subject to standard vesting schedule",
          "Benefits: Health Insurance, Professional Learning Allowance & Performance Bonus",
          "Target Start Date: September 1, 2026",
        ],
        showKeyValuePairs: false,
        keyValuePairs: [],
        tableTitle: "",
        closingSalutation: "Warm regards,",
      },
    },
  },
  {
    name: "Commercial Quotation & Proposal",
    description:
      "Official quote for hardware, software licensing, and engineering services.",
    template: {
      title: "Commercial Hardware & Software Quotation",
      refNumber: `REF: SX/QUOTE/${new Date().getFullYear()}/889`,
      recipient: {
        showRecipient: true,
        name: "Procurement Manager",
        designation: "Department of Robotics",
        organization: "Apex Industrial Solutions",
        addressLine1: "Building 4, Cyber City",
        addressLine2: "",
        cityStateZip: "Chennai, TN 600032",
        email: "procurement@apexind.com",
        phone: "+91 44 2345 6789",
      },
      body: {
        subject: "QUOTATION FOR SPIDERX ROBOTIC PLATFORM (SX-V4 CORE)",
        showSubject: true,
        paragraphs: [
          "Thank you for your interest in SPIDERX ROBOTICS PRIVATE LIMITED platform products. Below is our formal commercial quotation for the requested hardware and enterprise software bundle.",
          "All components are tested and calibrated at our central manufacturing hub prior to dispatch. Lead time for delivery is estimated at 14 business days from PO receipt.",
        ],
        showBulletPoints: false,
        bulletTitle: "",
        bulletPoints: [],
        showKeyValuePairs: true,
        tableTitle: "Pricing Breakdown & Quotation Terms:",
        keyValuePairs: [
          {
            id: "q-1",
            label: "SX-V4 Quadruped Base Chassis",
            value: "INR 2,850,000",
          },
          {
            id: "q-2",
            label: "LiDAR & Vision Perception Sensor Suite",
            value: "INR 950,000",
          },
          {
            id: "q-3",
            label: "SpiderX Autonomy Engine (1-Yr License)",
            value: "INR 650,000",
          },
          {
            id: "q-4",
            label: "Quotation Validity",
            value: "30 Days from Issue Date",
          },
        ],
        closingSalutation: "Respectfully submitted,",
      },
    },
  },
];
