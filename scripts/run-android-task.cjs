const { spawnSync } = require("child_process");
const path = require("path");

const mode = process.argv[2];
const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const gradleCommand =
  process.platform === "win32" ? "gradlew.bat" : "./gradlew";

const tasks = {
  dev: [
    {
      command: npxCommand,
      args: ["expo", "prebuild", "--platform", "android", "--clean"],
      env: { APP_VARIANT: "dev" },
    },
    {
      command: npxCommand,
      args: ["expo", "run:android"],
      env: { APP_VARIANT: "dev" },
    },
  ],
  apk: [
    {
      command: process.execPath,
      args: ["./scripts/prepare-android-build.cjs", "apk", "false"],
    },
    {
      command: npxCommand,
      args: ["expo", "prebuild", "--platform", "android"],
      env: { APP_VARIANT: "apk" },
    },
    {
      command: process.execPath,
      args: ["./scripts/configure-android-release-signing.cjs"],
    },
    {
      command: gradleCommand,
      args: ["app:assembleRelease"],
      cwd: androidDir,
      env: { APP_VARIANT: "apk" },
    },
  ],
  beta: [
    {
      command: process.execPath,
      args: ["./scripts/prepare-android-build.cjs", "beta", "true"],
    },
    {
      command: npxCommand,
      args: ["expo", "prebuild", "--platform", "android"],
      env: { APP_VARIANT: "beta" },
    },
    {
      command: process.execPath,
      args: ["./scripts/configure-android-release-signing.cjs"],
    },
    {
      command: gradleCommand,
      args: ["app:bundleRelease"],
      cwd: androidDir,
      env: { APP_VARIANT: "beta" },
    },
  ],
};

function runStep(step) {
  const isWindowsScript =
    process.platform === "win32" &&
    (step.command.endsWith(".cmd") || step.command.endsWith(".bat"));
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd ?? rootDir,
    env: { ...process.env, ...step.env },
    shell: isWindowsScript,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!tasks[mode]) {
  console.error("Usage: node scripts/run-android-task.cjs <dev|apk|beta>");
  process.exit(1);
}

for (const step of tasks[mode]) {
  runStep(step);
}
