import "react-native-gesture-handler/jestSetup";

const mockMmkvStore = new Map<string, boolean | string>();
(globalThis as typeof globalThis & {
  __mmkvStore?: Map<string, boolean | string>;
}).__mmkvStore = mockMmkvStore;

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getBoolean: (key: string) => {
      const value = mockMmkvStore.get(key);
      return typeof value === "boolean" ? value : undefined;
    },
    getString: (key: string) => {
      const value = mockMmkvStore.get(key);
      return typeof value === "string" ? value : undefined;
    },
    set: (key: string, value: boolean | string) => {
      mockMmkvStore.set(key, value);
    },
  }),
}));

jest.mock("react-native-worklets", () => ({
  createSerializable: <T>(value: T) => value,
  createWorkletRuntime: () => ({}),
  isWorkletFunction: () => false,
  makeShareable: <T>(value: T) => value,
  makeShareableCloneRecursive: <T>(value: T) => value,
  runOnJS:
    <TArgs extends unknown[], TResult>(fn: (...args: TArgs) => TResult) =>
    (...args: TArgs) =>
      fn(...args),
  scheduleOnRN: <TArgs extends unknown[]>(
    fn: (...args: TArgs) => void,
    ...args: TArgs
  ) => fn(...args),
  scheduleOnUI:
    <TArgs extends unknown[]>(fn: (...args: TArgs) => void) =>
    (...args: TArgs) =>
      fn(...args),
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

beforeEach(() => {
  mockMmkvStore.clear();
});
