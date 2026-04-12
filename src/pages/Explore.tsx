import { type MouseEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getObservations, likeObservation } from "../services/observationsService";
import type { IObservation } from "../interfaces/observations";
import Map from "./Map";
import { MessageCircle, Share2, Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Card({ item }: {item: IObservation}) {
  const [liked, setLiked] = useState(item.hasLiked);
  const [likesCount, setLikesCount] = useState(item.likes);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLiked(item.hasLiked);
    setLikesCount(item.likes);
  }, [item.hasLiked, item.likes]);

  const likeMutation = useMutation({
    mutationFn: () => likeObservation(item.id),
    onMutate: async () => {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    },
    onSuccess: (response) => {
      const nextLiked = response.has_liked ?? response.liked;

      if (typeof nextLiked === "boolean") {
        setLiked(nextLiked);
      }

      const backendCount = response.likes_count ?? response.likes;
      if (typeof backendCount === "number") {
        setLikesCount(backendCount);
      }

      queryClient.invalidateQueries({ queryKey: ["observations"] });
      queryClient.invalidateQueries({ queryKey: ["observation", String(item.id)] });
    },
    onError: () => {
      setLiked(item.hasLiked);
      setLikesCount(item.likes);
    }
  });

  const openDetails = () => navigate(`/observations/${item.id}`);
  const openComments = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate(`/observations/${item.id}`, { state: { focusComment: true } });
  };

  const toggleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (likeMutation.isPending) {
      return;
    }
    likeMutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden max-w-2xl active:scale-99 transition-transform"
    onClick={openDetails}>
      <div className="flex items-center p-2">
        <div className="w-11 h-11 border-2 border-teal-600 mr-3 rounded-full flex justify-center items-center font-bold text-teal-600">
          {item.user[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold">{item.user}</p>
          <p className="text-sm text-gray-500">{item.timestamp}</p>
        </div>
      </div>

      <img src={item.image? item.image : ''} className="w-full h-80 object-cover" alt={item.speciesName} />

      <div className="p-3">
        <h4 className="font-bold">{item.speciesName}</h4>
        <p className="text-sm text-gray-500 flex p-1"><MapPin size={20}/> {item.location}</p>
        <p>{item.description}</p>

        <div className="flex justify-between mt-3 mx-6 ">
          <button className={`action-btn active:scale-90 transition-transform ${liked ? "liked" : ""}`} onClick={toggleLike}>
            {liked ? <Heart fill="teal"/> : <Heart  />}
            <span className="ml-1 text-sm">{likesCount}</span>
          </button>
          <button className="action-btn" onClick={openComments}>
            <MessageCircle />
            <span className="ml-1 text-sm">{item.comments}</span>
          </button>
          <button className="action-btn" onClick={(event) => event.stopPropagation()}><Share2 />
          <span className="ml-1 text-sm">0</span></button>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {

  const { data, isLoading } = useQuery({
    queryKey: ['observations'],
    queryFn:  getObservations,
  });

  if(isLoading) return null;

  return (
    <div className="min-h-screen bg-teal-600/10 flex justify-center gap-6 p-1 md:p-5">
      <div className="flex w-full max-w-6xl gap-6"> 
      <div className="lg:w-1/2 w-full">
          {data && data.length > 0 ? (
            data.map((item) => <Card key={item.id} item={item} />)
          ) : (
            <div className="no-results">
              <span>🌿</span>
              No species found "
            </div>
          )}
        </div>
        <div className="hidden lg:block w-1/2 sticky p-1 top-5 h-[calc(100vh-90px)] bg-white rounded-xl mb-3 shadow-sm overflow-hidden max-w-2xl">
          <Map />
        </div>
      </div>
    </div>
  );
}
