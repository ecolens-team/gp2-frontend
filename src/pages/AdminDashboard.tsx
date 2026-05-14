import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axiosConfig';
import {
  Users,
  FlaskConical,
  Eye,
  Leaf,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import ResearchersTable from '../components/admin/Table';
import UsersTable from '../components/admin/UsersTable';
import QuestsTable from '../components/admin/QuestsTable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AdminStats {
  researchers: { approved: number; pending: number };
  quests: { total: number; pending: number; active: number; completed: number };
  users: { total: number };
  observations: { total: number };
  species: {
    total: number;
    with_observations: number;
    without_observations: number;
  };
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center px-4 py-2 rounded-lg ${accent ? 'bg-amber-50' : 'bg-gray-50'}`}
    >
      <span
        className={`text-sm font-medium ${accent ? 'text-amber-700' : 'text-gray-500'}`}
      >
        {label}
      </span>
      <span
        className={`text-lg font-black ${accent ? 'text-amber-600' : 'text-gray-800'}`}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function SimpleCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6 flex items-center gap-4'>
      <div className='w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0'>
        {icon}
      </div>
      <div>
        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
          {label}
        </p>
        <p className='text-3xl font-black text-gray-900'>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

const Cards = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats/').then((r) => r.data),
  });

  const { data: obsOverTime = [] } = useQuery<
    { month: string; count: number }[]
  >({
    queryKey: ['admin-obs-over-time'],
    queryFn: () =>
      api.get('/admin/stats/observations-over-time/').then((r) => r.data),
  });

  if (isLoading)
    return (
      <div className='space-y-6 animate-pulse'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='h-48 bg-gray-100 rounded-2xl' />
          <div className='h-48 bg-gray-100 rounded-2xl' />
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-24 bg-gray-100 rounded-2xl' />
          ))}
        </div>
      </div>
    );

  if (!stats) return null;

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6 flex flex-col gap-4'>
          <div className='flex gap-4 flex-1'>
            <div className='flex-1 flex flex-col justify-center gap-1 items-center'>
              <div className='flex items-center gap-2'>
                <FlaskConical className='text-teal-600' size={40} />
                <h3 className='font-black text-2xl text-gray-900'>
                  Researchers
                </h3>
              </div>
              {stats.researchers.pending > 0 ? (
                <span className='flex items-center gap-1 text-sm font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full w-fit mt-1'>
                  <AlertCircle size={22} /> {stats.researchers.pending} pending
                </span>
              ) : (
                <span className='text-xs text-gray-400 mt-1'>
                  No pending applications
                </span>
              )}
            </div>
            <div className='flex-1 space-y-2 flex flex-col justify-between'>
              <div className='space-y-2'>
                <StatPill label='Approved' value={stats.researchers.approved} />
                <StatPill
                  label='Pending'
                  value={stats.researchers.pending}
                  accent={stats.researchers.pending > 0}
                />
              </div>
              <button
                onClick={() => onNavigate('researchers')}
                className='w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors'
              >
                Review Applications →
              </button>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6 flex flex-col gap-4'>
          <div className='flex gap-4 flex-1'>
            <div className='flex-1 flex flex-col justify-center gap-1 items-center'>
              <div className='flex items-center gap-2'>
                <Trophy className='text-teal-600' size={40} />
                <h3 className='font-black text-2xl text-gray-900'>Quests</h3>
              </div>
              {stats.quests.pending > 0 ? (
                <span className='flex items-center gap-1 text-sm font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full w-fit mt-1'>
                  <AlertCircle size={22} /> {stats.quests.pending} pending
                </span>
              ) : (
                <span className='text-xs text-gray-400 mt-1'>
                  No pending quests
                </span>
              )}
            </div>
            <div className='flex-1 space-y-2 flex flex-col justify-between'>
              <div className='space-y-2'>
                <StatPill label='Active' value={stats.quests.active} />
                <StatPill
                  label='Pending'
                  value={stats.quests.pending}
                  accent={stats.quests.pending > 0}
                />
                <StatPill label='Completed' value={stats.quests.completed} />
              </div>
              <button
                onClick={() => onNavigate('quests')}
                className='w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors'
              >
                Manage Quests →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <SimpleCard
          icon={<Users size={22} />}
          label='Total users'
          value={stats.users.total}
        />
        <SimpleCard
          icon={<Eye size={22} />}
          label='Observations'
          value={stats.observations.total}
        />
        <SimpleCard
          icon={<Leaf size={22} />}
          label='Total species'
          value={stats.species.total}
        />
        <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6 flex flex-col justify-between'>
          <div className='flex items-center gap-2 mb-3'>
            <Leaf className='text-teal-600' size={22} />
            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
              Species coverage
            </p>
          </div>
          <div className='space-y-1.5'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Observed</span>
              <span className='font-bold text-teal-600'>
                {stats.species.with_observations.toLocaleString()}
              </span>
            </div>
            <div className='w-full h-1.5 bg-gray-100 rounded-full'>
              <div
                className='h-full bg-teal-500 rounded-full'
                style={{
                  width: `${(stats.species.with_observations / stats.species.total) * 100}%`,
                }}
              />
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Unobserved</span>
              <span className='font-bold text-gray-400'>
                {stats.species.without_observations.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl border border-gray-200 shadow-none p-6'>
        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6'>
          Observations over time (last 12 months)
        </p>
        {obsOverTime.length === 0 ? (
          <div className='h-48 flex items-center justify-center text-gray-300 text-sm font-medium'>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart
              data={obsOverTime}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id='obsGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#0d9488' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#0d9488' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 700, color: '#111827' }}
              />
              <Area
                type='monotone'
                dataKey='count'
                name='Observations'
                stroke='#0d9488'
                strokeWidth={2}
                fill='url(#obsGrad)'
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({
  setActive,
  active,
}: {
  setActive: (id: string) => void;
  active: string;
}) => {
  const tabs = useMemo(
    () => [
      { title: 'Overview', id: 'home' },
      { title: 'Researchers', id: 'researchers' },
      { title: 'User Management', id: 'users' },
      { title: 'Quests', id: 'quests' },
    ],
    [],
  );

  return (
    <div className='w-66 bg-teal-600 text-white h-full flex flex-col font-bold text-lg'>
      <div className={`text-center bg-teal-700  p-3 font-black`}>
        ADMIN DASHBOARD
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
          className={`border-b border-teal-500 p-3 px-6 ${active == tab.id ? 'bg-teal-700/50' : 'bg-teal-600'} transition-colors`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const TabMap: Record<string, React.ReactNode> = {
    researchers: <ResearchersTable />,
    users: <UsersTable />,
    quests: <QuestsTable />,
    home: <Cards onNavigate={setActiveTab} />,
  };

  const { authUser } = useAuth();

  const navigate = useNavigate();

  if (authUser?.role != 'ADMIN') {
    navigate('/');
    return;
  }

  const tabTitles: Record<string, string> = {
    home: 'Overview',
    researchers: 'Researcher Applications',
    users: 'User Management',
    quests: 'Quest Management',
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      <Sidebar setActive={setActiveTab} active={activeTab} />
      <div className='flex-1 overflow-y-auto p-8'>
        <h1 className='text-2xl font-black text-gray-900 mb-6'>
          {tabTitles[activeTab]}
        </h1>
        {TabMap[activeTab] || <div>Select a tab</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
