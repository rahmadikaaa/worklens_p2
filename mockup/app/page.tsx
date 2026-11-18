import { AppProvider } from "@/lib/app-state";
import { Shell } from "@/components/Shell";

export default function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
