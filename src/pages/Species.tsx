import { useState, useMemo } from 'react';
import { Info, MapPin, Map, CheckCircle, Target } from 'lucide-react';
import MapGL, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSpeciesById,
  getObservations,
} from '../services/observationsService';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import SpeciesHero from '../components/species/SpeciesHero';
import SpeciesDataInsights from '../components/species/SpeciesDataInsights';
import SpeciesResearcherTools from '../components/species/SpeciesResearcherTools';
import SpeciesMapTab from '../components/species/SpeciesMapTab';
import SpeciesGalleryTab from '../components/species/SpeciesGalleryTab';

export default function SpeciesProfile() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MAP' | 'GALLERY'>(
    'OVERVIEW',
  );
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const isResearcher =
    authUser?.role === 'RESEARCHER' || authUser?.role === 'ADMIN';

  const { data: species } = useQuery({
    queryKey: ['species', id],
    queryFn: () => getSpeciesById(Number(id)),
    enabled: !!id,
  });

  const { data: observations = [] } = useQuery({
    queryKey: ['species-observations', species?.scientificName],
    queryFn: () => getObservations(),
    enabled: !!species,
    select: (obs) => obs.filter((o) => o.speciesId === Number(id)),
  });

  if (!species)
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 animate-pulse'>
        <div className='h-100 md:h-125 w-full rounded-2xl bg-gray-200 mb-10' />
        <div className='flex justify-center mb-10'>
          <div className='flex gap-2 bg-gray-100 p-1.5 rounded-full'>
            {[80, 60, 80].map((w, i) => (
              <div
                key={i}
                className='h-8 rounded-full bg-gray-200'
                style={{ width: w }}
              />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-7 space-y-4'>
            <div className='h-6 w-48 bg-gray-200 rounded-full' />
            <div className='h-4 w-full bg-gray-100 rounded-full' />
            <div className='h-4 w-5/6 bg-gray-100 rounded-full' />
            <div className='h-4 w-4/6 bg-gray-100 rounded-full' />
          </div>
          <div className='lg:col-span-5 space-y-4'>
            <div className='h-48 w-full bg-gray-200 rounded-2xl' />
          </div>
        </div>
      </div>
    );

  const obsWithImages = useMemo(
    () => observations.filter((o) => o.image),
    [observations],
  );
  const obsWithCoords = useMemo(
    () => observations.filter((o) => o.latitude != null && o.longitude != null),
    [observations],
  );

  const mapPreviewView = useMemo(() => {
    if (obsWithCoords.length === 0)
      return { longitude: 36.5, latitude: 31.5, zoom: 6 };
    const lngs = obsWithCoords.map((o) => o.longitude!);
    const lats = obsWithCoords.map((o) => o.latitude!);
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: obsWithCoords.length === 1 ? 8 : 6,
    };
  }, [obsWithCoords]);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 font-sans text-gray-900 selection:bg-teal-100 selection:text-teal-900'>
      <SpeciesHero species={species} />

      {/* Tabs */}
      <nav className='sticky top-4 z-40 mb-10 flex justify-center'>
        <div className='bg-white/70 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-sm border border-gray-100'>
          {(['OVERVIEW', 'MAP', 'GALLERY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-teal-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12'>
          {/* Main column */}
          <div className='lg:col-span-7 space-y-10'>
            {/* Description */}
            <section className='space-y-6'>
              <div className='flex items-center gap-4'>
                <div className='w-1.5 h-8 bg-teal-600 rounded-full' />
                <h2 className='text-3xl font-black tracking-tight text-gray-900'>
                  Species Profile
                </h2>
              </div>

              {!species.description.isVerified && (
                <div className='bg-amber-50 border-l-4 border-amber-400 p-5 md:p-6 rounded-xl flex items-center gap-3'>
                  <Info className='text-amber-600 shrink-0 mt-0.5' size={20} />
                  <p className='text-sm text-amber-800'>
                    Description not yet verified by a researcher.
                  </p>
                </div>
              )}

              {species.description.text ? (
                <div className='font-serif text-lg leading-relaxed text-gray-700 space-y-4 whitespace-pre-wrap'>
                  {species.description.text}
                </div>
              ) : (
                <p className='text-gray-400 italic'>
                  No description available yet.
                </p>
              )}
            </section>

            {/* Local Ecology */}
            <section className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6'>
              <h3 className='text-xl font-bold flex items-center gap-2 text-gray-900'>
                <MapPin className='text-teal-600' size={24} /> Local Ecology
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-2'>
                    Top Governorates
                  </p>
                  {species.ecology.topGovernorates?.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {species.ecology.topGovernorates.map((gov) => (
                        <span
                          key={gov}
                          className='px-4 py-2 bg-teal-50 border border-teal-100 rounded-lg text-sm font-bold text-teal-800'
                        >
                          {gov}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-400 italic'>
                      No observation data yet.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('MAP')}
                  className='relative group rounded-xl overflow-hidden shadow-md cursor-pointer h-40 bg-gray-200'
                >
                  {obsWithCoords.length > 0 ? (
                    <MapGL
                      initialViewState={mapPreviewView}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle='mapbox://styles/mapbox/outdoors-v12'
                      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                      interactive={false}
                      attributionControl={false}
                    >
                      {obsWithCoords.map((m) => (
                        <Marker
                          key={m.id}
                          longitude={m.longitude!}
                          latitude={m.latitude!}
                          anchor='bottom'
                        >
                          <div
                            className='w-3 h-3 rounded-full border border-white shadow-sm'
                            style={{ backgroundColor: 'rgb(13, 148, 136)' }}
                          />
                        </Marker>
                      ))}
                    </MapGL>
                  ) : (
                    <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                      <MapPin className='text-gray-300' size={32} />
                    </div>
                  )}
                  <div className='absolute inset-0 bg-teal-900/10 group-hover:bg-teal-900/30 transition-colors flex items-center justify-center pointer-events-none'>
                    <div className='bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform'>
                      <Map className='text-teal-600' size={16} />
                      <span className='text-xs font-bold text-teal-900'>
                        View Full Map
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            <SpeciesDataInsights dataInsights={species.dataInsights} />
          </div>

          {/* Aside */}
          <aside className='lg:col-span-5 space-y-8'>
            {isResearcher && (
              <SpeciesResearcherTools species={species} speciesId={id!} />
            )}

            {/* Community */}
            <div className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8'>
              <div className='text-center'>
                <p className='text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2'>
                  Total Observations
                </p>
                <div className='text-6xl font-black text-teal-600 mb-2'>
                  {species.community.totalObservations.toLocaleString()}
                </div>
              </div>

              {species.community.topObservers.length > 0 && (
                <div className='pt-6 border-t border-gray-50'>
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6'>
                    Top Observers
                  </p>
                  <div className='space-y-4'>
                    {species.community.topObservers.map((obs, idx) => (
                      <div
                        key={obs.name}
                        className='flex items-center gap-4 group cursor-pointer'
                        onClick={() => navigate(`/users/${obs.name}`)}
                      >
                        <img
                          className='w-10 h-10 rounded-full object-cover border-2 border-teal-50 group-hover:border-teal-200 transition-colors'
                          alt={obs.name}
                          src={obs.avatar}
                        />
                        <div className='flex-1'>
                          <p className='text-sm font-bold text-gray-900'>
                            {obs.name}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {obs.obs} Observations
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-700'}`}
                        >
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {species.community.activeQuests.length > 0 && (
              <div className='bg-teal-800 p-6 md:p-8 rounded-2xl text-white shadow-xl'>
                <div className='flex items-center gap-2 mb-6'>
                  <Target className='text-teal-400' size={24} />
                  <h3 className='text-xl font-bold'>Active Quests</h3>
                </div>
                <div className='space-y-4'>
                  {species.community.activeQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className='p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group'
                    >
                      <div className='flex justify-between items-start mb-3'>
                        <h4 className='text-sm font-bold group-hover:text-teal-300 transition-colors'>
                          {quest.title}
                        </h4>
                        <span className='text-[10px] font-bold bg-teal-600 px-2 py-1 rounded-md'>
                          +{quest.rewardPts} pts
                        </span>
                      </div>
                      <div className='w-full h-1.5 bg-black/20 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-teal-400 rounded-full'
                          style={{ width: `${quest.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {species.community.topExperts.length > 0 && (
              <section className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-900'>
                  Top Verified Experts
                </h3>
                <div className='flex flex-col gap-4'>
                  {species.community.topExperts.map((expert) => (
                    <div
                      key={expert.name}
                      className='flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-colors cursor-pointer'
                    >
                      <img
                        className='w-14 h-14 rounded-full object-cover'
                        alt={expert.name}
                        src={expert.avatar}
                      />
                      <div>
                        <p className='font-bold text-gray-900 leading-tight'>
                          {expert.name}
                        </p>
                        <p className='text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5'>
                          {expert.title}
                        </p>
                      </div>
                      <CheckCircle
                        className='text-teal-500 ml-auto'
                        size={20}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      )}

      {activeTab === 'MAP' && <SpeciesMapTab markers={obsWithCoords} />}

      {activeTab === 'GALLERY' && (
        <SpeciesGalleryTab observations={obsWithImages} />
      )}
    </main>
  );
}
