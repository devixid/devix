import { getSiteSettingsPublic } from "@/lib/queries/site-content";

export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsPublic();

  if (settings?.maintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center">
        <p className="mb-4 text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
          Maintenance
        </p>
        <h1 className="font-display max-w-lg text-3xl font-light text-zinc-100">
          {settings.siteName || "Devix"} is undergoing maintenance
        </h1>
        <p className="mt-4 max-w-md text-sm text-zinc-400">
          {settings.maintenanceMessage ||
            "We are making improvements and will be back shortly."}
        </p>
      </div>
    );
  }

  return children;
}
