"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { Search, Filter, Building2, TreePine } from "lucide-react";
import { useQueryParams } from "@/hooks/use-query-params";

export function SearchNavbar() {
  const { params, setParams } = useQueryParams();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParams({ query: value || null });
  }, [setParams]);

  const searchType = useMemo(() => (params.type === "land" ? "lands" : "properties"), [params.type]);
  const quickLabel = useMemo(() => (searchType === "lands" ? "Terrenos activos" : "Propiedades activas"), [searchType]);

  return (
    <div className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="secondary" className="rounded-full">
              {searchType === "lands" ? <TreePine className="mr-1 h-3 w-3" /> : <Building2 className="mr-1 h-3 w-3" />}
              {quickLabel}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              <Filter className="mr-1 h-3 w-3" />
              Filtros avanzados
            </Badge>
          </div>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={params.query ?? ""}
              onChange={handleChange}
              placeholder={searchType === "lands" ? "Buscar terrenos..." : "Buscar propiedades..."}
              className="pl-9"
            />
          </div>
        </div>

        <AuthButtons />
      </div>

      <div className="mx-auto mt-3 max-w-7xl">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Búsqueda</p>
            <h1 className="font-bold text-xl">Explora {searchType === "lands" ? "terrenos" : "propiedades"} con precisión</h1>
            <p className="text-sm text-muted-foreground">Utiliza el campo de búsqueda y filtros para refinar tus resultados.</p>
          </div>
          <div className="hidden sm:block text-muted-foreground">
            <Search className="h-8 w-8" />
          </div>
        </Card>
      </div>
    </div>
  );
}

