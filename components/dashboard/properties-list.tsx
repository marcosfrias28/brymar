"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye } from "lucide-react";
import { payloadApi } from "@/lib/payload/api-client";
import { toast } from "sonner";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  address: string;
  city: string;
  province: string;
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  status: 'draft' | 'published';
  createdAt: string;
}

export function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await payloadApi.properties.getAll({
        limit: 50,
        sort: '-createdAt'
      });
      setProperties(response.docs || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Errore nel caricamento delle proprietà');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa proprietà?')) return;
    
    try {
      setDeleting(id);
      await payloadApi.properties.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Proprietà eliminata con successo');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Errore nell\'eliminazione della proprietà');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Nessuna proprietà trovata</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Proprietà Esistenti ({properties.length})</h2>
        <Button onClick={loadProperties} variant="outline" size="sm">
          Aggiorna
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            {property.images && property.images.length > 0 && (
              <div className="relative h-48 w-full">
                <Image
                  src={property.images[0].url}
                  alt={property.images[0].alt || property.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                <Badge variant={property.status === 'published' ? 'default' : 'secondary'}>
                  {property.status === 'published' ? 'Pubblicata' : 'Bozza'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
              
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-green-600">
                  ${property.price.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  {property.city}, {property.province}
                </span>
              </div>
              
              {(property.bedrooms || property.bathrooms || property.area) && (
                <div className="flex gap-4 text-sm text-gray-600">
                  {property.bedrooms && <span>{property.bedrooms} camere</span>}
                  {property.bathrooms && <span>{property.bathrooms} bagni</span>}
                  {property.area && <span>{property.area} m²</span>}
                </div>
              )}
              
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
                  onClick={() => handleDelete(property.id)}
                  disabled={deleting === property.id}
                >
                  {deleting === property.id ? (
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