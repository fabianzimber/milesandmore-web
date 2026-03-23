import CommandsPageClient from "@/components/commands/CommandsPageClient";
import { getCommands } from "@/lib/botApi";

export const dynamic = "force-dynamic";

export default async function CommandsPage() {
  return <CommandsPageClient initialCommands={await getCommands()} />;
}
