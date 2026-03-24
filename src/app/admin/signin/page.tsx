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
    <div className="min-h-screen bg-aurora flex items-center justify-center px-4">
      <div className="surface-gold-accent w-full max-w-sm p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900">
          <Plane size={28} className="text-sas-gold" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Miles & More Cockpit</h1>
        <p className="mb-6 text-sm text-sas-gray-500">
          Melde dich mit einem freigeschalteten Twitch-Account an, um das Admin-Dashboard zu verwenden.
        </p>

        {errorMessage && (
          <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
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

        <p className="mt-4 text-xs leading-5 text-sas-gray-500">
          Twitch Redirect URL: <span className="font-medium text-sas-gray-600">/api/auth/callback/twitch</span>
        </p>
      </div>
    </div>
  );
}
