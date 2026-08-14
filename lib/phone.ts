// Shared phone-input formatter. Auto-formats to xxx-xxx-xxxx as the user types,
// and detects the common mistake of typing a leading "1" (the US country code)
// before the area code — e.g. "1-555-123-4567" — which would otherwise silently
// truncate the last digit when sliced to 10. We strip the leading 1 and flag it
// so the caller can show an obvious inline notice instead of corrupting the number.
export interface PhoneFormatResult {
  formatted: string;
  hadLeadingOne: boolean;
}

export function formatPhoneInput(raw: string): PhoneFormatResult {
  let digits = raw.replace(/\D/g, "");
  let hadLeadingOne = false;
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
    hadLeadingOne = true;
  }
  digits = digits.slice(0, 10);

  let formatted: string;
  if (digits.length === 0) formatted = "";
  else if (digits.length <= 3) formatted = digits;
  else if (digits.length <= 6) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
  else formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;

  return { formatted, hadLeadingOne };
}

export function formatZipInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 5);
}
