import type { ISpecies } from '../../interfaces/species';

interface Props {
  dataInsights: ISpecies['dataInsights'];
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function SpeciesDataInsights({ dataInsights }: Props) {
  const maxSeasonality = Math.max(...dataInsights.seasonality, 1);

  return (
    <div className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8'>
      <h3 className='text-xl font-bold text-gray-900'>Data Insights</h3>

      <div>
        <p className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-6'>
          12-Month Seasonality
        </p>
        <div className='flex items-end justify-between h-32 gap-1 md:gap-1.5'>
          {dataInsights.seasonality.map((val, idx) => (
            <div
              key={idx}
              className='flex-1 flex flex-col items-center group h-full justify-end'
            >
              <div
                className={`w-full rounded-t-sm transition-all relative ${val > 0 ? 'bg-teal-600 group-hover:bg-teal-500' : 'bg-gray-100'}`}
                style={{
                  height: val > 0 ? `${(val / maxSeasonality) * 100}%` : '5%',
                }}
              >
                <div className='absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'>
                  {val}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase'>
          {MONTHS.map((m, i) => (
            <span
              key={m}
              className={
                dataInsights.seasonality[i] === maxSeasonality
                  ? 'text-teal-600'
                  : ''
              }
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {dataInsights.weather.length > 0 ? (
        <div className='space-y-4'>
          <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>
            Observation Weather
          </p>
          <div className='space-y-3'>
            {dataInsights.weather.map((w) => (
              <div key={w.label} className='space-y-1.5'>
                <div className='flex justify-between text-xs font-bold text-gray-700'>
                  <span>{w.label}</span>
                  <span>{w.percent}%</span>
                </div>
                <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full ${w.color}`}
                    style={{ width: `${w.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className='text-sm text-gray-400 italic'>No weather data yet.</p>
      )}
    </div>
  );
}
