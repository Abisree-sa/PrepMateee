import { ENV } from '../config/env';

export interface ExtractedStudentInfo {
  fullName: string;
  admissionYear: number;
  deptCode: string;
  deptName: string;
  email: string;
  isValidDomain: boolean;
}

const DEPT_MAP: Record<string, string> = {
  it: 'Information Technology',
  cse: 'Computer Science & Engineering',
  aids: 'Artificial Intelligence & Data Science',
  ece: 'Electronics & Communication Engineering',
  eee: 'Electrical & Electronics Engineering',
  mech: 'Mechanical Engineering',
};

export function parseStudentEmail(email: string): ExtractedStudentInfo | null {
  const cleanEmail = email.trim().toLowerCase();
  const domain = `@${ENV.COLLEGE_DOMAIN.toLowerCase()}`;

  if (!cleanEmail.endsWith(domain)) {
    return null; // Invalid email domain
  }

  const localPart = cleanEmail.replace(domain, '');

  // Pattern match: <name>.<year><dept> or <name_parts><year><dept>
  // Example: abhisree.tm2024it or john2024cse or standard dot formats
  const match = localPart.match(/^([a-z0-9._]+?)(\d{4})([a-z]+)$/i);

  if (match) {
    const rawName = match[1];
    const admissionYear = parseInt(match[2], 10);
    const deptCode = match[3].toLowerCase();

    // Format raw name: "abhisree.tm" -> "Abhisree Tm"
    const fullName = rawName
      .split(/[._]/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const deptName = DEPT_MAP[deptCode] || deptCode.toUpperCase();

    return {
      fullName,
      admissionYear,
      deptCode: deptCode.toUpperCase(),
      deptName,
      email: cleanEmail,
      isValidDomain: true,
    };
  }

  // Fallback for non-standard formats ending with college domain
  const nameParts = localPart.split(/[._\d]/).filter(Boolean);
  const fallbackName = nameParts.length > 0 
    ? nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    : localPart;

  return {
    fullName: fallbackName,
    admissionYear: new Date().getFullYear(),
    deptCode: 'IT',
    deptName: 'Information Technology',
    email: cleanEmail,
    isValidDomain: true,
  };
}
