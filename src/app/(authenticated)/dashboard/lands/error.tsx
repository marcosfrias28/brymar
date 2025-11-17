"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="font-bold text-2xl">Ha ocurrido un error</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button className="mt-6 rounded-md border px-4 py-2" onClick={reset}>Reintentar</button>
      </div>
    </div>
  );
}

