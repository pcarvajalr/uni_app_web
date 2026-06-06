import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UniversitySelector } from '@/components/admin/UniversitySelector';
import { MapsLocationsTab } from '@/components/admin/config-tabs/MapsLocationsTab';
import { SubjectsTab } from '@/components/admin/config-tabs/SubjectsTab';
import { PartnersTab } from '@/components/admin/config-tabs/PartnersTab';
import { CouponsTab } from '@/components/admin/config-tabs/CouponsTab';

export default function AdminConfigPage() {
  const navigate = useNavigate();
  const [universityId, setUniversityId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Configuración de universidades</h1>
          <p className="text-muted-foreground">
            Selecciona una universidad para gestionar sus maestros.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-2 pt-3">
            <Label>Universidad</Label>
            <UniversitySelector value={universityId} onChange={setUniversityId} />
          </CardContent>
        </Card>

        {!universityId ? (
          <p className="text-center text-muted-foreground py-12">
            Selecciona una universidad para comenzar.
          </p>
        ) : (
          <Tabs defaultValue="maps" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="maps">Mapa y ubicaciones</TabsTrigger>
              <TabsTrigger value="subjects">Materias</TabsTrigger>
              <TabsTrigger value="partners">Aliados</TabsTrigger>
              <TabsTrigger value="coupons">Cupones</TabsTrigger>
            </TabsList>
            <TabsContent value="maps">
              <MapsLocationsTab universityId={universityId} />
            </TabsContent>
            <TabsContent value="subjects">
              <SubjectsTab universityId={universityId} />
            </TabsContent>
            <TabsContent value="partners">
              <PartnersTab universityId={universityId} />
            </TabsContent>
            <TabsContent value="coupons">
              <CouponsTab universityId={universityId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
