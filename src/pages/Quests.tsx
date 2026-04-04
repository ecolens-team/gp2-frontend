import React from 'react';
import { ArrowLeft, Leaf, Target, Camera, Map, User, Trophy, Star } from 'lucide-react';

export default function Quests() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
    <div className="min-h-screen bg-[#F0F7F6] pb-24">
      <h1 className="text-2xl font-bold text-green-700">Quests</h1>
      
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <button className="p-2 border border-teal-600 rounded-full text-teal-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-700">Quests</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border mb-4">
          <div className="flex gap-4">
            <div className="bg-teal-600 p-3 rounded-2xl text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Find 5 Spring Flowers</h3>
              <p className="text-gray-500 text-sm">Discover and document plants</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 h-2 rounded-full">
              <div className="bg-teal-600 h-2 rounded-full w-[60%]"></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">3 / 5 Collected</span>
              <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">+200 XP</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border mb-6">
          <div className="flex gap-4">
            <div className="bg-teal-500 p-3 rounded-2xl text-white">
              <Target size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Weekly Challenge</h3>
              <p className="text-gray-500 text-sm">Submit 10 observations</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 h-2 rounded-full">
              <div className="bg-teal-500 h-2 rounded-full w-[40%]"></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">4 / 10 Done</span>
              <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">+500 XP</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">New Adventures</h2>
        
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between mb-3 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 text-white p-2 rounded-xl"><Camera size={20}/></div>
            <span className="font-bold text-sm">Butterfly Collection</span>
          </div>
          <button className="bg-teal-500 text-white px-4 py-1 rounded-full text-xs">+ Join</button>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-center justify-between mb-3 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 text-white p-2 rounded-xl"><Map size={20}/></div>
            <span className="font-bold text-sm">Location Scout</span>
          </div>
          <button className="bg-teal-500 text-white px-4 py-1 rounded-full text-xs">+ Join</button>
        </div>
      </div>

      <nav className="fixed bottom-0 w-full bg-white border-t p-3 flex justify-around items-center">
        <div className="text-gray-400 flex flex-col items-center"><Map size={22}/><span className="text-[10px]">Map</span></div>
        <div className="text-teal-600 flex flex-col items-center"><Trophy size={22}/><span className="text-[10px]">Quests</span></div>
        <div className="bg-teal-500 p-4 rounded-full text-white -mt-10 border-4 border-[#F0F7F6] shadow-md">
          <Camera size={24} />
        </div>
        <div className="text-gray-400 flex flex-col items-center"><User size={22}/><span className="text-[10px]">Profile</span></div>
        <div className="text-gray-400 flex flex-col items-center"><Star size={22}/><span className="text-[10px]">Saved</span></div>
      </nav>
    </div>
  );
}
