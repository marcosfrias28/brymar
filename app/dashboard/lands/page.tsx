import { LandForm } from "@/components/land-form";
import { LandsList } from "@/components/dashboard/lands-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestione Terreni</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista Terreni</TabsTrigger>
          <TabsTrigger value="add">Aggiungi Terreno</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <LandsList />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <LandForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
