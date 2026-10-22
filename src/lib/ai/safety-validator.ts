export interface ValidationResult {
  passed: boolean;
  violations: string[];
  safeDraft: string;
}

const FORBIDDEN_REFUND_PATTERNS = [
  /\b(refund|refunds|money back|reimburse|reimbursement|free treatment|free meal|compensation|compensate)\b/i,
  /\b(पैसे वापस|रिफंड|मुफ्त|फ्री|मुआवजा)\b/i,
];

const FORBIDDEN_LIABILITY_PATTERNS = [
  /\b(our fault|we were negligent|our mistake|doctor('s)? fault|staff('s)? fault|admit that we|malpractice|we messed up)\b/i,
  /\b(हमारी गलती|हमारी लापरवाही|डॉक्टर की गलती|स्टाफ की गलती)\b/i,
];

const FORBIDDEN_MEDICAL_CLAIMS = [
  /\b(guaranteed cure|cure 100%|guaranteed results|no pain guaranteed|promise to heal)\b/i,
  /\b(सौ प्रतिशत इलाज|गारंटीड)\b/i,
];

export function validateReplyContent(
  text: string,
  managerPhone?: string,
  managerEmail?: string
): ValidationResult {
  const violations: string[] = [];

  // 1. Check for refund or compensation promises
  for (const pattern of FORBIDDEN_REFUND_PATTERNS) {
    if (pattern.test(text)) {
      violations.push('Blocked: Contains unauthorized refund or financial compensation offer.');
      break;
    }
  }

  // 2. Check for legal liability or admission of fault
  for (const pattern of FORBIDDEN_LIABILITY_PATTERNS) {
    if (pattern.test(text)) {
      violations.push('Blocked: Contains admission of legal fault or negligence.');
      break;
    }
  }

  // 3. Check for unauthorized medical/guarantee claims
  for (const pattern of FORBIDDEN_MEDICAL_CLAIMS) {
    if (pattern.test(text)) {
      violations.push('Blocked: Contains unsubstantiated medical guarantee or claim.');
      break;
    }
  }

  // 4. Check length (must be punchy, under 650 characters)
  if (text.length > 700) {
    violations.push('Warning: Reply is unusually long (>700 characters). Recommended <500 characters.');
  }

  let safeDraft = text;
  // If liability was flagged, enforce de-escalation fallback template
  if (violations.some((v) => v.includes('legal fault') || v.includes('compensation'))) {
    const contactInfo = managerPhone || managerEmail || 'our clinic manager';
    safeDraft = `Thank you for sharing your feedback. We take all patient experiences seriously and adhere to strict clinical care standards. Please reach out directly to ${contactInfo} so we can understand your concerns personally and assist you.`;
  }

  return {
    passed: violations.filter((v) => v.startsWith('Blocked')).length === 0,
    violations,
    safeDraft,
  };
}
