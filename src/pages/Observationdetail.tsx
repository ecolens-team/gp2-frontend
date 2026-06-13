import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ObservationImageCarousel from '../components/ObservationImageCarousel';
import {
  createObservationComment,
  getObservationById,
  getObservationComments,
  getSpeciesList,
  likeObservation,
  verifyObservation,
} from '../services/observationsService';
import { getQuests, submitObservationToQuest } from '../services/questService';
import { PickerModal, PickerTrigger } from '../components/ui/PickerModal';
import {
  Marker,
  Map,
  FullscreenControl,
  NavigationControl,
} from 'react-map-gl/mapbox';
import {
  AlertTriangle,
  CheckCircle,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  Trophy,
  AlignLeft
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { usePageLayout } from '../contexts/UIContext';

export default function ObservationDetail() {
  usePageLayout({
    mobileTitleBar: { title: 'Observation', fallbackPath: '/' },
    hideBottomNav: true,
  });

  const [newComment, setNewComment] = useState('');
  const [suggestedSpeciesId, setSuggestedSpeciesId] = useState(null);
  const [suggestedSpeciesMode, setSuggestSpeciesMode] = useState(false);
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const location = useLocation();
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const observationId = Number(id);

  const { data: observation, isLoading } = useQuery({
    queryKey: ['observation', id],
    queryFn: () => getObservationById(observationId),
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['observation-comments', id],
    queryFn: () => getObservationComments(observationId),
    enabled: !!id,
  });

  const { data: speciesList = [], isLoading: speciesLoading } = useQuery({
    queryKey: ['species-list'],
    queryFn: () => getSpeciesList(),
    staleTime: Infinity,
    enabled: suggestedSpeciesMode,
  });

  const speciesOptions = speciesList.map((s: any) => ({
    value: s.id,
    label: s.scientific_name,
  }));

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      createObservationComment(observationId, { content }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['observation-comments', id] });
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      commentInputRef.current?.focus();
    },
  });

  const verfiySpeciesMutation = useMutation({
    mutationFn: (speciesId: number) =>
      verifyObservation(observationId, speciesId),
    onSuccess: () => {
      setSuggestSpeciesMode(false);
      setSuggestedSpeciesId(null);
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'An unexpected error occurred.';

      toast.error(errorMessage);
    },
  });

  const [liked, setLiked] = useState<boolean | null>(null);
  const [likesCount, setLikesCount] = useState<number | null>(null);

  const likeMutation = useMutation({
    mutationFn: () => likeObservation(observationId),
    onMutate: () => {
      const current = liked ?? observation?.hasLiked ?? false;
      const count = likesCount ?? observation?.likes ?? 0;
      setLiked(!current);
      setLikesCount(count + (current ? -1 : 1));
    },
    onSuccess: (res) => {
      const next = res.has_liked ?? res.liked;
      if (typeof next === 'boolean') setLiked(next);
      const back = res.likes_count ?? res.likes;
      if (typeof back === 'number') setLikesCount(back);
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
    },
    onError: () => {
      setLiked(observation?.hasLiked ?? false);
      setLikesCount(observation?.likes ?? 0);
    },
  });

  const { authUser } = useAuth();
  const isResearcher = authUser?.role === 'RESEARCHER';

  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [openQuestPicker, setOpenQuestPicker] = useState(false);

  const { data: joinedQuests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getQuests,
    select: (data) => data.filter((q) => q.isJoined),
    enabled: !!authUser,
  });

  const assignToQuestMutation = useMutation({
    mutationFn: () => submitObservationToQuest(selectedQuestId, observationId),
    onSuccess: () => {
      toast.success('Observation assigned to quest!');
      setSelectedQuestId('');
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error ?? 'Assignment failed'),
  });

  useEffect(() => {
    if (
      location.state &&
      typeof location.state === 'object' &&
      'focusComment' in location.state
    ) {
      requestAnimationFrame(() => {
        commentInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        commentInputRef.current?.focus();
      });
    }
  }, [location.state]);

  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className='min-h-screen bg-slate-50 flex justify-center'>
        <div className='w-full max-w-3xl animate-pulse'>
          <div className='w-full h-80 bg-gray-200' />
          <div className='p-4 space-y-6'>
            <div className='bg-white rounded-2xl p-5 space-y-4'>
              <div className='h-6 w-48 bg-gray-200 rounded-full' />
              <div className='h-8 w-8 bg-gray-200 rounded-full' />
            </div>
            <div className='bg-white rounded-2xl p-5 space-y-4'>
              <div className='h-64 bg-gray-100 rounded-xl' />
              <div className='h-4 w-full bg-gray-100 rounded-full' />
            </div>
          </div>
        </div>
      </div>
    );

  if (!observation)
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center text-gray-400 font-medium'>
        Observation not found
      </div>
    );

  const isOwner = authUser?.username === observation.user;
  const confidenceLabel =
    observation.confidenceLevel == null
      ? 'N/A'
      : `${(observation.confidenceLevel * 100).toFixed(0)}%`;

  return (
    <div className='min-h-screen bg-slate-50 flex justify-center'>
      <div className='w-full max-w-3xl min-h-screen overflow-y-auto pb-12'>
        <ObservationImageCarousel
          images={observation.images}
          alt={observation.speciesName}
        />

        <div className='px-4 mt-3 space-y-3'>
 
          <div className='bg-white rounded-2xl z-100 border border-teal-100 shadow-sm p-5'>
            <div className='flex justify-between items-start mb-4 gap-2'>
              <button
                onClick={() => navigate('/species/' + observation.speciesId)}
                className='text-2xl font-bold text-teal-800 leading-tight text-left hover:text-teal-600 hover:underline underline-offset-4 transition-colors flex items-center gap-2 group'
              >
                {observation.speciesName}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='opacity-80 mx-1 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0'
                >
                  <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                  <polyline points='15 3 21 3 21 9' />
                  <line x1='10' y1='14' x2='21' y2='3' />
                </svg>
              </button>
              <div className='bg-teal-50 text-teal-700 font-bold text-sm px-3 py-1 rounded-full border border-teal-200 shrink-0'>
                {confidenceLabel} 
              </div>
            </div>

            <div className='flex items-center justify-between pt-2 border-t border-slate-100'>
              <button
                onClick={() => navigate(`/users/${observation.user}`)}
                className='flex items-center gap-2.5 group'
              >
                {observation.userProfilePicture ? (
                  <img
                    src={observation.userProfilePicture}
                    className='w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-100 transition-all'
                    alt={observation.user}
                  />
                ) : (
                  <div className='w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-transparent group-hover:ring-teal-200 transition-all'>
                    {observation.user[0]?.toUpperCase()}
                  </div>
                )}
                <div className='flex flex-col items-start'>
                  <span className='text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors leading-none'>
                    {observation.user}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => !likeMutation.isPending && likeMutation.mutate()}
                className='flex items-center gap-2 active:scale-90 transition-transform bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full'
              >
                <Heart
                  size={18}
                  className={
                    (liked ?? observation.hasLiked)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-400'
                  }
                />
                <span
                  className={`text-sm font-bold ${(liked ?? observation.hasLiked) ? 'text-rose-600' : 'text-slate-500'}`}
                >
                  {likesCount ?? observation.likes}
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Location & Description */}
          <div className='bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden'>
            <div className='p-5 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold'>
              <MapPin size={18} className='text-teal-600' />
              Location & Details
            </div>
            
            <div className='p-5 space-y-4'>
              <div className='h-64 rounded-xl overflow-hidden ring-1 ring-slate-200'>
                <Map
                  mapStyle='mapbox://styles/mapbox/streets-v11'
                  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                  initialViewState={{
                    latitude: Number(observation.latitude),
                    longitude: Number(observation.longitude),
                    zoom: 15,
                  }}
                >
                  <FullscreenControl />
                  <NavigationControl position='top-right' />
                  {observation.location && (
                    <Marker
                      latitude={Number(observation.latitude)}
                      longitude={Number(observation.longitude)}
                      anchor='bottom'
                    >
                      <div className='drop-shadow-md hover:scale-110 transition-transform'>
                        <MapPin size={36} fill='#0d9488' className='text-white' />
                      </div>
                    </Marker>
                  )}
                </Map>
              </div>

              {observation.latitude != null && observation.longitude != null && (
                <div className='text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block'>
                  {Number(observation.latitude).toFixed(6)}, {Number(observation.longitude).toFixed(6)}
                </div>
              )}

              {observation.description && (
                <div className='bg-teal-50/50 rounded-xl p-4 border border-teal-100/50 text-sm text-slate-600 leading-relaxed flex gap-3 items-start'>
                  <AlignLeft size={16} className='text-teal-400 shrink-0 mt-0.5' />
                  <p>{observation.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Researcher Tools */}
          {isResearcher && (
            <div className='bg-white rounded-2xl border border-teal-200 shadow-sm overflow-hidden'>
              <div className='bg-teal-50/80 px-5 py-3.5 border-b border-teal-100 flex justify-between items-center'>
                <div className='flex items-center gap-2 text-teal-800 font-bold text-sm tracking-wide'>
                  <ShieldCheck size={18} className='text-teal-600' /> 
                  RESEARCHER TOOLS
                </div>
                {observation.verified ? (
                  <span className='flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 shadow-sm'>
                    <CheckCircle size={14} /> Verified
                  </span>
                ) : (
                  <span className='flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm'>
                    <AlertTriangle size={14} /> Pending Review
                  </span>
                )}
              </div>

              <div className='p-5 space-y-5'>
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                    Current Identification
                  </p>
                  <p className='text-slate-800 font-bold text-lg'>
                    {observation.speciesName}
                  </p>
                </div>

                {suggestedSpeciesMode ? (
                  <div className='bg-slate-50 rounded-xl p-4 border border-slate-200'>
                    <label className='text-xs font-bold text-slate-700 block mb-2'>
                      Search for Correct Species
                    </label>

                    <Select
                      options={speciesOptions}
                      isLoading={speciesLoading}
                      placeholder='Type to search species...'
                      onChange={(option) =>
                        setSuggestedSpeciesId(option?.value || null)
                      }
                      className='text-sm'
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 999 }),
                        control: (base) => ({
                          ...base,
                          borderColor: '#cbd5e1',
                          borderRadius: '0.5rem',
                          padding: '2px',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#0d9488' },
                        }),
                      }}
                    />

                    <div className='flex gap-2 mt-4'>
                      <button
                        onClick={() => {
                          if (suggestedSpeciesId)
                            verfiySpeciesMutation.mutate(suggestedSpeciesId);
                        }}
                        disabled={
                          !suggestedSpeciesId || verfiySpeciesMutation.isPending
                        }
                        className='flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center shadow-sm'
                      >
                        {verfiySpeciesMutation.isPending ? (
                          <Loader2 className='animate-spin' size={16} />
                        ) : (
                          'Submit Correction'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSuggestSpeciesMode(false);
                          setSuggestedSpeciesId(null);
                        }}
                        className='px-5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-3 pt-2'>
                    <button
                      disabled={
                        verfiySpeciesMutation.isPending || observation.verified
                      }
                      className={`rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                        observation.verified
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow active:scale-[0.98]'
                      }`}
                      onClick={() =>
                        verfiySpeciesMutation.mutate(observation.speciesId)
                      }
                    >
                      {verfiySpeciesMutation.isPending ? (
                        <Loader2 className='animate-spin' size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Confirm Correct
                    </button>
                    <button
                      onClick={() => setSuggestSpeciesMode(true)}
                      className='rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all duration-200 border border-slate-200 shadow-sm active:scale-[0.98]'
                    >
                      Suggest Change
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isOwner && (
            <div className='bg-white rounded-2xl border border-teal-100 shadow-sm p-5'>
              <div className='flex items-center gap-2 text-slate-800 font-bold mb-4'>
                <Trophy size={18} className='text-teal-600' />
                Quest Assignment
              </div>

              {observation.assignedQuest && (
                <div className='flex items-center gap-3 bg-teal-50/80 border border-teal-200 rounded-xl px-4 py-3 mb-4'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[11px] text-teal-600 font-bold uppercase tracking-wider mb-0.5'>
                      Currently assigned to
                    </p>
                    <p className='text-sm font-bold text-teal-900 truncate'>
                      {observation.assignedQuest.title}
                    </p>
                  </div>
                </div>
              )}

              {(() => {
                const availableQuests = joinedQuests.filter(
                  (q) => String(q.id) !== String(observation.assignedQuest?.id),
                );
                if (availableQuests.length === 0) {
                  return observation.assignedQuest ? (
                    <p className='text-sm text-slate-400 bg-slate-50 rounded-lg p-3 text-center border border-slate-100'>
                      No other joined quests available for reassignment.
                    </p>
                  ) : (
                    <p className='text-sm text-slate-400 bg-slate-50 rounded-lg p-3 text-center border border-slate-100'>
                      Join a quest to assign this observation.
                    </p>
                  );
                }
                return (
                  <div className='space-y-3'>
                    <PickerTrigger
                      label={
                        observation.assignedQuest
                          ? 'Reassign to a different quest'
                          : 'Select a Quest or Event'
                      }
                      value={
                        availableQuests.find(
                          (q) => String(q.id) === selectedQuestId,
                        )?.title ?? ''
                      }
                      onClick={() => setOpenQuestPicker(true)}
                    />
                    {selectedQuestId && (
                      <button
                        disabled={assignToQuestMutation.isPending}
                        onClick={() => assignToQuestMutation.mutate()}
                        className='w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm'
                      >
                        {assignToQuestMutation.isPending && (
                          <Loader2 size={16} className='animate-spin' />
                        )}
                        Confirm Assignment
                      </button>
                    )}
                    {openQuestPicker && (
                      <PickerModal
                        title='Add to Quest or Event'
                        options={availableQuests.map((q) => ({
                          value: String(q.id),
                          label: q.title,
                          sublabel: `+${q.rewardPts} XP · ${q.progressPercent}% complete`,
                        }))}
                        value={selectedQuestId}
                        onChange={setSelectedQuestId}
                        onClose={() => setOpenQuestPicker(false)}
                        clearLabel='Cancel'
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Card 5: Comments */}
          <div className='bg-white rounded-2xl border border-teal-100 shadow-sm p-5'>
            <div className='text-base font-bold text-slate-800 mb-5 flex items-center gap-2'>
              Comments
              <span className='bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-100'>
                {comments.length}
              </span>
            </div>

            <div className='space-y-4 mb-5'>
              {commentsLoading ? (
                <div className='space-y-4 animate-pulse'>
                  {[1, 2].map((i) => (
                    <div key={i} className='flex gap-3'>
                      <div className='w-9 h-9 rounded-full bg-slate-200 shrink-0' />
                      <div className='flex-1 space-y-2 py-1'>
                        <div className='h-3 w-24 bg-slate-200 rounded-full' />
                        <div className='h-3 w-full bg-slate-100 rounded-full' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className='text-sm text-slate-500 bg-slate-50 rounded-xl p-4 text-center border border-slate-100'>
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`flex gap-3 ${index !== comments.length - 1 ? 'pb-4 border-b border-slate-100' : ''}`}
                  >
                    <div className='w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-sm text-teal-700 font-bold shrink-0'>
                      {comment.user[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-baseline gap-2 mb-1'>
                        <span className='text-sm font-bold text-slate-800'>
                          {comment.user}
                        </span>
                        <span className='text-[11px] font-medium text-slate-400'>
                          {comment.createdAt}
                        </span>
                      </div>
                      <div className='text-sm text-slate-600 leading-relaxed'>
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='flex gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all'>
              <input
                ref={commentInputRef}
                className='w-full px-3 py-2 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-400'
                placeholder='Add a comment...'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    newComment.trim() &&
                    !addCommentMutation.isPending
                  ) {
                    addCommentMutation.mutate(newComment.trim());
                  }
                }}
              />
              <button
                className='rounded-lg px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-100 transition-colors shadow-sm'
                disabled={!newComment.trim() || addCommentMutation.isPending}
                onClick={() => addCommentMutation.mutate(newComment.trim())}
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className='animate-spin mx-2' size={16} />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}