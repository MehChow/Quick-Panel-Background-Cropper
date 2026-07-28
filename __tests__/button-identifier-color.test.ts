import {
  defaultButtonIdentifierBackgroundTheme,
  defaultButtonIdentifierColor,
  getButtonIdentifierBackgroundColor,
  normalizeButtonIdentifierBackgroundTheme,
  normalizeButtonIdentifierColor,
} from "@/features/quick-panel/customize/button-identifier-color";

describe("button identifier color", () => {
  it.each([
    ["ffffff", "#FFFFFF"],
    ["#1a2b3c", "#1A2B3C"],
    ["  ABCDEF  ", "#ABCDEF"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeButtonIdentifierColor(input)).toBe(expected);
  });

  it.each([undefined, null, "", "#FFF", "#12345678", "#GG0000", 42])(
    "rejects %p",
    (input) => expect(normalizeButtonIdentifierColor(input)).toBeNull(),
  );

  it("defaults to white", () => {
    expect(defaultButtonIdentifierColor).toBe("#FFFFFF");
  });

  it.each([
    ["light", "light"],
    ["dark", "dark"],
    [undefined, null],
    ["auto", null],
  ])("normalizes background theme %p", (input, expected) => {
    expect(normalizeButtonIdentifierBackgroundTheme(input)).toBe(expected);
  });

  it("defaults invalid background themes to dark at the consumer boundary", () => {
    expect(defaultButtonIdentifierBackgroundTheme).toBe("dark");
    expect(getButtonIdentifierBackgroundColor("light")).toBe("#FFFFFF");
    expect(getButtonIdentifierBackgroundColor("dark")).toBe("#666666");
  });
});
