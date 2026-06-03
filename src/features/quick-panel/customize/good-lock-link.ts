import * as Linking from "expo-linking";

const goodLockUrls = [
  "https://terrace.goodlocklabs.com/",
  "goodlock://plugin",
] as const;

const samsungStoreUrls = [
  "samsungapps://ProductDetail/com.samsung.android.goodlock",
  "https://apps.samsung.com/appquery/appDetail.as?appId=com.samsung.android.goodlock",
] as const;

export async function openGoodLock(): Promise<boolean> {
  return openFirstAvailableUrl(goodLockUrls);
}

export async function openGoodLockInSamsungStore(): Promise<boolean> {
  return openFirstAvailableUrl(samsungStoreUrls);
}

async function openFirstAvailableUrl(
  urls: readonly string[],
): Promise<boolean> {
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.warn(`Unable to open URL: ${url}`, error);
    }
  }

  return false;
}
