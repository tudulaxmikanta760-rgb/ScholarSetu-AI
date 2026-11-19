export type EducationLevel =
  | 'Class 9–10 (Pre-Matric)'
  | 'Class 11–12 (Higher Secondary)'
  | 'Diploma / ITI / Polytechnic'
  | 'Undergraduate (UG / B.Tech / B.Sc / BA / B.Com / MBBS)'
  | 'Postgraduate (PG / M.Tech / M.Sc / MBA / MA)'
  | 'PhD / Doctoral / Research';

export type AcademicStream =
  | 'General / All Streams'
  | 'Engineering & Technology'
  | 'Medical, Pharmacy & Allied Health'
  | 'Pure Sciences & Mathematics'
  | 'Commerce, Finance & Management'
  | 'Arts, Humanities & Social Sciences'
  | 'Law & Public Policy'
  | 'Agriculture & Veterinary'
  | 'Vocational, ITI & Skilled Trades';

export type SocialCategory =
  | 'General'
  | 'General-EWS'
  | 'OBC (Non-Creamy Layer)'
  | 'SC (Scheduled Caste)'
  | 'ST (Scheduled Tribe)'
  | 'Minority Community (Muslim / Christian / Sikh / Buddhist / Jain / Parsi)';

export type IncomeBracket =
  | 'Below ₹1 Lakh'
  | '₹1 Lakh – ₹2.5 Lakh'
  | '₹2.5 Lakh – ₹4.5 Lakh'
  | '₹4.5 Lakh – ₹8 Lakh'
  | 'Above ₹8 Lakh';

export type GenderOption = 'Female' | 'Male' | 'Non-Binary / Transgender';

export type OpportunityFocus =
  | 'All Opportunities'
  | 'Merit & Need Scholarships'
  | 'Fellowships & Research Grants'
  | 'Government Internships & Skill Programs'
  | 'Overseas Study Grants';

export interface StudentProfile {
  educationLevel: EducationLevel;
  stream: AcademicStream;
  percentage: number;
  category: SocialCategory;
  state: string;
  district: string;
  annualIncome: IncomeBracket;
  gender: GenderOption;
  institutionType: 'Government / Public' | 'Government-Aided' | 'Private Recognized';
  specialCriteria: string[];
  opportunityFocus: OpportunityFocus;
}

export interface EligibilityCriterion {
  criterion: string;
  requirement: string;
  studentStatus: string;
  verdict: 'Met' | 'Verify' | 'Action Needed';
}

export interface DocumentItem {
  id: string;
  name: string;
  issuingAuthority: string;
  mandatory: boolean;
  formatNote: string;
  tip: string;
}

export interface ScholarshipOpportunity {
  id: string;
  name: string;
  provider: string;
  scope: 'Central' | 'State' | 'Fellowship' | 'Skill & Internship';
  opportunityType: string;
  benefitAmount: string;
  applicationWindow: string;
  officialPortalName: string;
  officialPortalUrl: string;
  eligibilityVerdict: 'Strong Match' | 'Likely Eligible' | 'Conditional';
  whyItFits: string;
  eligibilityBreakdown: EligibilityCriterion[];
  stepByStepProcess: string[];
  documents: DocumentItem[];
  commonPitfalls: string[];
}

export interface MasterDocument {
  id: string;
  name: string;
  issuingAuthority: string;
  usedBySchemes: string[];
  priority: 'Core Foundation' | 'Category & Income' | 'Academic & Institution';
  preparationTip: string;
}

export interface DiscoveryResult {
  profileSummary: string;
  recommendedStrategy: string;
  opportunities: ScholarshipOpportunity[];
  masterChecklist: MasterDocument[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LiveVerificationResult {
  summary: string;
  sources: GroundingSource[];
  verifiedAt: string;
}

export interface EligibilityQAItem {
  question: string;
  answer: string;
}
