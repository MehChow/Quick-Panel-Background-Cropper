import { requireOptionalNativeModule } from "expo";

export interface PlayUpdateInfo {
  available: boolean;
  versionCode: number;
  status: number;
}

export interface PlayUpdateState {
  status: number;
  bytesDownloaded: number;
  totalBytes: number;
}

interface PlayUpdateModule {
  check(): Promise<PlayUpdateInfo | null>;
  start(): Promise<"accepted" | "declined" | "failed">;
  complete(): Promise<boolean>;
  addListener(event: "onUpdateState", listener: (state: PlayUpdateState) => void): { remove(): void };
}

export const playUpdate = requireOptionalNativeModule<PlayUpdateModule>("PlayUpdate");
