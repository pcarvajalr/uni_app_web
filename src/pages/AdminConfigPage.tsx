import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { UniversitySelector } from '@/components/admin/UniversitySelector';
import { MapsLocationsTab } from '@/components/admin/config-tabs/MapsLocationsTab';
import { SubjectsTab } from '@/components/admin/config-tabs/SubjectsTab';
import { PartnersTab } from '@/components/admin/config-tabs/PartnersTab';
import { CouponsTab } from '@/components/admin/config-tabs/CouponsTab';

export default function AdminConfigPage() {
  const [universityId, setUniversityId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración de universidades</h1>
          <p className="text-muted-foreground">
            Selecciona una universidad para gestionar sus maestros.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <UniversitySelector value={universityId} onChange={setUniversityId} />
          </CardContent>
        </Card>

        {!universityId ? (
          <p className="text-center text-muted-foreground py-12">
            Selecciona una universidad para comenzar.
          </p>
        ) : (
          <Tabs defaultValue="maps" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
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
