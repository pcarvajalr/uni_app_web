import type React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  FEEDBACK_CATEGORIES,
  TUTOR_PARTNER_CATEGORY,
  submitFeedbackMessage,
} from '@/services/contact.service';

const schema = z
  .object({
    category: z.string().min(1, 'Selecciona una categoría'),
    partner: z.string().optional(),
    email: z.string().email('Ingresa un correo válido'),
    phone: z.string().min(7, 'Ingresa un número de celular válido'),
    message: z.string().min(5, 'Escribe tu mensaje'),
  })
  .superRefine((val, ctx) => {
    if (val.category === TUTOR_PARTNER_CATEGORY && !val.partner?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partner'],
        message: 'Indica el nombre del tutor o aliado',
      });
    }
  });

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    category: '',
    partner: '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isTutorPartner = form.category === TUTOR_PARTNER_CATEGORY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((er) => {
        const k = er.path[0] as string;
        if (!errs[k]) errs[k] = er.message;
      });
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const categoryLabel =
        FEEDBACK_CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category;
      await submitFeedbackMessage({
        category: categoryLabel,
        userName: user?.name ?? '',
        partner: isTutorPartner ? form.partner : undefined,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      toast({ title: '¡Gracias!', description: 'Tu mensaje fue enviado al equipo.' });
      setForm((p) => ({ ...p, category: '', partner: '', message: '' }));
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Comentarios y sugerencias</h1>
          <p className="text-muted-foreground text-balance">
            Comparte tu opinión sobre la app, una felicitación, una recomendación sobre
            alguna funcionalidad, o reporta/felicita a un tutor o aliado. Tu mensaje llega
            directo al equipo y te responderemos a tus datos de contacto.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuéntanos</CardTitle>
            <CardDescription>
              Completa el formulario y lo recibiremos al instante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Tipo de mensaje</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((p) => ({ ...p, category: value }))}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              {isTutorPartner && (
                <div className="space-y-2">
                  <Label htmlFor="partner">Tutor o aliado</Label>
                  <Input
                    id="partner"
                    value={form.partner}
                    onChange={(e) => setForm((p) => ({ ...p, partner: e.target.value }))}
                    placeholder="Nombre del tutor o aliado"
                    disabled={loading}
                  />
                  {errors.partner && (
                    <p className="text-sm text-destructive">{errors.partner}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="tucorreo@ejemplo.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Ej: 300 123 4567"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Escribe aquí lo que quieres transmitir..."
                  disabled={loading}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
