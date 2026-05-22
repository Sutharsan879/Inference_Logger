const patterns = [
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi, label: '[EMAIL]' },
  { regex: /(\+?\d[\d\s\-().]{7,}\d)/g, label: '[PHONE]' },
  { regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, label: '[CARD]' },
  { regex: /\b\d{3}-\d{2}-\d{4}\b/g, label: '[SSN]' },
];

export const piiRedactor = {
  redact: (text: string): string =>
    patterns.reduce((t, { regex, label }) => t.replace(regex, label), text),
};
