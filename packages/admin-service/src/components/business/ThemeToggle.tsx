"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AntButton } from "@/components";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // 避免 hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <div className="h-9 w-9">
      <AntButton
        type="text"
        shape="circle"
        size="medium"
        className="relative h-9 w-9 p-0"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={
          <span className="relative flex h-[1.2rem] w-[1.2rem] items-center justify-center">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </span>
        }
      />
    </div>
  );
}
