# Section Wrapper System

Sistema standardizzato per le sezioni del sito con font Inter, dimensioni consistenti e layout responsive.

## Componenti

### SectionWrapper

Wrapper principale per tutte le sezioni (eccetto Hero e Footer).

**Caratteristiche:**

- Font Inter applicato automaticamente
- Padding verticale standard (py-16)
- Container responsive con max-width
- Classe container per controllo overflow

**Props:**

- `children`: Contenuto della sezione
- `className`: Classi CSS aggiuntive per la sezione
- `containerClassName`: Classi CSS aggiuntive per il container interno
- `id`: ID per anchor links

### SectionHeader

Header standardizzato per titoli e descrizioni delle sezioni.

**Caratteristiche:**

- Dimensioni tipografiche responsive
- Supporto per sottotitolo, titolo principale e descrizione
- Icona opzionale
- Classi personalizzabili per ogni elemento

**Props:**

- `title`: Titolo principale (obbligatorio)
- `subtitle`: Sottotitolo opzionale
- `description`: Descrizione opzionale
- `icon`: Icona React opzionale
- `className`: Classi per il container
- `titleClassName`: Classi per il titolo
- `subtitleClassName`: Classi per il sottotitolo
- `descriptionClassName`: Classi per la descrizione

## Esempi di Utilizzo

### Sezione Standard

```tsx
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";

export function MySection() {
  return (
    <SectionWrapper>
      <SectionHeader
        subtitle="Our Services"
        title="What We Offer"
        description="Comprehensive real estate solutions for all your needs."
      />
      {/* Contenuto della sezione */}
    </SectionWrapper>
  );
}
```

### Sezione con Layout Personalizzato

```tsx
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import { Star } from "lucide-react";

export function CustomSection() {
  return (
    <SectionWrapper className="bg-muted/50">
      <SectionHeader
        subtitle="Featured"
        title="Premium Properties"
        description="Discover our exclusive collection."
        icon={<Star className="w-5 h-5" />}
        className="text-left"
        subtitleClassName="text-left justify-start"
        titleClassName="text-left"
        descriptionClassName="text-left max-w-none"
      />
      {/* Contenuto personalizzato */}
    </SectionWrapper>
  );
}
```

## Dimensioni Tipografiche Standard

### Titoli Principali

- Mobile: `text-3xl` (30px)
- Tablet: `md:text-4xl` (36px)
- Desktop: `lg:text-5xl` (48px)

### Sottotitoli

- Dimensione fissa: `text-sm` (14px)
- Font weight: `font-medium`
- Colore: `text-primary`
- Stile: `uppercase tracking-wide`

### Descrizioni

- Dimensione: `text-lg` (18px)
- Colore: `text-muted-foreground`
- Max width: `max-w-3xl mx-auto`
- Line height: `leading-relaxed`

## Best Practices

1. **Usa sempre SectionWrapper** per sezioni che non sono Hero o Footer
2. **Mantieni consistenza** nelle dimensioni dei titoli
3. **Utilizza SectionHeader** per header standardizzati
4. **Personalizza solo quando necessario** con le prop className
5. **Testa la responsività** su tutti i dispositivi
6. **Usa icone appropriate** per migliorare la UX

## Struttura Consigliata

```tsx
<SectionWrapper>
  <SectionHeader {...headerProps} />

  {/* Contenuto principale */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* Cards o contenuto */}
  </div>

  {/* CTA opzionale */}
  <div className="text-center mt-12">
    <Button>Call to Action</Button>
  </div>
</SectionWrapper>
```
