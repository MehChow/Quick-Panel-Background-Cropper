import { useEffect, useRef } from "react";
import type { PickedImage } from "../model/types";
import { deleteOwnedCacheUris } from "./cache-files";

export interface OwnedImageCache {
  release: (image: PickedImage | null) => void;
  track: (image: PickedImage | null) => void;
}

export function useOwnedImageCache(): OwnedImageCache {
  const trackedUris = useRef<Set<string>>(new Set());

  const track = (image: PickedImage | null) => {
    for (const uri of image?.ownedCacheUris ?? []) {
      trackedUris.current.add(uri);
    }
  };

  const release = (image: PickedImage | null) => {
    const uris = (image?.ownedCacheUris ?? []).filter((uri) => {
      if (!trackedUris.current.has(uri)) {
        return false;
      }
      trackedUris.current.delete(uri);
      return true;
    });
    if (uris.length > 0) {
      deleteOwnedCacheUris(uris, { action: "cleanup_owned_image" });
    }
  };

  useEffect(() => () => {
    const uris = [...trackedUris.current];
    trackedUris.current.clear();
    if (uris.length > 0) {
      deleteOwnedCacheUris(uris, { action: "cleanup_owned_image" });
    }
  }, []);

  return { release, track };
}
