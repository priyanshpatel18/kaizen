import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
