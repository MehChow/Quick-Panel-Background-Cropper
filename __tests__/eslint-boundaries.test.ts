/** @jest-environment node */
/// <reference types="node" />
import { execFileSync } from "node:child_process";
import path from "node:path";

interface BoundaryCase {
  file: string;
  dependency: string;
  forbidden: boolean;
}

interface LintMessage {
  ruleId: string | null;
  severity: number;
  message: string;
}

const feature = "src/features/quick-panel";
const model = `${feature}/model/types.ts`;
const lifecycle = `${feature}/customize/hooks/useSequentialExportLifecycle.ts`;
const primitive = "src/components/ani-ui/button.tsx";
const cases: BoundaryCase[] = [
  { file: model, dependency: "../store/quick-panel-store", forbidden: true },
  { file: model, dependency: "@/features/quick-panel/store/storage", forbidden: true },
  { file: model, dependency: "../customize/components/ExportSurface", forbidden: true },
  { file: model, dependency: "@/features/quick-panel/calibration/default/hooks/useCalibrationScreen", forbidden: true },
  { file: model, dependency: "../../../components/ani-ui/button", forbidden: true },
  { file: primitive, dependency: "../../features/quick-panel/store/quick-panel-store", forbidden: true },
  { file: primitive, dependency: "@/features/quick-panel/store/selectors", forbidden: true },
  { file: primitive, dependency: "@/features/quick-panel/model/types", forbidden: true },
  { file: lifecycle, dependency: "../../store/quick-panel-store", forbidden: true },
  { file: lifecycle, dependency: "@/features/quick-panel/store/storage", forbidden: true },
  { file: lifecycle, dependency: "./useSequentialExport", forbidden: true },
  { file: lifecycle, dependency: "@/features/quick-panel/customize/hooks/useSequentialExport", forbidden: true },
  { file: lifecycle, dependency: "expo-router", forbidden: true },
  { file: lifecycle, dependency: "expo-router/build/hooks", forbidden: true },
  { file: lifecycle, dependency: "zustand", forbidden: true },
  { file: lifecycle, dependency: "zustand/vanilla", forbidden: true },
  { file: `${feature}/store/quick-panel-defaults.ts`, dependency: "./persistence/calibration-codecs", forbidden: true },
  { file: `${feature}/customize/hooks/useCustomizeActions.ts`, dependency: "@/features/quick-panel/store/persistence/storage-instance", forbidden: true },
  { file: "__tests__/storage.test.ts", dependency: "../src/features/quick-panel/store/persistence/customize-settings-codec", forbidden: true },
  { file: model, dependency: "./button-identifier-color", forbidden: false },
  { file: `${feature}/model/i18n.ts`, dependency: "../../../../i18next/i18next", forbidden: false },
  { file: model, dependency: "@/features/quick-panel/model/button-customize-settings", forbidden: false },
  { file: primitive, dependency: "./text", forbidden: false },
  { file: lifecycle, dependency: "../../model/types", forbidden: false },
  { file: lifecycle, dependency: "../services/export-files", forbidden: false },
  { file: `${feature}/customize/hooks/useSequentialExport.ts`, dependency: "expo-router", forbidden: false },
  { file: `${feature}/store/quick-panel-defaults.ts`, dependency: "../calibration/shared/calibration-preset", forbidden: false },
  { file: `${feature}/store/quick-panel-store.ts`, dependency: "./storage", forbidden: false },
  { file: `${feature}/customize/hooks/useCustomizeActions.ts`, dependency: "@/features/quick-panel/store/storage", forbidden: false },
  { file: `${feature}/store/storage.ts`, dependency: "./persistence/calibration-codecs", forbidden: false },
  { file: `${feature}/store/storage.ts`, dependency: "@/features/quick-panel/store/persistence/storage-instance", forbidden: false },
  { file: `${feature}/store/persistence/calibration-codecs.ts`, dependency: "./customize-settings-codec", forbidden: false },
];

const forms = [
  ["import", (dependency: string) => `import '${dependency}';`],
  ["named re-export", (dependency: string) => `export { boundaryValue } from '${dependency}';`],
  ["namespace re-export", (dependency: string) => `export * as boundary from '${dependency}';`],
  ["star re-export", (dependency: string) => `export * from '${dependency}';`],
] as const;
const fixtures = cases.flatMap((testCase) => forms.map(([form, source]) => ({
  ...testCase, name: `${testCase.forbidden ? "rejects" : "allows"} ${form}: ${testCase.file} -> ${testCase.dependency}`,
  source: source(testCase.dependency),
})));
fixtures.push({ file: model, dependency: "@react-native-vector-icons/lucide", forbidden: false,
  name: "allows the model's type-only Lucide dependency",
  source: "import type { LucideIconName } from '@react-native-vector-icons/lucide'; export type Icon = LucideIconName;" });
fixtures.push({ file: lifecycle, dependency: "../../store/quick-panel-defaults", forbidden: true,
  name: "rejects lifecycle type imports from the store",
  source: "import type { QuickPanelStateData } from '../../store/quick-panel-defaults'; export type State = QuickPanelStateData;" });
fixtures.push({ file: model, dependency: "../store/storage", forbidden: true,
  name: "rejects model type re-exports from the store",
  source: "export type { SavedCalibrations } from '../store/storage';" });
fixtures.push({ file: lifecycle, dependency: "zustand", forbidden: true,
  name: "rejects lifecycle type imports from Zustand",
  source: "export type { StoreApi } from 'zustand';" });

let results: LintMessage[][];
beforeAll(() => {
  // Load the actual flat config in Node, outside Jest's module loader/VM.
  const runner = `
    const { ESLint } = require('eslint');
    const fs = require('node:fs');
    const path = require('node:path');
    (async () => {
      const eslint = new ESLint();
      const fixtures = JSON.parse(fs.readFileSync(0, 'utf8'));
      const results = [];
      for (const fixture of fixtures) {
        const [result] = await eslint.lintText(fixture.source, { filePath: path.resolve(fixture.file) });
        results.push(result.messages);
      }
      process.stdout.write(JSON.stringify(results));
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `;
  results = JSON.parse(execFileSync(process.execPath, ["-e", runner], {
    cwd: path.resolve(__dirname, ".."), input: JSON.stringify(fixtures), encoding: "utf8",
  }));
}, 30000);

test.each(fixtures.map((fixture, index) => ({ ...fixture, index })))("$name", ({ forbidden, index }) => {
  const messages = results[index];
  const boundaryRules = ["import/no-restricted-paths", "no-restricted-imports"];
  expect(messages.filter(({ ruleId, severity }) => severity === 2 && !boundaryRules.includes(ruleId ?? ""))).toEqual([]);
  expect(messages.filter(({ ruleId }) => boundaryRules.includes(ruleId ?? ""))).toHaveLength(forbidden ? 1 : 0);
});
