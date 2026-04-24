import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuests } from '../services/questService';
import { Leaf, Target, Camera, Map as MapIcon, ChevronRight, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import type { Quest } from '../interfaces/quest';

const CategoryIcon = ({ category, size = 24 }: { category: Quest['category'], size?: number }) => {
  switch (category) {
    case 'PLANT': return <Leaf size={size} />;
    case 'INSECT': return <Target size={size} />;
    default: return <Camera size={size} />;
  }
};

const QuestCard = ({ quest }: { quest: Quest }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/quests/${quest.id}`)}
      className="bg-white p-5 rounded-3xl shadow-xs border-2 mb-4 border-teal-600/10 hover:border-teal-500/30 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-sm group-hover:scale-110 transition-transform">
            <CategoryIcon category={quest.category} />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-800">{quest.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-1">{quest.description}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-teal-500 transition-colors" />
      </div>
      
      <div className="space-y-3">
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-teal-600 h-full rounded-full transition-all duration-1000" 
            style={{ width: `${quest.progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-bold text-gray-400">
            {quest.progressPercent}% Completed
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-2 py-1 rounded-full border border-teal-100">
              +{quest.rewardPts} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Quests() {
  const navigate = useNavigate();
  const { data: quests = [], isLoading, isError, error } = useQuery({
    queryKey: ['quests'],
    queryFn: getQuests,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-[calc(100vh-120px)]">
      <Spinner />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] text-center p-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 max-w-sm">
        <h2 className="text-xl font-black mb-2">Error Loading Quests</h2>
        <p className="text-sm mb-4">{(error as any)?.message || 'Something went wrong while fetching quests.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (quests.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F7F6] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border-2 border-teal-600/10 max-w-md">
          <Trophy size={64} className="text-teal-200 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-teal-900 mb-3">No Quests Active</h1>
          <p className="text-teal-600/70 font-bold mb-8">Check back later for new biodiversity challenges!</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
          >
            Explore Nature
          </button>
        </div>
      </div>
    );
  }

  const activeQuests = quests.filter(q => q.isJoined);
  const newQuests = quests.filter(q => !q.isJoined);

  return (
    <div className="min-h-screen bg-[#F0F7F6] pb-24">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-teal-900">Quests</h1>
            <p className="text-teal-600/70 font-bold">Earn points and help science</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-teal-100 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            <span className="font-black text-gray-800">1,250</span>
          </div>
        </div>

        {/* User Progress Summary (Visual) */}
        <div className="bg-linear-to-r from-teal-600 to-teal-800 rounded-3xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Current Level</p>
            <h2 className="text-4xl font-black mb-4">Level 12</h2>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Progress to Level 13</span>
              <span>750 / 1000 XP</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full w-3/4 rounded-full"></div>
            </div>
          </div>
          <Trophy className="absolute -right-4 -bottom-4 text-white/10" size={120} />
        </div>

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-teal-600" /> Active Quests
            </h2>
            {activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </section>
        )}

        {/* New Adventures */}
        <section>
          <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-teal-600" /> New Adventures
          </h2>
          <div className="grid gap-4">
            {newQuests.map(quest => (
              <div 
                key={quest.id}
                onClick={() => navigate(`/quests/${quest.id}`)}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-xs border border-teal-600/10 hover:border-teal-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <CategoryIcon category={quest.category} size={20} />
                  </div>
                  <div>
                    <span className="font-black text-sm text-gray-800 block">{quest.title}</span>
                    <span className="text-[10px] text-teal-600 font-bold">+{quest.rewardPts} XP Available</span>
                  </div>
                </div>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-xs active:scale-95 transition-all">
                  Join
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Location / Map Link */}
        <div className="mt-12 bg-white rounded-3xl p-6 border-2 border-dashed border-teal-200 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4">
            <MapIcon size={32} />
          </div>
          <h3 className="font-black text-gray-800 mb-2">Explore Your Local Area</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Find quests nearby by checking out the interactive biodiversity map.
          </p>
          <button 
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-teal-600 font-black hover:text-teal-700 transition-colors"
          >
            Open Map <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
