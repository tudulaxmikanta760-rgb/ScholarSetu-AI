import type {
  AcademicStream,
  EducationLevel,
  GenderOption,
  IncomeBracket,
  OpportunityFocus,
  SocialCategory,
  StudentProfile,
} from '../types';

export const EDUCATION_LEVELS: EducationLevel[] = [
  'Class 9–10 (Pre-Matric)',
  'Class 11–12 (Higher Secondary)',
  'Diploma / ITI / Polytechnic',
  'Undergraduate (UG / B.Tech / B.Sc / BA / B.Com / MBBS)',
  'Postgraduate (PG / M.Tech / M.Sc / MBA / MA)',
  'PhD / Doctoral / Research',
];

export const ACADEMIC_STREAMS: AcademicStream[] = [
  'General / All Streams',
  'Engineering & Technology',
  'Medical, Pharmacy & Allied Health',
  'Pure Sciences & Mathematics',
  'Commerce, Finance & Management',
  'Arts, Humanities & Social Sciences',
  'Law & Public Policy',
  'Agriculture & Veterinary',
  'Vocational, ITI & Skilled Trades',
];

export const SOCIAL_CATEGORIES: SocialCategory[] = [
  'General',
  'General-EWS',
  'OBC (Non-Creamy Layer)',
  'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)',
  'Minority Community (Muslim / Christian / Sikh / Buddhist / Jain / Parsi)',
];

export const INCOME_BRACKETS: IncomeBracket[] = [
  'Below ₹1 Lakh',
  '₹1 Lakh – ₹2.5 Lakh',
  '₹2.5 Lakh – ₹4.5 Lakh',
  '₹4.5 Lakh – ₹8 Lakh',
  'Above ₹8 Lakh',
];

export const GENDER_OPTIONS: GenderOption[] = [
  'Female',
  'Male',
  'Non-Binary / Transgender',
];

export const OPPORTUNITY_FOCUSES: OpportunityFocus[] = [
  'All Opportunities',
  'Merit & Need Scholarships',
  'Fellowships & Research Grants',
  'Government Internships & Skill Programs',
  'Overseas Study Grants',
];

export const SPECIAL_CRITERIA_OPTIONS: string[] = [
  'Single Girl Child',
  'First-Generation College Student',
  'Person with Benchmark Disability (PwD ≥ 40%)',
  'Rural / Non-Metro Domicile',
  'Ward of Farmer / Construction / Mine Worker',
  'Ward of Armed Forces / Ex-Servicemen / CAPF',
  'Hosteller (Living Away from Home)',
  'Orphan / Single Parent Household',
];

export interface GovernmentPortal {
  id: string;
  region: string;
  scope: 'Central' | 'State & UT';
  portalName: string;
  url: string;
  keySchemes: string;
  authRequirement: string;
}

export const INDIAN_STATES_AND_UTS: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman & Nicobar Islands',
  'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Lakshadweep',
];

export const GOVERNMENT_PORTALS: GovernmentPortal[] = [
  {
    id: 'nsp',
    region: 'All India (Central)',
    scope: 'Central',
    portalName: 'National Scholarship Portal (NSP)',
    url: 'https://scholarships.gov.in',
    keySchemes: 'Central Sector Scheme (CSSS), NMMS, PM YASASVI, Top Class Education SC/ST, AICTE Pragati & Saksham, Ishan Uday',
    authRequirement: 'NSP One-Time Registration (OTR) + Face Authentication + Aadhaar-seeded NPCI Bank Account',
  },
  {
    id: 'aicte',
    region: 'All India (Technical)',
    scope: 'Central',
    portalName: 'AICTE Student Scholarship & Internship Portal',
    url: 'https://www.aicte-india.org/schemes/students-development-schemes',
    keySchemes: 'Pragati (Girls), Saksham (PwD), Swanath, PG GATE/GPAT Scholarship, AICTE National Internship Portal',
    authRequirement: 'AICTE-approved Institution ID + NSP OTR + Valid GATE/GPAT (for PG)',
  },
  {
    id: 'ugc-dst',
    region: 'All India (Research & Science)',
    scope: 'Central',
    portalName: 'DST INSPIRE & UGC Fellowship Portal',
    url: 'https://online-inspire.gov.in',
    keySchemes: 'INSPIRE SHE (₹80,000/yr), UGC Single Girl Child PG, National Fellowship for SC/ST/OBC, PMRF',
    authRequirement: 'Top 1% Board Advisory Note or NET/JRF Score + University Nodal Verification',
  },
  {
    id: 'skill-india',
    region: 'All India (Skills & Apprenticeships)',
    scope: 'Central',
    portalName: 'Skill India Digital Hub & NATS 2.0',
    url: 'https://www.skillindiadigital.gov.in',
    keySchemes: 'PMKVY 4.0, National Apprenticeship Training Scheme (NATS stipend ₹8,000–₹9,000/mo), PM Internship Scheme',
    authRequirement: 'Aadhaar e-KYC + ABC ID (Academic Bank of Credits)',
  },
  {
    id: 'maharashtra',
    region: 'Maharashtra',
    scope: 'State & UT',
    portalName: 'MahaDBT (Aaple Sarkar DBT Portal)',
    url: 'https://mahadbt.maharashtra.gov.in',
    keySchemes: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavritti, Post-Matric SC/ST/OBC/VJNT/SBC, Dr. Panjabrao Deshmukh Hostel Allowance',
    authRequirement: 'Aadhaar-linked bank account + Maharashtra Domicile + CAP Allotment Letter (for professional courses)',
  },
  {
    id: 'odisha',
    region: 'Odisha',
    scope: 'State & UT',
    portalName: 'Odisha State Scholarship Portal',
    url: 'https://scholarship.odisha.gov.in',
    keySchemes: 'KALIA Scholarship, Gopabandhu Sikhya Sahayata Yojana, e-Medhabruti (UG/PG/Technical), Post-Matric SC/ST/OBC/SEBC',
    authRequirement: 'Aadhaar authentication + Resident & Income Certificate via e-District Odisha',
  },
  {
    id: 'uttar-pradesh',
    region: 'Uttar Pradesh',
    scope: 'State & UT',
    portalName: 'UP Scholarship & Fee Reimbursement System',
    url: 'https://scholarship.up.gov.in',
    keySchemes: 'UP Pre-Matric & Post-Matric Dashmottar Scholarship (General, OBC, SC, ST, Minority) + Tuition Fee Reimbursement',
    authRequirement: 'UP e-District Income/Caste verification code + NPCI Aadhaar seeded account',
  },
  {
    id: 'karnataka',
    region: 'Karnataka',
    scope: 'State & UT',
    portalName: 'State Scholarship Portal (SSP Karnataka)',
    url: 'https://ssp.postmatric.karnataka.gov.in',
    keySchemes: 'Vidyasiri Food & Accommodation, Post-Matric SC/ST/OBC/Minority, Fee Concession, Raitha Vidya Nidhi',
    authRequirement: 'Kutumba ID + Nadakacheri RD Number (Caste/Income) + e-Attestation by College',
  },
  {
    id: 'west-bengal',
    region: 'West Bengal',
    scope: 'State & UT',
    portalName: 'SVMCM & Oasis Scholarship Portal',
    url: 'https://svmcm.wbhed.gov.in',
    keySchemes: 'Swami Vivekananda Merit-cum-Means (SVMCM), Kanyashree K3, Oasis Post-Matric SC/ST/OBC, Aikyashree (Minority)',
    authRequirement: 'Banglar Shiksha ID / Marksheet + WB Domicile & Income Certificate (BDO/SDO)',
  },
  {
    id: 'madhya-pradesh',
    region: 'Madhya Pradesh',
    scope: 'State & UT',
    portalName: 'MP Scholarship Portal 2.0 & MPTAAS',
    url: 'https://scholarshipportal.mp.nic.in',
    keySchemes: 'Mukhyamantri Medhavi Vidyarthi Yojana (MMVY), Gaon Ki Beti, Pratibha Kiran, MPTAAS SC/ST/OBC Post-Matric',
    authRequirement: 'Samagra ID + MP Digital Caste/Income Certificate + Aadhaar e-KYC',
  },
  {
    id: 'rajasthan',
    region: 'Rajasthan',
    scope: 'State & UT',
    portalName: 'Rajasthan SJE & SSO Scholarship Portal',
    url: 'https://sje.rajasthan.gov.in',
    keySchemes: 'Chief Minister Higher Education Scholarship, Kalibai Bheel Medhavi Scooty, Uttar Matric SC/ST/OBC/EWS',
    authRequirement: 'Jan Aadhaar Card + SSO ID + Verified Income Update on Jan Aadhaar',
  },
  {
    id: 'bihar-jharkhand',
    region: 'Bihar & Jharkhand',
    scope: 'State & UT',
    portalName: 'PMS Bihar & e-Kalyan Jharkhand',
    url: 'https://pmsonline.bih.nic.in',
    keySchemes: 'Bihar Post-Matric (BC/EBC/SC/ST), Mukhyamantri Kanya Utthan Yojana, e-Kalyan Jharkhand Post-Matric (ekalyan.cgg.gov.in)',
    authRequirement: 'RTPS/JharSewa Digital Caste, Residence & Income Certificates + Bonafide with Fee Structure',
  },
  {
    id: 'tamil-nadu',
    region: 'Tamil Nadu',
    scope: 'State & UT',
    portalName: 'UMIS & Tamil Nadu e-Scholarship Portal',
    url: 'https://umis.tn.gov.in',
    keySchemes: 'Pudhumai Penn (₹1,000/mo), Tamizh Pudhalvan, First Graduate Tuition Waiver, BC/MBC/SC/ST Post-Matric',
    authRequirement: 'EMIS / UMIS Student ID + TN e-Sevai Community & Income Certificates',
  },
  {
    id: 'gujarat',
    region: 'Gujarat',
    scope: 'State & UT',
    portalName: 'Digital Gujarat & MYSY Portal',
    url: 'https://www.digitalgujarat.gov.in',
    keySchemes: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY), Post-Matric SC/ST/SEBC/EBC, Food Bill Assistance',
    authRequirement: 'Digital Gujarat Citizen Profile + Mamlatdar Income Certificate',
  },
  {
    id: 'telangana-ap',
    region: 'Telangana & Andhra Pradesh',
    scope: 'State & UT',
    portalName: 'TS ePASS & AP Jnanabhumi',
    url: 'https://telanganaepass.cgg.gov.in',
    keySchemes: 'RTF/MTF Tuition & Maintenance Reimbursement (TS ePASS), Jagananna Vidya Deevena / Post-Matric (AP)',
    authRequirement: 'MeeSeva Income & Caste Certificate + Biometric Attendance ≥ 75%',
  },
  {
    id: 'kerala',
    region: 'Kerala',
    scope: 'State & UT',
    portalName: 'Kerala e-Grantz 3.0 & DCE Scholarships',
    url: 'https://egrantz.kerala.gov.in',
    keySchemes: 'e-Grantz SC/ST/OEC/OBC, State Merit Scholarship, CH Muhammed Koya Minority Scholarship, Vidyasammunnathi',
    authRequirement: 'Aadhaar OTP + Akshaya/e-District Income & Community Certificates',
  },
  {
    id: 'delhi',
    region: 'Delhi (NCT)',
    scope: 'State & UT',
    portalName: 'e-District Delhi Scholarship Portal',
    url: 'https://edistrict.delhigovt.nic.in',
    keySchemes: 'Merit-cum-Means Linked Financial Assistance (GGSIPU/Delhi Universities), Post-Matric SC/ST/OBC/Minority',
    authRequirement: 'Delhi e-District Citizen ID + Ration Card / SDM Income Certificate',
  },
];

export interface StudentPreset {
  label: string;
  summary: string;
  profile: StudentProfile;
}

export const STUDENT_PRESETS: StudentPreset[] = [
  {
    label: 'B.Tech 2nd Year · Odisha',
    summary: 'Female · OBC-NCL · 84% · ₹2.5–4.5L income',
    profile: {
      educationLevel: 'Undergraduate (UG / B.Tech / B.Sc / BA / B.Com / MBBS)',
      stream: 'Engineering & Technology',
      percentage: 84,
      category: 'OBC (Non-Creamy Layer)',
      state: 'Odisha',
      district: 'Cuttack',
      annualIncome: '₹2.5 Lakh – ₹4.5 Lakh',
      gender: 'Female',
      institutionType: 'Government / Public',
      specialCriteria: ['First-Generation College Student', 'Hosteller (Living Away from Home)'],
      opportunityFocus: 'All Opportunities',
    },
  },
  {
    label: 'Class 12 Science · Maharashtra',
    summary: 'Male · SC · 89% · ₹1–2.5L income',
    profile: {
      educationLevel: 'Class 11–12 (Higher Secondary)',
      stream: 'Pure Sciences & Mathematics',
      percentage: 89,
      category: 'SC (Scheduled Caste)',
      state: 'Maharashtra',
      district: 'Nagpur',
      annualIncome: '₹1 Lakh – ₹2.5 Lakh',
      gender: 'Male',
      institutionType: 'Government-Aided',
      specialCriteria: ['Rural / Non-Metro Domicile'],
      opportunityFocus: 'Merit & Need Scholarships',
    },
  },
  {
    label: 'M.Sc Research · Karnataka',
    summary: 'Female · General-EWS · 81% · Single Girl Child',
    profile: {
      educationLevel: 'Postgraduate (PG / M.Tech / M.Sc / MBA / MA)',
      stream: 'Pure Sciences & Mathematics',
      percentage: 81,
      category: 'General-EWS',
      state: 'Karnataka',
      district: 'Mysuru',
      annualIncome: '₹4.5 Lakh – ₹8 Lakh',
      gender: 'Female',
      institutionType: 'Government / Public',
      specialCriteria: ['Single Girl Child'],
      opportunityFocus: 'Fellowships & Research Grants',
    },
  },
];

export const DEFAULT_PROFILE: StudentProfile = {
  educationLevel: 'Undergraduate (UG / B.Tech / B.Sc / BA / B.Com / MBBS)',
  stream: 'Engineering & Technology',
  percentage: 82,
  category: 'OBC (Non-Creamy Layer)',
  state: 'Maharashtra',
  district: '',
  annualIncome: '₹1 Lakh – ₹2.5 Lakh',
  gender: 'Female',
  institutionType: 'Government / Public',
  specialCriteria: [],
  opportunityFocus: 'All Opportunities',
};
