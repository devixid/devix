import SettingsPanel from "@/components/admin/SettingsPanel";
import { ExtendedSettingsPanel } from "@/components/admin/ExtendedSettingsPanel";
import { PaymentSettingsPanel } from "@/components/admin/PaymentSettingsPanel";
import {
  getTeamMembers,
  getTeamSlotInfo,
  getNotificationEmailSetting,
  getExtendedSiteSettings,
  getPaymentSettings,
} from "@/actions/admin/settings";

export const metadata = {
  title: "Settings — Devix Operations",
};

export default async function SettingsPage() {
  const [members, slotInfo, notificationEmail, siteSettings, paymentSettings] =
    await Promise.all([
      getTeamMembers(),
      getTeamSlotInfo(),
      getNotificationEmailSetting(),
      getExtendedSiteSettings(),
      getPaymentSettings(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Configuration
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Manage your team and account security.
        </p>
      </div>

      <SettingsPanel
        members={members}
        slotInfo={slotInfo}
        notificationEmailProp={notificationEmail}
      />
      <PaymentSettingsPanel
        activeProvider={paymentSettings.activeProvider}
        stripe={paymentSettings.stripe}
        lemonsqueezy={paymentSettings.lemonsqueezy}
      />
      <ExtendedSettingsPanel settings={siteSettings} />
    </div>
  );
}
