import * as i18nextModule from "../i18next/i18next";

describe("startup language resolution", () => {
  it.each([
    ["es", "es"],
    ["zh", "zh"],
    ["en", "en"],
    ["fr", "en"],
    [undefined, "en"],
    [null, "en"],
  ])("resolves %p to %s", (languageCode, expected) => {
    const resolveLanguage = Reflect.get(i18nextModule, "resolveLanguage") as
      | ((value: string | null | undefined) => string)
      | undefined;
    expect(resolveLanguage).toBeDefined();
    expect(resolveLanguage?.(languageCode)).toBe(expected);
  });
});
