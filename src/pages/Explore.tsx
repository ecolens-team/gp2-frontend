import { type MouseEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getObservations, likeObservation } from "../services/observationsService";
import type { IObservation } from "../interfaces/observations";
import Map from "./Map";
import { MessageCircle, Share2, Heart, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Card({ item }: { item: IObservation }) {
  const [liked, setLiked] = useState(item.hasLiked);
  const [likesCount, setLikesCount] = useState(item.likes);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const date = new Date(item.timestamp);

  useEffect(() => {
    setLiked(item.hasLiked);
    setLikesCount(item.likes);
  }, [item.hasLiked, item.likes]);

  const likeMutation = useMutation({
    mutationFn: () => likeObservation(item.id),
    onMutate: () => {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    },
    onSuccess: (response) => {
      const nextLiked = response.has_liked ?? response.liked;
      if (typeof nextLiked === "boolean") setLiked(nextLiked);
      const backendCount = response.likes_count ?? response.likes;
      if (typeof backendCount === "number") setLikesCount(backendCount);
      queryClient.invalidateQueries({ queryKey: ["observations"] });
      queryClient.invalidateQueries({ queryKey: ["observation", String(item.id)] });
    },
    onError: () => {
      setLiked(item.hasLiked);
      setLikesCount(item.likes);
    },
  });

  const openDetails = () => navigate(`/observations/${item.id}`);

  const openComments = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/observations/${item.id}`, { state: { focusComment: true } });
  };

  const toggleLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!likeMutation.isPending) likeMutation.mutate();
  };

  const goToUser = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${item.user}`);
  };

  return (
    <article
      className="bg-white border-b border-gray-100 cursor-pointer"
      onClick={openDetails}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 group" onClick={goToUser}>
          {item.userProfilePicture ? (
            <img src={item.userProfilePicture} className="w-8 h-8 rounded-full object-cover" alt={item.user} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
              {item.user[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
            {item.user}
          </span>
        </div>
        <span className="text-xs text-gray-400">{date.toLocaleString()}</span>
      </div>

      <div className="relative">
        <img
          src={item.image ?? ""}
          alt={item.speciesName}
          className="w-full aspect-4/3 object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
          {item.verified && (
            <span className="flex items-center gap-1 bg-teal-500/80 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              <CheckCircle size={10} /> Verified
            </span>
          )}
          {item.confidenceLevel !== null && (
            <span className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {(item.confidenceLevel * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center px-3 pt-2.5 pb-1 gap-4">
        <button className="flex items-center gap-1 active:scale-90 transition-transform" onClick={toggleLike}>
          <Heart size={22} className={liked ? "fill-teal-500 text-teal-500" : "text-gray-700"} />
          <span className={`text-sm font-semibold ${liked ? "text-teal-500" : "text-gray-700"}`}>{likesCount}</span>
        </button>
        <button className="flex items-center gap-1 text-gray-700 active:scale-90 transition-transform" onClick={openComments}>
          <MessageCircle size={22} />
          <span className="text-sm font-semibold">{item.comments}</span>
        </button>
        <button className="ml-auto text-gray-700 active:scale-90 transition-transform" onClick={(e) => e.stopPropagation()}>
          <Share2 size={20} />
        </button>
      </div>

      <div className="px-3 pb-3 space-y-1">
        <p className="font-bold text-gray-900 italic">{item.speciesName}</p>
        {item.description && (
          <p className="text-sm text-gray-600 leading-snug">{item.description}</p>
        )}
        {item.location && (
          <p className="flex items-center gap-1 text-xs text-gray-400 pt-0.5">
            <MapPin size={11} className="shrink-0" />{item.location}
          </p>
        )}
      </div>
    </article>
  );
}

export default function Explore() {
  const { data, isLoading } = useQuery({
    queryKey: ["observations"],
    queryFn: getObservations,
  });

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center md:py-6 md:px-4">
      <div className="lg:hidden w-full bg-white border-x border-gray-100">
        {data && data.length > 0 ? (
          data.map((item) => <Card key={item.id} item={item} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <span className="text-4xl">🌿</span>
            <p className="font-medium">No observations yet.</p>
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-full max-w-7xl rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-[calc(100vh-120px)]">
        <div className="w-1/2 shrink-0 overflow-y-auto border-r border-gray-100 bg-white">
          {data && data.length > 0 ? (
            data.map((item) => <Card key={item.id} item={item} />)
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
              <span className="text-4xl">🌿</span>
              <p className="font-medium">No observations yet.</p>
            </div>
          )}
        </div>
        <div className="flex-1 w-1/2">
          <Map />
        </div>
      </div>
    </div>
  );
}
