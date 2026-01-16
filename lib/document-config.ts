export const documentConfig: Record<string, {
  key: string;
  title: string;
  description: string;
  fieldName: string;
}> = {
  PASSPORT_COPY: {
    key: 'passport',
    title: 'Passport Copy',
    description: 'Bio-data page',
    fieldName: 'passportCopyUrl',
  },
  PASSPORT_PHOTO: {
    key: 'photo',
    title: 'Passport Photo',
    description: 'Recent passport photo (2x2 inches)',
    fieldName: 'photoUrl',
  },
  BIRTH_CERTIFICATE: {
    key: 'birthCertificate',
    title: 'Birth Certificate',
    description: 'Official birth certificate',
    fieldName: 'birthCertificateUrl',
  },
  SHS_TRANSCRIPT: {
    key: 'transcript',
    title: 'High School Transcript',
    description: 'Official academic transcript',
    fieldName: 'transcriptUrl',
  },
  UNIVERSITY_TRANSCRIPT: {
    key: 'transcript',
    title: 'University Transcript',
    description: 'Official academic transcript',
    fieldName: 'transcriptUrl',
  },
  WASSCE_RESULT: {
    key: 'wassce',
    title: 'WASSCE Results',
    description: 'Certificate results',
    fieldName: 'wassceUrl',
  },
  MEDICAL_CERTIFICATE: {
    key: 'medicalResults',
    title: 'Medical Results',
    description: 'Medical certificate',
    fieldName: 'medicalResultsUrl',
  },
  CV_RESUME: {
    key: 'cv',
    title: 'CV / Resume',
    description: 'Your curriculum vitae',
    fieldName: 'additional',
  },
  STATEMENT_OF_PURPOSE: {
    key: 'sop',
    title: 'Statement of Purpose',
    description: 'Your motivation letter',
    fieldName: 'additional',
  },
  ACADEMIC_REFERENCE_LETTER: {
    key: 'reference',
    title: 'Reference Letter',
    description: 'An academic reference',
    fieldName: 'additional',
  },
  FINANCIAL_GUARANTEE: {
    key: 'financials',
    title: 'Financial Guarantee',
    description: 'Proof of funds',
    fieldName: 'additional',
  },
  BECE_RESULT: {
    key: 'bece',
    title: 'BECE Result',
    description: 'Basic Education Certificate Examination results',
    fieldName: 'additional',
  },
  DEGREE_CERTIFICATE: {
    key: 'degree',
    title: 'Degree Certificate',
    description: 'Your university degree certificate',
    fieldName: 'additional',
  },
  // Add other types as needed
};
