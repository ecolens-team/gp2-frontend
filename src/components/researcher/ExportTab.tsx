import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { api } from '../../lib/axiosConfig';
import SpecializationPicker from '../SpecializationPicker';
import type { Specialization } from '../../services/authService';

const GOVERNORATES = [
  'Ajloun',
  'Amman',
  'Aqaba',
  'Balqa',
  'Irbid',
  'Jerash',
  'Karak',
  'Maan',
  'Madaba',
  'Mafraq',
  'Tafilah',
  'Zarqa',
];

export default function ExportTab() {
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    governorate: '',
    verified_only: false,
  });
  const [taxFilter, setTaxFilter] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);
      if (filters.governorate) params.set('governorate', filters.governorate);
      if (filters.verified_only) params.set('verified_only', 'true');

      // Use first taxonomy filter if set
      if (taxFilter.length > 0) {
        params.set('level', taxFilter[0].level);
        params.set('name', taxFilter[0].name);
      }

      const response = await api.get(
        `/researcher/export/?${params.toString()}`,
        {
          responseType: 'blob',
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ecolens_observations.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white';

  return (
    <div className='max-w-xl space-y-6'>
      <div className='bg-white rounded-2xl border border-gray-100  p-6 space-y-5'>
        <h3 className='font-black text-gray-900'>Export Observations as CSV</h3>
        <p className='text-sm text-gray-500'>
          Download observation records filtered to your criteria. Exported
          columns: observation ID, species, type, confidence, coordinates,
          governorate, weather, date, verified status, observer.
        </p>

        {/* Taxonomy filter */}
        <div>
          <label className='text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2'>
            Filter by Taxonomy
          </label>
          <div className='bg-gray-50 rounded-xl p-4'>
            <SpecializationPicker
              value={taxFilter}
              onChange={setTaxFilter}
              maxItems={1}
            />
            {taxFilter.length === 0 && (
              <p className='text-xs text-gray-400 mt-2'>
                Leave empty to export all species in your specialization domain.
              </p>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs font-bold text-gray-500 block mb-1'>
              From
            </label>
            <input
              type='date'
              value={filters.date_from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, date_from: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className='text-xs font-bold text-gray-500 block mb-1'>
              To
            </label>
            <input
              type='date'
              value={filters.date_to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, date_to: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Governorate */}
        <div>
          <label className='text-xs font-bold text-gray-500 block mb-1'>
            Governorate
          </label>
          <select
            value={filters.governorate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, governorate: e.target.value }))
            }
            className={inputClass}
          >
            <option value=''>All governorates</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Verified only */}
        <label className='flex items-center gap-3 cursor-pointer'>
          <div
            onClick={() =>
              setFilters((f) => ({ ...f, verified_only: !f.verified_only }))
            }
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${filters.verified_only ? 'bg-teal-500' : 'bg-gray-300'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${filters.verified_only ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </div>
          <span className='text-sm font-medium text-gray-700'>
            Verified observations only
          </span>
        </label>

        <button
          onClick={handleExport}
          disabled={loading}
          className='w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2'
        >
          {loading ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <Download size={16} />
          )}
          {loading ? 'Preparing CSV...' : 'Download CSV'}
        </button>
      </div>
    </div>
  );
}
