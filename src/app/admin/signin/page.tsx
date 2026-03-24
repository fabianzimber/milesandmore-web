import { Plane } from "lucide-react";
import SASButton from "@/components/ui/SASButton";
import { signIn } from "@/auth";

type AdminSignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Dieser Twitch-Account ist nicht für das Admin-Cockpit freigeschaltet.",
  Configuration: "Login-Konfiguration unvollständig. Redirect-URL und Auth-Secret prüfen.",
  MissingCSRF: "Login konnte nicht gestartet werden. Seite bitte einmal neu laden.",
  OAuthSignin: "Twitch-Login konnte nicht gestartet werden.",
  OAuthCallback: "Twitch-Login konnte nicht abgeschlossen werden.",
};

function getErrorMessage(error: string | string[] | undefined): string | null {
  const normalized = Array.isArray(error) ? error[0] : error;
  if (!normalized) {
    return null;
  }
  return ERROR_MESSAGES[normalized] || "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
}

export default async function AdminSignInPage({ searchParams }: AdminSignInPageProps) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="noise-overlay" />
      <div className="surface-elevated rounded-2xl p-10 text-center max-w-sm relative">
        <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-white/[0.08] mx-auto mb-5 flex items-center justify-center">
          <Plane size={28} className="text-gold-400" />
        </div>
        <h1 className="text-xl font-bold mb-2">Miles & More Cockpit</h1>
        <p className="text-sm text-foreground/40 mb-6">
          Melde dich mit einem freigeschalteten Twitch-Account an, um das Admin-Dashboard zu verwenden.
        </p>

        {errorMessage && (
          <p className="mb-4 rounded-xl border border-mm-destructive/20 bg-mm-destructive/10 px-4 py-3 text-sm font-medium text-mm-destructive">
            {errorMessage}
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("twitch", { redirectTo: "/admin" });
          }}
        >
          <SASButton type="submit" className="w-full">
            Mit Twitch anmelden
          </SASButton>
        </form>

        <p className="mt-4 text-xs leading-5 text-foreground/30">
          Twitch Redirect URL: <span className="font-medium text-foreground/40">/api/auth/callback/twitch</span>
        </p>
      </div>
    </div>
  );
}
