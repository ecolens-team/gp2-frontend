import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Inbox, Microscope, X } from 'lucide-react';
import { api } from '../../lib/axiosConfig';
import { formatLocation } from '../../services/observationsService';

interface QueueItem {
  id: number;
  species_name: string | null;
  species_id: number | null;
  confidence_level: number | null;
  thumbnail: string | null;
  observer: string;
  date: string;
  governorate: string | null;
  report_count: number;
  verified: boolean;
  latitude: number;
  longitude: number;
}

interface ReportItem {
  id: number;
  observation_id: number;
  predicted_species: string | null;
  species_id: number | null;
  thumbnail: string | null;
  reporter: string;
  note: string;
  created_at: string;
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className='text-xs text-gray-400'>No score</span>;
  const pct = Math.round(value * 100);
  const color =
    pct < 40
      ? 'bg-red-100 text-red-700'
      : pct < 70
        ? 'bg-amber-100 text-amber-700'
        : 'bg-teal-100 text-teal-700';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

function QueueList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['researcher-queue', page],
    queryFn: () =>
      api.get(`/researcher/queue/?page=${page}`).then((r) => r.data),
  });

  if (isLoading) return <ListSkeleton />;
  if (!data?.results?.length)
    return (
      <div className='text-center py-16 text-gray-400'>
        <Microscope size={40} className='mx-auto mb-3 opacity-30' />
        <p className='font-medium'>No observations to review</p>
        <p className='text-sm mt-1'>
          Observations matching your specialization will appear here.
        </p>
      </div>
    );

  return (
    <div className='space-y-3'>
      {data.results.map((item: QueueItem) => (
        <button
          key={item.id}
          onClick={() => navigate(`/observations/${item.id}`)}
          className='w-full text-left bg-white rounded-xl border border-gray-200  p-4 flex items-center gap-4 hover:border-teal-300 hover:shadow-md transition-all group'
        >
          <div className='w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0'>
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt=''
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gray-200' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-bold text-gray-900 text-sm truncate italic'>
              {item.species_name ?? 'Unknown species'}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              by {item.observer} ·{' '}
              {item.governorate ??
                formatLocation(item.latitude, item.longitude) ??
                'Unknown location'}
            </p>
            <div className='flex items-center gap-2 mt-1.5'>
              <ConfidenceBadge value={item.confidence_level} />
              {item.report_count > 0 && (
                <span className='text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full'>
                  {item.report_count} report{item.report_count > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-gray-300 group-hover:text-teal-500 shrink-0 transition-colors'
          />
        </button>
      ))}

      {(data.previous || data.next) && (
        <div className='flex justify-between pt-2'>
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            ← Previous
          </button>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function ReportsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['researcher-reports', page],
    queryFn: () =>
      api.get(`/researcher/reports/?page=${page}`).then((r) => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (reportId: number) =>
      api.patch(`/researcher/reports/${reportId}/resolve/`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['researcher-reports'] }),
  });

  if (isLoading) return <ListSkeleton />;
  if (!data?.results?.length)
    return (
      <div className='text-center py-16 text-gray-400'>
        <Inbox size={40} className='mx-auto mb-3 opacity-30' />
        <p className='font-medium'>No pending reports</p>
        <p className='text-sm mt-1'>
          When users flag incorrect species labels, they'll appear here.
        </p>
      </div>
    );

  return (
    <div className='space-y-3'>
      {data.results.map((report: ReportItem) => (
        <div
          key={report.id}
          className='bg-white rounded-xl border border-gray-200  p-4 flex items-start gap-4'
        >
          <div className='w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0'>
            {report.thumbnail ? (
              <img
                src={report.thumbnail}
                alt=''
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gray-200' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-bold text-sm text-gray-900 italic truncate'>
              {report.predicted_species ?? 'Unknown species'}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              Reported by{' '}
              <span className='font-semibold'>@{report.reporter}</span>
            </p>
            {report.note && (
              <p className='text-xs text-gray-600 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 italic'>
                "{report.note}"
              </p>
            )}
          </div>
          <div className='flex gap-2 shrink-0'>
            <button
              onClick={() => navigate(`/observations/${report.observation_id}`)}
              className='text-xs font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1'
            >
              <ChevronRight size={13} /> Review
            </button>
            <button
              onClick={() => resolveMutation.mutate(report.id)}
              disabled={resolveMutation.isPending}
              className='text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1'
            >
              <X size={13} /> Dismiss
            </button>
          </div>
        </div>
      ))}

      {(data.previous || data.next) && (
        <div className='flex justify-between pt-2'>
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            ← Previous
          </button>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className='space-y-3 animate-pulse'>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className='bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4'
        >
          <div className='w-14 h-14 rounded-lg bg-gray-200 shrink-0' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-40 bg-gray-200 rounded-full' />
            <div className='h-3 w-28 bg-gray-100 rounded-full' />
          </div>
        </div>
      ))}
    </div>
  );
}

function VerifiedList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['researcher-verified', page],
    queryFn: () =>
      api.get(`/researcher/verified/?page=${page}`).then((r) => r.data),
  });

  if (isLoading) return <ListSkeleton />;
  if (!data?.results?.length)
    return (
      <div className='text-center py-16 text-gray-400'>
        <CheckCircle size={40} className='mx-auto mb-3 opacity-30' />
        <p className='font-medium'>No verified observations yet</p>
        <p className='text-sm mt-1'>
          Observations you verify will appear here.
        </p>
      </div>
    );

  return (
    <div className='space-y-3'>
      {data.results.map((item: QueueItem) => (
        <button
          key={item.id}
          onClick={() => navigate(`/observations/${item.id}`)}
          className='w-full text-left bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-teal-300 hover:shadow-md transition-all group'
        >
          <div className='w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0'>
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt=''
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gray-200' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-bold text-gray-900 text-sm truncate italic'>
              {item.species_name ?? 'Unknown species'}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              by {item.observer} ·{' '}
              {item.governorate ??
                formatLocation(item.latitude, item.longitude) ??
                'Unknown location'}
            </p>
            <div className='flex items-center gap-2 mt-1.5'>
              <ConfidenceBadge value={item.confidence_level} />
              <span className='text-xs font-bold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full flex items-center gap-1'>
                <CheckCircle size={11} /> Verified
              </span>
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-gray-300 group-hover:text-teal-500 shrink-0 transition-colors'
          />
        </button>
      ))}

      {(data.previous || data.next) && (
        <div className='flex justify-between pt-2'>
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            ← Previous
          </button>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className='text-sm font-bold text-teal-600 disabled:text-gray-300 hover:underline disabled:no-underline'
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerificationTab() {
  const [active, setActive] = useState<'queue' | 'reports' | 'verified'>(
    'queue',
  );

  const TABS = [
    { id: 'queue', label: 'Verification Queue' },
    { id: 'reports', label: 'Reports Inbox' },
    { id: 'verified', label: 'Verified by Me' },
  ] as const;

  return (
    <div className='space-y-6 max-w-5xl'>
      <div className='flex bg-gray-100 p-1 rounded-xl w-fit'>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              active === tab.id
                ? 'bg-white text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'queue' && <QueueList />}
      {active === 'reports' && <ReportsList />}
      {active === 'verified' && <VerifiedList />}
    </div>
  );
}
