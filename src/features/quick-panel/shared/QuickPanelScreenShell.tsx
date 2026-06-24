import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { View } from "react-native";

interface QuickPanelScreenShellProps {
  children: ReactNode;
  contentMaxWidth: number;
  footer?: ReactNode;
  footerMaxWidth?: number;
  footerTestID?: string;
  header: ReactNode;
}

export function QuickPanelScreenShell({
  children,
  contentMaxWidth,
  footer,
  footerMaxWidth = contentMaxWidth,
  footerTestID,
  header,
}: QuickPanelScreenShellProps) {
  return (
    <View className="flex-1">
      <View className="px-5 pt-8">
        <View
          className="self-center"
          style={{ maxWidth: contentMaxWidth, width: "100%" }}
        >
          {header}
        </View>
      </View>
      <View className="flex-1 px-5 pb-4">
        <View
          className="flex-1 self-center"
          style={{ maxWidth: contentMaxWidth, width: "100%" }}
        >
          {children}
        </View>
      </View>
      {footer ? (
        <View
          className={cn("border-t border-white/10 px-5")}
          testID={footerTestID}
        >
          <View
            className="self-center"
            style={{ maxWidth: footerMaxWidth, width: "100%" }}
          >
            {footer}
          </View>
        </View>
      ) : null}
    </View>
  );
}
