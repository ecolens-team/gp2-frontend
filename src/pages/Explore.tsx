import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getObservations } from "../services/observationsService";
import type { IObservation } from "../interfaces/observations";
import Map from "./Map";
import { MessageCircle, Share2, Heart, MapPin } from "lucide-react";

function Card({ item }: {item: IObservation}) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden max-w-2xl">
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
          <button className={`action-btn active:scale-90 transition-transform ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}>
            {liked ? <Heart fill="teal"/> : <Heart  />}
          </button>
          <button className="action-btn"><MessageCircle /></button>
          <button className="action-btn"><Share2 /></button>
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
