"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye } from "lucide-react";
import { payloadApi } from "@/lib/payload/api-client";
import { toast } from "sonner";
import Image from "next/image";

interface Land {
  id: string;
  name: string;
  description: any;
  area: number;
  areaHectares?: number;
  price: number;
  pricePerSquareMeter?: number;
  landType?: string;
  location: {
    address: string;
    city: string;
    province: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images?: Array<{
    image: {
      id: string;
      url: string;
    };
    alt?: string;
  }>;
  status: 'available' | 'sold' | 'reserved' | 'off-market';
  featured: boolean;
  createdAt: string;
}

export function LandsList() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadLands();
  }, []);

  const loadLands = async () => {
    try {
      setLoading(true);
      const response = await payloadApi.lands.getAll({
        limit: 50,
        sort: '-createdAt'
      });
      setLands(response.docs || []);
    } catch (error) {
      console.error('Error loading lands:', error);
      toast.error('Errore nel caricamento dei terreni');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo terreno?')) return;
    
    try {
      setDeleting(id);
      await payloadApi.lands.delete(id);
      setLands(prev => prev.filter(l => l.id !== id));
      toast.success('Terreno eliminato con successo');
    } catch (error) {
      console.error('Error deleting land:', error);
      toast.error('Errore nell\'eliminazione del terreno');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponibile';
      case 'sold': return 'Venduto';
      case 'reserved': return 'Riservato';
      case 'off-market': return 'Fuori Mercato';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'sold': return 'secondary';
      case 'reserved': return 'outline';
      case 'off-market': return 'destructive';
      default: return 'secondary';
    }
  };

  const getLandTypeLabel = (type?: string) => {
    switch (type) {
      case 'residential': return 'Residenziale';
      case 'commercial': return 'Commerciale';
      case 'agricultural': return 'Agricolo';
      case 'industrial': return 'Industriale';
      case 'recreational': return 'Ricreativo';
      default: return type || 'Non specificato';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (lands.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Nessun terreno trovato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Terreni ({lands.length})</h2>
        <Button onClick={loadLands} variant="outline" size="sm">
          Aggiorna
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lands.map((land) => (
          <Card key={land.id} className="overflow-hidden">
            {land.images && land.images.length > 0 && (
              <div className="relative h-48 w-full">
                <Image
                  src={land.images[0].image.url}
                  alt={land.images[0].alt || land.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{land.name}</CardTitle>
                <div className="flex flex-col gap-1">
                  <Badge variant={getStatusVariant(land.status)}>
                    {getStatusLabel(land.status)}
                  </Badge>
                  {land.featured && (
                    <Badge variant="outline" className="text-xs">
                      In Evidenza
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-green-600">
                  ${land.price.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  {land.location.city}, {land.location.province}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Area:</span> {land.area.toLocaleString()} m²
                </div>
                {land.areaHectares && (
                  <div>
                    <span className="font-medium">Ettari:</span> {land.areaHectares.toFixed(2)}
                  </div>
                )}
                {land.pricePerSquareMeter && (
                  <div>
                    <span className="font-medium">$/m²:</span> ${land.pricePerSquareMeter.toFixed(2)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Tipo:</span> {getLandTypeLabel(land.landType)}
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Creato: {new Date(land.createdAt).toLocaleDateString('it-IT')}
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
                  onClick={() => handleDelete(land.id)}
                  disabled={deleting === land.id}
                >
                  {deleting === land.id ? (
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