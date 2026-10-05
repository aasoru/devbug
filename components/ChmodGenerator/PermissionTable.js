import { Checkbox } from '@/components/ui/checkbox';

const ENTITIES = [
  { key: 'owner', label: 'Owner', short: 'u' },
  { key: 'group', label: 'Group', short: 'g' },
  { key: 'other', label: 'Others', short: 'o' },
];

const BITS = [
  { key: 'read', label: 'Read', value: 4 },
  { key: 'write', label: 'Write', value: 2 },
  { key: 'execute', label: 'Execute', value: 1 },
];

// Read / write / execute for owner, group and others, as a grid of checkboxes.
export function PermissionTable({ perms, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-2xl mx-auto">
        <thead>
          <tr>
            <th className="text-center p-1 sm:p-2" />
            {ENTITIES.map((e) => (
              <th key={e.key} className="text-center p-1 sm:p-2 font-medium">
                {e.label} <span className="whitespace-nowrap">({e.short})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BITS.map((bit) => (
            <tr key={bit.key}>
              <td className="text-center align-middle p-1 sm:p-2 text-sm text-muted-foreground">
                {bit.label} ({bit.value})
              </td>
              {ENTITIES.map((entity) => (
                <td key={entity.key} className="text-center align-middle p-1 sm:p-2">
                  <Checkbox
                    className="h-8 w-8 mx-auto"
                    aria-label={`${entity.label}: ${bit.label.toLowerCase()}`}
                    checked={perms[entity.key][bit.key]}
                    onClick={() => onToggle(entity.key, bit.key)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
