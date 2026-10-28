import { usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { usePlayUpdatePreferences } from "../../store/storage";
import { playUpdate, type PlayUpdateState } from "./play-update-native";

const pending = 1;
const downloading = 2;
const installing = 3;
const failed = 5;
const canceled = 6;
const downloaded = 11;

export function usePlayUpdate() {
  const focused = usePathname() === "/";
  const { declinedVersion: declined, setDeclinedVersion: setDeclined, announcementAcknowledged } = usePlayUpdatePreferences();
  const [version, setVersion] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [checked, setChecked] = useState(!playUpdate);
  const completing = useRef(false);
  const suppressOffer = useRef(false);
  const lastStatus = useRef(0);

  useEffect(() => {
    if (!focused) {
      suppressOffer.current = false;
    }
  }, [focused]);

  useEffect(() => {
    if (!playUpdate) return;
    const update = playUpdate;
    let active = true;
    const handleStatus = (status: number, state?: PlayUpdateState) => {
      if (!active) return;
      lastStatus.current = status;
      if (status === pending || status === downloading || status === installing || status === downloaded) {
        setBusy(true);
        setVersion(null);
        if (state && state.totalBytes > 0) setProgress(Math.round(100 * state.bytesDownloaded / state.totalBytes));
      }
      if (status === failed || status === canceled) {
        setBusy(false);
        setProgress(null);
        setError(true);
        suppressOffer.current = true;
      }
      if (status === downloaded && !completing.current) {
        completing.current = true;
        void update.complete().catch(() => false).then(success => {
          if (!success && active) {
            completing.current = false;
            setBusy(false);
            setError(true);
          }
        });
      }
    };
    const check = async () => {
      const info = await update.check().catch(() => null);
      if (!active) return;
      setChecked(true);
      if (!info) return;
      handleStatus(info.status);
      if (info.available && info.status !== pending && info.status !== downloading && info.status !== installing && info.status !== downloaded && !suppressOffer.current && String(info.versionCode) !== declined) {
        setError(false);
        setVersion(info.versionCode);
      }
    };
    const subscription = update.addListener("onUpdateState", state => handleStatus(state.status, state));
    if (focused) void check();
    const appState = AppState.addEventListener("change", state => {
      if (state === "active" && focused) void check();
    });
    return () => { active = false; subscription.remove(); appState.remove(); };
  }, [declined, focused]);

  const decline = () => {
    if (version !== null) setDeclined(String(version));
    setVersion(null);
  };
  const start = async () => {
    if (!playUpdate || version === null || starting) return;
    const offeredVersion = version;
    setStarting(true);
    setVersion(null);
    const result = await playUpdate.start().catch(() => "failed" as const);
    setStarting(false);
    if (result === "declined") {
      setDeclined(String(offeredVersion));
      setVersion(null);
      setBusy(false);
      setError(false);
    }
    if (result === "accepted" && lastStatus.current !== failed && lastStatus.current !== canceled) setBusy(true);
    if (result === "failed") { setBusy(false); setError(true); suppressOffer.current = true; }
  };

  return {
    busy: busy || starting || !checked,
    decline,
    error,
    progress,
    showOffer: focused && version !== null && String(version) !== declined && announcementAcknowledged && !busy && !starting,
    start,
  };
}
