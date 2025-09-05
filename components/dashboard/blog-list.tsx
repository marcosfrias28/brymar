"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye } from "lucide-react";
import { payloadApi } from "@/lib/payload/api-client";
import { toast } from "sonner";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content: any;
  author: {
    id: string;
    name: string;
  };
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
  };
  categories?: string[];
  status: 'draft' | 'review' | 'published';
  publishedDate?: string;
  createdAt: string;
}

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await payloadApi.blogPosts.getAll({
        limit: 50,
        sort: '-createdAt'
      });
      setPosts(response.docs || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast.error('Errore nel caricamento dei post del blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return;
    
    try {
      setDeleting(id);
      await payloadApi.blogPosts.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post eliminato con successo');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Errore nell\'eliminazione del post');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Pubblicato';
      case 'review': return 'In Revisione';
      case 'draft': return 'Bozza';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'review': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Nessun post del blog trovato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Post del Blog ({posts.length})</h2>
        <Button onClick={loadPosts} variant="outline" size="sm">
          Aggiorna
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {post.featuredImage && (
              <div className="relative h-48 w-full">
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <Badge variant={getStatusVariant(post.status)}>
                  {getStatusLabel(post.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {post.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Autore: {post.author?.name || 'Sconosciuto'}
                </span>
              </div>
              
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.categories.slice(0, 2).map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {post.categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.categories.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                Creato: {new Date(post.createdAt).toLocaleDateString('it-IT')}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizza
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                >
                  {deleting === post.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}