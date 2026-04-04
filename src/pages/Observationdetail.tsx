import { useState } from "react";

const comments = [
  {
    id: 1,
    user: "researcher_02",
    time: "2 days ago",
    text: "woow",
    initials: "r",
  },
  {
    id: 2,
    user: "user2",
    time: "1 days ago",
    text: "beautiful",
    initials: "u",
  },
 
];

export default function ObservationDetail() {
  const [newComment, setNewComment] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-4xl  min-h-screen overflow-y-auto">

        <div className="w-full h-60 bg-linear-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <span className="text-7xl">🌸</span>
        </div>

        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 m-4">
          <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">Species Name</div>
          <div className="flex justify-between items-center mb-3 gap-2">
            <div className="text-xl font-bold text-slate-800 leading-tight flex-1">Species Name (Scientific name)</div>
            <div className="bg-teal-50 text-teal-600 font-bold text-sm px-3 py-1 rounded-full border border-teal-300 whitespace-nowrap">rate</div>
          </div>

          <div className="rounded-xl overflow-hidden border border-teal-100 mb-3 relative h-28 bg-teal-50">
            <div className="absolute top-2 left-2 bg-white/90 rounded-lg px-2 py-1 text-xs text-slate-600 font-medium z-10 shadow-sm">
              31.9522°N, 35.9239°E
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-teal-500 border-4 border-white shadow-md" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-teal-100 text-sm text-slate-500 italic leading-normal">
            description... Add optional notes about the observation (habitat, appearance, behavior)
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-2xl p-4 bg-teal-50 border border-teal-100">
          <div className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-3 flex items-center gap-1">ℹ RESEARCHER TOOLS</div>

          <div className="bg-white rounded-xl p-4 border border-teal-100 mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 border-b border-teal-100 pb-2">[ VALIDATION BOX ]</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-600 font-medium">Current Status:</span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 tracking-wide">PENDING REVIEW</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Submitted By:</div>
                <div className="text-sm text-slate-800 font-semibold">user_name_01</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Date Submitted:</div>
                <div className="text-sm text-slate-800 font-semibold">Dec 19, 2025</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Verifications:</div>
                <div className="text-sm text-slate-800 font-semibold">3 / 5 required</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Location Type:</div>
                <div className="text-sm text-slate-800 font-semibold">Wild</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold flex items-center justify-center gap-1 text-white transition-transform duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 ${verified ? "bg-green-500" : "bg-teal-600 hover:bg-teal-700"}`}
              onClick={() => setVerified(true)}
            >
              ✓ {verified ? "Verified!" : "Verify as Correct"}
            </button>
            <button className="rounded-xl px-3 py-3 text-sm font-bold flex items-center justify-center gap-1 text-white transition-transform duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 bg-teal-500 hover:bg-teal-600">
               Suggest Change
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 mx-4 mb-6">
          <div className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            Comments
            <span className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-full">{comments.length}</span>
          </div>

          {comments.map((c, index) => (
            <div key={c.id} 
            className={`flex gap-2 ${index === comments.length - 1 ? "mb-3" : "mb-3 pb-3 border-b border-teal-100"}`}>
              <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-sm text-teal-600 font-bold shrink-0">{c.initials}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-sm font-bold text-slate-800">{c.user}</span>
                  <span className="text-xs text-slate-400">{c.time}</span>
                </div>
                <div className="text-sm text-slate-600 leading-normal">{c.text}</div>
              </div>
            </div>
          ))}

          <input
            className="w-full border border-teal-100 rounded-lg px-3 py-2.5 text-sm text-slate-600 bg-slate-50 outline-none box-border focus:border-teal-500"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
} 