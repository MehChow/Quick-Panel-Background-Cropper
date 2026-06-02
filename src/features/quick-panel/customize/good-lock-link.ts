import * as Linking from "expo-linking";

const goodLockUrls = [
  "https://terrace.goodlocklabs.com/",
  "goodlock://plugin",
] as const;

export async function openGoodLock(): Promise<boolean> {
  for (const url of goodLockUrls) {
    try {
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.warn(`Unable to open Good Lock URL: ${url}`, error);
    }
  }

  return false;
}
