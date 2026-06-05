import { useQuery } from '@tanstack/react-query';
import { getUniversities } from '@/services/universities.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Selector de universidad reutilizable (solo universidades reales).
 */
export function UniversitySelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="Selecciona una universidad" />
      </SelectTrigger>
      <SelectContent>
        {universities.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
