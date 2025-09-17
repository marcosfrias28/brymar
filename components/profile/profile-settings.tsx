"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Bell, Shield, Key, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProfile } from "@/hooks/use-profile";
import {
  updateNotificationPreferencesAction,
  updatePrivacyPreferencesAction,
  changePasswordAction,
} from "@/lib/actions/profile-actions";
import {
  notificationPreferencesSchema,
  privacyPreferencesSchema,
  changePasswordSchema,
  type NotificationPreferencesInput,
  type PrivacyPreferencesInput,
  type ChangePasswordInput,
} from "@/lib/schemas/profile-schemas";
import { useUser } from "@/hooks/use-user";

export function ProfileSettings() {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form per le preferenze di notifica
  const notificationForm = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      email: profile?.preferences.notifications.email ?? true,
      push: profile?.preferences.notifications.push ?? true,
      marketing: profile?.preferences.notifications.marketing ?? false,
    },
  });

  // Form per le preferenze di privacy
  const privacyForm = useForm<PrivacyPreferencesInput>({
    resolver: zodResolver(privacyPreferencesSchema),
    defaultValues: {
      profileVisible: profile?.preferences.privacy.profileVisible ?? true,
      showEmail: profile?.preferences.privacy.showEmail ?? false,
      showPhone: profile?.preferences.privacy.showPhone ?? false,
    },
  });

  // Form per il cambio password
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onNotificationSubmit = async (data: NotificationPreferencesInput) => {
    if (!user?.id) return;

    try {
      const result = await updateNotificationPreferencesAction(user.id, data);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Errore durante l'aggiornamento delle preferenze");
    }
  };

  const onPrivacySubmit = async (data: PrivacyPreferencesInput) => {
    if (!user?.id) return;

    try {
      const result = await updatePrivacyPreferencesAction(user.id, data);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Errore durante l'aggiornamento delle preferenze");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    if (!user?.id) return;

    try {
      const result = await changePasswordAction(user.id, data);

      if (result.success) {
        toast.success(result.message);
        passwordForm.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Errore durante il cambio password");
    }
  };

  const handleDeleteAccount = async () => {
    // Implementazione per l'eliminazione dell'account
    toast.error("Funzionalità non ancora implementata");
    setShowDeleteDialog(false);
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
      {/* Preferenze di Notifica */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Preferenze di Notifica</CardTitle>
          </div>
          <CardDescription>
            Gestisci come e quando ricevere le notifiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationForm}>
            <form
              onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
              className="space-y-6"
            >
              <FormField
                control={notificationForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notifiche Email
                      </FormLabel>
                      <FormDescription>
                        Ricevi notifiche importanti via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notifiche Push
                      </FormLabel>
                      <FormDescription>
                        Ricevi notifiche push sul browser
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="marketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Marketing
                      </FormLabel>
                      <FormDescription>
                        Ricevi offerte speciali e aggiornamenti
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={notificationForm.formState.isSubmitting}
                >
                  {notificationForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Salva Preferenze"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preferenze di Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Preferenze di Privacy</CardTitle>
          </div>
          <CardDescription>
            Controlla la visibilità delle tue informazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...privacyForm}>
            <form
              onSubmit={privacyForm.handleSubmit(onPrivacySubmit)}
              className="space-y-6"
            >
              <FormField
                control={privacyForm.control}
                name="profileVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Profilo Pubblico
                      </FormLabel>
                      <FormDescription>
                        Rendi il tuo profilo visibile agli altri utenti
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={privacyForm.control}
                name="showEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mostra Email</FormLabel>
                      <FormDescription>
                        Permetti agli altri di vedere la tua email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={privacyForm.control}
                name="showPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Mostra Telefono
                      </FormLabel>
                      <FormDescription>
                        Permetti agli altri di vedere il tuo numero
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={privacyForm.formState.isSubmitting}
                >
                  {privacyForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Salva Preferenze"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Cambio Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <CardTitle>Sicurezza</CardTitle>
          </div>
          <CardDescription>
            Aggiorna la tua password per mantenere l'account sicuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Attuale</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Inserisci la password attuale"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuova Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Inserisci la nuova password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      La password deve contenere almeno 8 caratteri.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma Nuova Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Conferma la nuova password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aggiornamento...
                    </>
                  ) : (
                    "Cambia Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Zona Pericolosa */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Zona Pericolosa</CardTitle>
          </div>
          <CardDescription>
            Azioni irreversibili per il tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Elimina Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Elimina permanentemente il tuo account e tutti i dati associati.
                Questa azione non può essere annullata.
              </p>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">Elimina Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sei sicuro?</DialogTitle>
                    <DialogDescription>
                      Questa azione eliminerà permanentemente il tuo account e
                      tutti i dati associati. Non sarà possibile recuperare
                      queste informazioni.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Annulla
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Elimina Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
