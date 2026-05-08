import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuestById, joinQuest } from '../services/questService';
import {
  Trophy, Users, Target, Info, ChevronLeft, CheckCircle,
  Award, Clock, Shield,
} from 'lucide-react';
import { usePageLayout } from '../contexts/UIContext';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const QuestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  usePageLayout({ 
    mobileTitleBar: { title: 'Quest Details', fallbackPath: '/quests' }, 
    hideBottomNav: true 
  });

  const { data: quest, isLoading, isError } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => getQuestById(id!),
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: () => joinQuest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
      toast.success('Joined quest successfully!');
    },
    onError: () => {
      toast.error('Failed to join quest. Please try again.');
    }
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  
  if (isError || !quest) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quest not found</h2>
        <p className="text-gray-500 mb-6">The quest you are looking for does not exist or has ended.</p>
        <button 
          onClick={() => navigate('/quests')}
          className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold"
        >
          Back to Quests
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {quest.image ? (
          <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-teal-500 to-teal-800" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <button 
          onClick={() => navigate('/quests')}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors md:flex hidden"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {quest.category}
            </span>
            {quest.endDate && (
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={10} /> Ends {new Date(quest.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{quest.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Competition Info */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <Info size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-800">About this Quest</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>{quest.description}</p>
              {quest.rules && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-2">Rules & Guidelines</h3>
                  <div className="bg-gray-50 rounded-2xl p-4 text-sm whitespace-pre-wrap italic">
                    {quest.rules}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* User Progress — only shown when joined */}
          {quest.isJoined && (
            <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Target size={24} />
                  </div>
                  <h2 className="text-xl font-black text-gray-800">Your Progress</h2>
                </div>
                <span className="text-2xl font-black text-teal-800">{quest.progressPercent}%</span>
              </div>

              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-linear-to-r from-teal-600/80 to-sky-700/70 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${quest.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <CheckCircle size={16} className={quest.progressPercent === 100 ? "text-teal-500" : "text-gray-300"} />
                  {quest.progressPercent === 100 ? "Completed!" : "In Progress"}
                </div>
                <div className="font-bold text-gray-700">{quest.rewardPts} Points Potential</div>
              </div>
            </section>
          )}

          <section className="bg-linear-to-r from-teal-700/70 to-sky-700/60 rounded-3xl p-6 text-white">
            <h3 className="text-xl font-black mb-2">Ready to contribute?</h3>
            <p className="text-teal-100/80 text-sm mb-6 leading-relaxed">
              Every observation helps researchers understand biodiversity in Jordan.
            </p>

            <button
              disabled={quest.isJoined || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-md ${
                quest.isJoined
                  ? "bg-white/80 text-teal-700 cursor-not-allowed"
                  : "bg-white text-teal-900 hover:bg-teal-50"
              }`}
            >
              {joinMutation.isPending ? "Joining..." : quest.isJoined ? "Participating" : "Join Quest"}
            </button>

            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="text-center">
                <p className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mb-1">Participants</p>
                <p className="text-xl font-black">{quest.totalParticipants || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mb-1">Reward</p>
                <p className="text-xl font-black">+{quest.rewardPts} XP</p>
              </div>
            </div>
          </section>

          {/* Observations / recent_submissions */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Users size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-800">Recent submissions</h2>
              </div>
              {/* {quest.recent_submissions && quest.recent_submissions.length > 0 && (
                <button className="text-sm font-bold text-teal-600 flex items-center gap-1">
                  View all <ExternalLink size={14} />
                </button>
              )} */}
            </div>
            
            {quest.recent_submissions && quest.recent_submissions.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {quest.recent_submissions.slice(0, 5).map((submission) => (
                  <div onClick={() => {navigate(`/observations/${submission.id}`)}} key={submission.id} className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                    <img 
                      src={submission.images[0].thumbnail} 
                      alt={`Submission by ${submission.user.username}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-[8px] font-bold truncate">@{submission.user.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <Target size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No recent_submissions yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to contribute to this quest!</p>
              </div>
            )}
            
            {!quest.isJoined && (
              <p className="text-center text-gray-400 text-sm mt-6 bg-teal-50/50 py-2 rounded-xl">Join the quest to see your submissions here.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          {/* Rewards Section */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-amber-500" size={20} /> Rewards
            </h3>
            <div className="space-y-3">
              {quest.rewards?.map((reward, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs">
                    {reward.type === 'POINTS' ? <Trophy size={18} className="text-teal-600" /> : <Award size={18} className="text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{reward.label}</p>
                    <p className="text-xs text-gray-500">{reward.value} {reward.type.toLowerCase()}</p>
                  </div>
                </div>
              )) || (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <Trophy size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">Completion Points</p>
                    <p className="text-xs text-gray-500">+{quest.rewardPts} XP</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="text-teal-600" size={20} /> Leaderboard
            </h3>
            <div className="space-y-4">
              {quest.leaderboard?.map((entry, i) => (
                <div key={entry.user.id} className="flex items-center gap-3">
                  <span className={`w-6 text-sm font-black ${i+1 <= 3 ? "text-teal-600" : "text-gray-400"}`}>
                    #{i+1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {entry.user.profile_picture && <img src={entry.user.profile_picture} alt={entry.user.username} className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 text-sm font-bold text-gray-700 truncate">{entry.user.username}</span>
                  <span className="text-sm font-black text-gray-900">{entry.observation_count}</span>
                </div>
              )) || (
                <p className="text-center text-sm text-gray-400 py-4">Leaderboard will appear once participants start scoring.</p>
              )}
            </div>
          </section>

          {/* Organizers Section */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} /> Organizers
            </h3>
            <div className="space-y-4">
              {quest.organizers?.map((org) => (
                <div key={org.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    {org.avatar && <img src={org.avatar} alt={org.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{org.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{org.role}</p>
                  </div>
                </div>
              )) || (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">EcoLens Core Team</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Official Organization</p>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default QuestDetail;
