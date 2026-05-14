import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FlaskConical,
  Inbox,
  ShieldAlert,
  Microscope,
  Trophy,
  MapPin,
} from 'lucide-react';
import { api } from '../../lib/axiosConfig';
import type { IAuthUser } from '../../interfaces/auth';
import type { Specialization } from '../../services/authService';
import SpeciesMapTab from '../species/SpeciesMapTab';

interface ResearcherStats {
  queue_count: number;
  reports_count: number;
  alerts_count: number;
  active_quests_count: number;
}

interface AlertData {
  id: number;
  species_name: string | null;
  flags: string[];
  governorate: string | null;
  timestamp: string;
  thumbnail: string | null;
  longitude: number | null;
  latitude: number | null;
}

const STATUS_CONFIG = {
  APPROVED: {
    label: 'Approved',
    color: 'bg-teal-100 text-teal-700',
    icon: <CheckCircle size={14} />,
  },
  PENDING: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock size={14} />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: <AlertCircle size={14} />,
  },
};

function ResearcherProfile({ authUser }: { authUser: IAuthUser }) {
  const { data: specializations = [] } = useQuery<Specialization[]>({
    queryKey: ['my-specializations'],
    queryFn: () => api.get('/me/specializations/').then((r) => r.data),
  });

  const profile = authUser.researcher_profile;
  const appStatus = (profile?.application_status ??
    'PENDING') as keyof typeof STATUS_CONFIG;
  const statusCfg = STATUS_CONFIG[appStatus];

  return (
    <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6 flex items-start gap-6'>
      <div className='w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0'>
        <FlaskConical className='text-teal-600' size={32} />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-3 flex-wrap'>
          <h2 className='text-xl font-black text-gray-900'>
            {authUser.first_name} {authUser.last_name}
          </h2>
          <span
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.color}`}
          >
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
        <p className='text-sm text-gray-500 mt-0.5'>@{authUser.username}</p>
        {profile?.institute && (
          <p className='text-sm text-gray-600 mt-1 font-medium'>
            {profile.institute}
          </p>
        )}
        {specializations.length > 0 ? (
          <div className='flex flex-wrap gap-1.5 mt-3'>
            {specializations.map((s) => (
              <span
                key={s.id}
                className='bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full'
              >
                <span className='text-teal-400'>
                  {s.level[0] + s.level.slice(1).toLowerCase()}:{' '}
                </span>
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className='text-xs text-gray-400 mt-2 italic'>
            No specializations set — add them to get a personalized verification
            queue.
          </p>
        )}
      </div>
    </div>
  );
}

export default function OverviewTab({
  authUser,
  onNavigate,
}: {
  authUser: IAuthUser;
  onNavigate: (tab: string) => void;
}) {
  const { data: stats } = useQuery<ResearcherStats>({
    queryKey: ['researcher-stats'],
    queryFn: () => api.get('/researcher/stats/').then((r) => r.data),
  });
  const { data: alerts } = useQuery<AlertData[]>({
    queryKey: ['researcher-alerts'],
    queryFn: () => api.get('/researcher/alerts/').then((r) => r.data),
  });

  const appStatus = (authUser.researcher_profile?.application_status ??
    'PENDING') as keyof typeof STATUS_CONFIG;
  const isApproved = appStatus === 'APPROVED';

  return (
    <div className='grid grid-cols-3 gap-8 w-full'>
      <div className='col-span-2 space-y-8'>
        <ResearcherProfile authUser={authUser} />

        {!isApproved && (
          <div className='bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3'>
            <AlertCircle className='text-amber-500 shrink-0 mt-0.5' size={20} />
            <div>
              <p className='font-bold text-amber-800'>
                Application under review
              </p>
              <p className='text-sm text-amber-700 mt-0.5'>
                Your researcher application is {appStatus.toLowerCase()}. Full
                dashboard access will be enabled once an admin approves your
                application.
              </p>
            </div>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4'>
          <ActionCard
            icon={<Microscope size={20} />}
            label='Verification Queue'
            count={stats?.queue_count}
            description='Observations awaiting your review'
            onClick={() => onNavigate('speciesVerification')}
            disabled={!isApproved}
            accent={!!stats?.queue_count}
            accentColor='amber'
          />
          <ActionCard
            icon={<Inbox size={20} />}
            label='Reports Inbox'
            count={stats?.reports_count}
            description='User-submitted label reports'
            onClick={() => onNavigate('speciesVerification')}
            disabled={!isApproved}
            accent={!!stats?.reports_count}
            accentColor='amber'
          />
          <ActionCard
            icon={<Trophy size={20} />}
            label='Active Quests'
            count={stats?.active_quests_count}
            description='Ongoing data collection drives'
            onClick={() => onNavigate('quests')}
            disabled={!isApproved}
            accentColor='teal'
          />
          <ActionCard
            icon={<ShieldAlert size={20} />}
            label='Alerts'
            count={stats?.alerts_count}
            description='Endangered/invasive sightings (7d)'
            onClick={() => onNavigate('speciesInsights')}
            disabled={!isApproved}
            accent={!!stats?.alerts_count}
            accentColor='red'
          />
        </div>
      </div>

      <div className='col-span-1'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-5 h-full min-h-[450px] flex flex-col'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <MapPin className='text-amber-500' size={18} />
              <h3 className='font-bold text-gray-900 text-sm'>Alerts Map</h3>
            </div>
            <span className='text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg'>
              Last 7 Days
            </span>
          </div>
          <div className='flex-1 rounded-xl overflow-hidden border border-gray-200'>
            {alerts && alerts.length > 0 ? (
              <SpeciesMapTab
                markers={alerts}
                markerColor='rgb(239, 68, 68)'
                className='w-full h-full'
              />
            ) : (
              <div className='w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2'>
                <ShieldAlert size={32} className='opacity-30' />
                <p className='text-xs font-medium'>No alerts this week</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACCENT_COLORS = {
  amber: {
    border: 'border-l-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'bg-amber-50 text-amber-600',
  },
  red: {
    border: 'border-l-red-400',
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: 'bg-red-50 text-red-600',
  },
  teal: {
    border: 'border-l-teal-400',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    icon: 'bg-teal-50 text-teal-600',
  },
};

function ActionCard({
  icon,
  label,
  count,
  description,
  onClick,
  disabled,
  accent,
  accentColor = 'teal',
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  accentColor?: keyof typeof ACCENT_COLORS;
}) {
  const colors = ACCENT_COLORS[accentColor];
  const hasCount = count !== undefined && count > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left bg-white rounded-2xl border shadow-none p-6 transition-all border-l-4
        ${disabled ? 'opacity-40 cursor-not-allowed border-l-gray-200' : `hover:shadow-xs cursor-pointer ${accent ? colors.border : 'border-l-gray-200 hover:border-l-teal-300'}`}
        ${accent ? 'border-amber-100' : 'border-gray-200'}`}
    >
      <div className='flex items-start justify-between mb-4'>
        <p
          className={`text-5xl font-black leading-none ${hasCount && accent ? colors.text : 'text-gray-900'}`}
        >
          {count !== undefined ? count.toLocaleString() : '—'}
        </p>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? colors.icon : 'bg-gray-100 text-gray-500'}`}
        >
          {icon}
        </div>
      </div>
      <p className='text-sm font-bold text-gray-600 uppercase tracking-wider'>
        {label}
      </p>
      <p className='text-xs text-gray-400 mt-1'>{description}</p>
      {accent && hasCount && (
        <span
          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${colors.badge}`}
        >
          Needs attention
        </span>
      )}
    </button>
  );
}
