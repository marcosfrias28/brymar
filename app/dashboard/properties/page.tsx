import { PropertyForm } from "@/components/property/property-form";
import { PropertiesList } from "@/components/dashboard/properties-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestione Proprietà</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista Proprietà</TabsTrigger>
          <TabsTrigger value="add">Aggiungi Proprietà</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <PropertiesList />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <PropertyForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
