// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

const quickPanel = "./src/features/quick-panel";
const persistence = `${quickPanel}/store/persistence`;
const lifecycle = `${quickPanel}/customize/hooks/useSequentialExportLifecycle.ts`;
const zones = [
  {
    target: `${quickPanel}/model`,
    from: quickPanel,
    except: ["./model"],
    message: "The model must stay independent of feature UI, controllers and state.",
  },
  {
    target: `${quickPanel}/model`,
    from: ["./src/components", "./src/app"],
    message: "The model must stay independent of UI and app entry points.",
  },
  {
    target: "./src/components/ani-ui",
    from: quickPanel,
    message: "AniUI primitives must stay independent of Quick Panel.",
  },
  {
    target: lifecycle,
    from: [`${quickPanel}/store`, `${quickPanel}/customize/hooks/useSequentialExport.ts`],
    message: "Export lifecycle dependencies must be supplied through its interface.",
  },
];
const restrictedPaths = (restrictedZones) => [
  "error", { basePath: __dirname, zones: restrictedZones },
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: { project: require("node:path").join(__dirname, "tsconfig.json") },
      },
    },
    rules: { "import/no-restricted-paths": restrictedPaths(zones) },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    ignores: [`${persistence.slice(2)}/**`, `${quickPanel.slice(2)}/store/storage.ts`],
    rules: {
      "import/no-restricted-paths": restrictedPaths([...zones, {
        target: ".",
        from: persistence,
        message: "Use the storage facade instead of persistence internals.",
      }]),
    },
  },
  {
    files: [lifecycle.slice(2)],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["expo-router", "expo-router/**", "zustand", "zustand/**"],
          message: "Keep navigation and state integration in the export wrapper.",
        }],
      }],
    },
  },
]);
