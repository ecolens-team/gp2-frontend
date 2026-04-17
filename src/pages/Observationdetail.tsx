import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ObservationImageCarousel from '../components/ObservationImageCarousel';
import { createObservationComment, getObservationById, getObservationComments, getSpeciesList, verifyObservation } from '../services/observationsService'; 
import { Marker, Map, FullscreenControl, NavigationControl } from "react-map-gl/mapbox";
import { AlertTriangle, CheckCircle, Loader2, MapPin, ShieldCheck } from "lucide-react";
import Select from 'react-select';
import toast from "react-hot-toast";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from "../contexts/AuthContext/AuthContext";
import { usePageLayout } from "../contexts/UIContext";

export default function ObservationDetail() {
  usePageLayout({ mobileTitleBar: { title: 'Observation', fallbackPath: '/' }, hideBottomNav: true });

  const [newComment, setNewComment] = useState("");
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
    label: s.scientific_name
  }));

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createObservationComment(observationId, { content }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['observation-comments', id] });
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      commentInputRef.current?.focus();
    }
  });

  const verfiySpeciesMutation = useMutation({
    mutationFn: (speciesId: number) => verifyObservation(observationId, speciesId),
    onSuccess: () =>{
      setSuggestSpeciesMode(false);
      setSuggestedSpeciesId(null);
      queryClient.invalidateQueries({ queryKey: ['observation', id] });
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.error || 
        "An unexpected error occurred.";
        
        toast.error(errorMessage);
    }
  });

  const { authUser } = useAuth();
  const isResearcher = authUser?.role === 'RESEARCHER'

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'focusComment' in location.state) {
      requestAnimationFrame(() => {
        commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentInputRef.current?.focus();
      });
    }
  }, [location.state]);

  const navigate = useNavigate();

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-4xl animate-pulse">
        <div className="w-full h-80 bg-gray-200" />
        <div className="bg-white rounded-2xl m-4 p-4 space-y-3">
          <div className="h-5 w-48 bg-gray-200 rounded-full" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-4 w-full bg-gray-100 rounded-full" />
          <div className="h-4 w-4/5 bg-gray-100 rounded-full" />
        </div>
        <div className="bg-white rounded-2xl mx-4 p-4 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="h-4 w-full bg-gray-100 rounded-full" />
          <div className="h-4 w-full bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
  if (!observation) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400 font-medium">
      Observation not found
    </div>
  );

  const confidenceLabel =
  observation.confidenceLevel == null
    ? "N/A"
    : `${(observation.confidenceLevel * 100).toFixed(0)}%`;


  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-4xl  min-h-screen overflow-y-auto">

        <ObservationImageCarousel images={observation.images} alt={observation.speciesName} />

        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 m-4">
          <div className="flex justify-between items-center mb-3 gap-2">
            <button onClick={() => navigate('/species/'+observation.speciesId)}
            className="text-xl font-bold text-teal-700 leading-tight flex-1 text-left hover:text-teal-500 hover:underline underline-offset-2 transition-colors flex items-center gap-1.5 group">
              {observation.speciesName}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
            <div className="bg-teal-50 text-teal-600 font-bold text-sm px-3 py-1 rounded-full border border-teal-300 whitespace-nowrap">{confidenceLabel}</div>
          </div>

        <div className="px-4 mb-4 ">
          <div className="h-64 overflow-hidden rounded-2xl">
            <Map
              mapStyle="mapbox://styles/mapbox/streets-v11"
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{
                latitude: Number(observation.latitude),
                longitude: Number(observation.longitude),
                zoom: 16
              }}
            >
              <FullscreenControl />
              <NavigationControl position="top-right" />
              {observation.location && (
                <Marker
                  latitude={Number(observation.latitude)}
                  longitude={Number(observation.longitude)}
                  anchor="bottom"
                >
                  <div className="text-teal-600 drop-shadow-md hover:scale-110 transition-transform">
                    <MapPin size={40} fill="teal" className="text-white" />
                  </div>
                </Marker>
              )}
            </Map>
          </div>
        </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-teal-100 text-sm text-slate-500 italic leading-normal">
            {observation.description}
          </div>
        </div>

        {
          isResearcher &&  <div className="mx-4 mb-6 bg-white rounded-2xl border border-teal-200 shadow-sm overflow-hidden">
          <div className="bg-teal-50/50 px-5 py-3 border-b border-teal-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm tracking-wide">
               <ShieldCheck size={18} /> RESEARCHER TOOLS
            </div>
            {observation.verified ? (
               <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                  <CheckCircle size={14} /> Verified
               </span>
            ) : (
               <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  <AlertTriangle size={14} /> Pending Review
               </span>
            )}
          </div>

          <div className="p-5 space-y-5">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Identification</p>
                <p className="text-slate-800 font-bold text-lg">{observation.speciesName}</p>
             </div>

             {suggestedSpeciesMode ? (
                <div className=" rounded-xl p-4 border-slate-200">
                   <label className="text-xs font-bold text-slate-700 block mb-2">Search for Correct Species</label>
                   
                   <Select
                     options={speciesOptions}
                     isLoading={speciesLoading}
                     placeholder="Type to search species..."
                     onChange={(option) => setSuggestedSpeciesId(option?.value || null)}
                     className="text-sm"
                     menuPortalTarget={document.body}
                     styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 999 }),
                        control: (base) => ({
                            ...base,
                            borderColor: '#cbd5e1',
                            borderRadius: '0.5rem',
                            padding: '2px',
                            boxShadow: 'none',
                            '&:hover': { borderColor: '#0d9488' }
                        })
                     }}
                   />

                   <div className="flex gap-2 mt-4">
                      <button
                         onClick={() => {
                            if (suggestedSpeciesId) verfiySpeciesMutation.mutate(suggestedSpeciesId);
                         }}
                         disabled={!suggestedSpeciesId || verfiySpeciesMutation.isPending}
                         className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center"
                      >
                         {verfiySpeciesMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : "Submit Correction"}
                      </button>
                      <button
                         onClick={() => {
                            setSuggestSpeciesMode(false);
                            setSuggestedSpeciesId(null);
                         }}
                         className="px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                         Cancel
                      </button>
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button
                      disabled={verfiySpeciesMutation.isPending || observation.verified}
                      className={`rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                          observation.verified 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow active:scale-[0.98]"
                      }`}
                      onClick={() => verfiySpeciesMutation.mutate(observation.speciesId)}
                   >
                      {verfiySpeciesMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16} />} 
                      Confirm Correct
                   </button>
                   <button
                      onClick={() => setSuggestSpeciesMode(true)}
                      className="rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all duration-200 border border-slate-200 active:scale-[0.98]"
                   >
                      Suggest Change
                   </button>
                </div>
             )}
          </div>
        </div>
      }



        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 mx-4 mb-6">
          <div className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            Comments
            <span className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-full">{comments.length}</span>
          </div>

          {commentsLoading ? (
            <div className="space-y-3 mb-3 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-gray-200 rounded-full" />
                    <div className="h-3 w-full bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-slate-500 mb-3">No comments yet. Be the first to comment.</div>
          ) : (
            comments.map((comment, index) => (
              <div key={comment.id} 
              className={`flex gap-2 ${index === comments.length - 1 ? "mb-3" : "mb-3 pb-3 border-b border-teal-100"}`}>
                <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-sm text-teal-600 font-bold shrink-0">{comment.user[0]?.toUpperCase() || 'U'}</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span className="text-sm font-bold text-slate-800">{comment.user}</span>
                    <span className="text-xs text-slate-400">{comment.createdAt}</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-normal">{comment.text}</div>
                </div>
              </div>
            ))
          )}

          <div className="flex gap-2 items-center">
          <input
            ref={commentInputRef}
            className="w-full border border-teal-100 rounded-lg px-3 py-2.5 text-sm text-slate-600 bg-slate-50 outline-none box-border focus:border-teal-500"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && newComment.trim() && !addCommentMutation.isPending) {
                addCommentMutation.mutate(newComment.trim());
              }
            }}
          />
          <button
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 disabled:bg-gray-300"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            onClick={() => addCommentMutation.mutate(newComment.trim())}
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Post'}
          </button>
          </div>
        </div>

      </div>
    </div>
  );
} 