export const Model = {
  Gemini25Pro: "gemini-2.5-pro",
  Gemini25Flash: "gemini-2.5-flash",
  Gemini25FlashPreview092025: "gemini-2.5-flash-preview-09-2025",
  Gemini25FlashLite: "gemini-2.5-flash-lite",
  Gemini25FlashLitePreview092025: "gemini-2.5-flash-lite-preview-09-2025",
} as const;

export type Model = (typeof Model)[keyof typeof Model];
