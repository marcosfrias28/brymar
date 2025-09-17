"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import {
  updateProfileAction,
  uploadAvatarAction,
} from "@/lib/actions/profile-actions";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/schemas/profile-schemas";
import { useUser } from "@/hooks/use-user";

export function ProfileForm() {
  const { user } = useUser();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
  });

  // Aggiorna i valori del form quando il profilo viene caricato
  useState(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    if (!user?.id) return;

    try {
      const result = await updateProfileAction(user.id, data);
      
      if (result.success) {
        toast.success(result.message);
        await updateProfile(data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Errore durante l'aggiornamento del profilo");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const result = await uploadAvatarAction(user.id, formData);
      
      if (result.success) {
        toast.success(result.message);
        // Aggiorna l'avatar nel profilo
        if (result.avatarUrl) {
          await updateProfile({ avatar: result.avatarUrl });
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Errore durante l'upload dell'avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profilo</CardTitle>
          <CardDescription>
            Carica una foto per personalizzare il tuo profilo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar} alt={profile?.name} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Caricamento..." : "Carica Foto"}
                  </span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG o GIF. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Profilo</CardTitle>
          <CardDescription>
            Aggiorna le tue informazioni personali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="la-tua-email@esempio.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+39 123 456 7890"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Opzionale. Utilizzato per contatti urgenti.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Località</FormLabel>
                      <FormControl>
                        <Input placeholder="Milano, Italia" {...field} />
                      </FormControl>
                      <FormDescription>
                        La tua città o regione di interesse.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sito Web</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.esempio.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Il tuo sito web personale o professionale.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Raccontaci qualcosa di te..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Una breve descrizione di te stesso (max 500 caratteri).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Salva Modifiche"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}