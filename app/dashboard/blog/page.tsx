import { BlogForm } from "@/components/blog-form";
import { BlogList } from "@/components/dashboard/blog-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestione Blog</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista Post</TabsTrigger>
          <TabsTrigger value="add">Aggiungi Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <BlogList />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <BlogForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
