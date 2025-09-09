import { BlogForm } from "@/components/blog-form";
import { BlogList } from "@/components/dashboard/blog-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BlogPage() {
  const { language } = useLangStore();
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    author: "",
    dateFrom: "",
    dateTo: "",
  });

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || post.status === filters.status;
    const matchesCategory =
      filters.category === "all" || post.category === filters.category;
    const matchesAuthor =
      !filters.author ||
      post.author.toLowerCase().includes(filters.author.toLowerCase());

    const matchesDate =
      (!filters.dateFrom || post.publishedDate >= filters.dateFrom) &&
      (!filters.dateTo || post.publishedDate <= filters.dateTo);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesAuthor &&
      matchesDate
    );
  });

  const getStatusStats = () => {
    const published = mockPosts.filter((p) => p.status === "published").length;
    const drafts = mockPosts.filter((p) => p.status === "draft").length;
    return { published, drafts, total: mockPosts.length };
  };

  const stats = getStatusStats();

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
