import { getCurrentUser, getProfile } from "@/lib/data";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile) return <p>Perfil não encontrado.</p>;

  return <SettingsClient profile={profile} />;
}
