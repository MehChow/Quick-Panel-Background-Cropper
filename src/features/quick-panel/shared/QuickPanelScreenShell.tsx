import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { View } from "react-native";
import { phoneColumnClassName, phoneFooterClassName } from "./screen-layout";

interface QuickPanelScreenShellProps {
  bodyClassName?: string;
  children: ReactNode;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  footerTestID?: string;
  header: ReactNode;
  headerClassName?: string;
}

export function QuickPanelScreenShell({
  bodyClassName,
  children,
  contentClassName,
  footer,
  footerClassName,
  footerTestID,
  header,
  headerClassName,
}: QuickPanelScreenShellProps) {
  return (
    <View className="flex-1">
      <View className="px-5 pt-8">
        <View
          className={cn(
            "self-center",
            phoneColumnClassName,
            headerClassName,
          )}
        >
          {header}
        </View>
      </View>
      <View className={cn("flex-1 px-5 pb-4", bodyClassName)}>
        <View
          className={cn(
            "flex-1 self-center",
            phoneColumnClassName,
            contentClassName,
          )}
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
            className={cn(
              "self-center",
              phoneFooterClassName,
              footerClassName,
            )}
          >
            {footer}
          </View>
        </View>
      ) : null}
    </View>
  );
}
