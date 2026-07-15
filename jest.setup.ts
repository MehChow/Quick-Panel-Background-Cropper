import "react-native-gesture-handler/jestSetup";

process.env.EXPO_OS = "web";

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: jest.fn(),
  writable: true,
});

const mockMmkvStore = new Map<string, boolean | string>();
const mockMmkvListeners = new Set<(key: string) => void>();
(globalThis as typeof globalThis & {
  __mmkvStore?: Map<string, boolean | string>;
}).__mmkvStore = mockMmkvStore;

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

jest.mock("react-native-mmkv", () => {
  const React = require("react");
  const getString = (key: string) => {
    const value = mockMmkvStore.get(key);
    return typeof value === "string" ? value : undefined;
  };

  const getBoolean = (key: string) => {
    const value = mockMmkvStore.get(key);
    return typeof value === "boolean" ? value : undefined;
  };

  const notifyListeners = (key: string) => {
    mockMmkvListeners.forEach((listener) => listener(key));
  };

  const instance = {
    addOnValueChangedListener: (listener: (key: string) => void) => {
      mockMmkvListeners.add(listener);
      return {
        remove: () => {
          mockMmkvListeners.delete(listener);
        },
      };
    },
    getBoolean,
    getString,
    remove: (key: string) => {
      mockMmkvStore.delete(key);
      notifyListeners(key);
    },
    set: (key: string, value: boolean | string) => {
      mockMmkvStore.set(key, value);
      notifyListeners(key);
    },
  };

  const useMMKVString = (key: string) => {
    const value = React.useSyncExternalStore(
      React.useCallback((onStoreChange: () => void) => {
        const subscription = instance.addOnValueChangedListener((changedKey) => {
          if (changedKey === key) {
            onStoreChange();
          }
        });
        return () => subscription.remove();
      }, [key]),
      React.useCallback(() => getString(key), [key]),
      React.useCallback(() => getString(key), [key]),
    );

    return [
      value,
      (nextValue: string | undefined) => {
        if (nextValue === undefined) {
          instance.remove(key);
          return;
        }
        instance.set(key, nextValue);
      },
    ] as const;
  };

  return {
    createMMKV: () => instance,
    useMMKVString,
  };
});

jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/src/mock"),
);

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

beforeEach(() => {
  mockMmkvStore.clear();
  mockMmkvListeners.clear();
});
