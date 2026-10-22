import Link from "next/link";
import { Calendar, Heart, Shield, Video } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { Button } from "@/components/ui/button";
import { getPublicProfile } from "@/lib/data";
import { formatCurrency, formatWhatsAppLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getPublicProfile();

  const name = profile?.full_name || "Dra. Psicóloga";
  const crp = profile?.crp || "00/00000";
  const bio =
    profile?.bio ||
    "Psicóloga clínica com experiência em atendimento humanizado, oferecendo suporte emocional presencial e online para adultos e adolescentes.";
  const specialties = profile?.specialties?.length
    ? profile.specialties
    : ["Ansiedade", "Depressão", "Relacionamentos", "Autoestima"];
  const serviceTypes = profile?.service_types?.length
    ? profile.service_types
    : ["presencial", "online"];
  const whatsapp = profile?.whatsapp || profile?.phone || "";
  const sessionPrice = profile?.session_price || 200;

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <section className="bg-gradient-to-br from-teal-50 via-white to-stone-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-teal-700">CRP {crp}</p>
                <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
                  {name}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-stone-600">{bio}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/agendar">
                    <Button size="lg">
                      <Calendar className="h-5 w-5" />
                      Agendar Consulta
                    </Button>
                  </Link>
                  {whatsapp && (
                    <a
                      href={formatWhatsAppLink(
                        whatsapp,
                        `Olá! Gostaria de mais informações sobre o atendimento com ${name}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="outline">
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-72 w-72 overflow-hidden rounded-2xl bg-teal-100 shadow-xl sm:h-96 sm:w-96">
                  {profile?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photo_url}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-24 w-24 text-teal-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold text-stone-900">Especialidades</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {specialties.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold text-stone-900">Formas de Atendimento</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serviceTypes.includes("presencial") && (
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <Heart className="h-6 w-6 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-stone-900">Presencial</h3>
                  <p className="mt-2 text-sm text-stone-600">
                    Atendimento no consultório em ambiente acolhedor e reservado.
                  </p>
                  {profile?.address && (
                    <p className="mt-3 text-sm text-stone-500">{profile.address}</p>
                  )}
                </div>
              )}
              {serviceTypes.includes("online") && (
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                    <Video className="h-6 w-6 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-stone-900">Online</h3>
                  <p className="mt-2 text-sm text-stone-600">
                    Sessões por videochamada com a mesma qualidade e sigilo do presencial.
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                  <Shield className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="font-semibold text-stone-900">Sigilo Profissional</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Todo atendimento segue o código de ética profissional com total confidencialidade.
                </p>
              </div>
            </div>
            <p className="mt-8 text-center text-stone-600">
              Valor da sessão: <strong>{formatCurrency(sessionPrice)}</strong>
            </p>
          </div>
        </section>

        <section className="bg-teal-800 py-16 text-white">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold">Pronto para começar?</h2>
            <p className="mt-4 text-teal-100">
              Agende sua consulta de forma rápida e segura pelo sistema online.
            </p>
            <Link href="/agendar" className="mt-8 inline-block">
              <Button size="lg" variant="secondary">
                Agendar Agora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
          <p>
            {name} — CRP {crp}
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
