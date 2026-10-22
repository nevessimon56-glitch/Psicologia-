import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-teal-800">
          Consultório
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/agendar"
            className="text-sm font-medium text-stone-600 hover:text-teal-700"
          >
            Agendar
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Área da Psicóloga
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
