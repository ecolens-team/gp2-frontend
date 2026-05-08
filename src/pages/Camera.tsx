import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { WebCamera, type WebCameraHandler } from "@shivantra/react-web-camera";
import { ArrowLeft, SwitchCamera, Image as ImageIcon, CheckCircle2, Loader2, MapPin, Plus, Upload, Cloud, MapPinned, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Map, { Marker, GeolocateControl, NavigationControl, type MapRef, FullscreenControl,type GeolocateControlInstance} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { createObservation, predictSpecies, type IObservationPayload } from "../services/observationsService";
import { getQuests, submitObservationToQuest } from "../services/questService";
import { useQuery } from "@tanstack/react-query";
import { PickerModal, PickerTrigger, type PickerOption } from "../components/ui/PickerModal";
import toast from "react-hot-toast";
import { usePageLayout } from "../contexts/UIContext";

const WEATHER_OPTIONS: PickerOption[] = [
  { value: 'Sunny', label: 'Clear / Sunny' },
  { value: 'Partially Cloudy', label: 'Partially Cloudy' },
  { value: 'Cloudy', label: 'Cloudy / Overcast' },
  { value: 'Foggy', label: 'Fog / Mist' },
  { value: 'Rainy', label: 'Rain' },
  { value: 'Snowy', label: 'Snow' },
  { value: 'Stormy', label: 'Thunderstorm' },
  { value: 'Hazy', label: 'Haze / Smoke / Dust' },
];

const GOVERNORATE_OPTIONS: PickerOption[] = [
  { value: 'Ajloun', label: 'Ajloun' },
  { value: 'Amman', label: 'Amman' },
  { value: 'Aqaba', label: 'Aqaba' },
  { value: 'Balqa', label: 'Balqa' },
  { value: 'Irbid', label: 'Irbid' },
  { value: 'Jerash', label: 'Jerash' },
  { value: 'Karak', label: 'Karak' },
  { value: 'Maan', label: "Ma'an" },
  { value: 'Madaba', label: 'Madaba' },
  { value: 'Mafraq', label: 'Mafraq' },
  { value: 'Tafilah', label: 'Tafilah' },
  { value: 'Zarqa', label: 'Zarqa' },
];


interface CameraControlsProps {
  cameraHandler: RefObject<WebCameraHandler | null>;
  handleCapture: () => void;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}
function CameraControls({ cameraHandler, handleCapture, handleFileUpload }: CameraControlsProps) {
  return(
    <div className="bg-teal-200/10 p-3 px-8 flex justify-between items-center z-150 bottom-0 absolute gap-16 m-3 backdrop-blur-xl rounded-full">
        <label className="p-3 bg-teal-900 rounded-full text-white cursor-pointer hover:bg-teal-700 transition ring-2 ring-white/30">
            <ImageIcon size={28} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>

        <button 
            onClick={handleCapture}
            className="w-18 h-18 bg-white rounded-full border-4 border-gray-400 active:scale-95 transition-transform"
        />

        <button 
            onClick={() => cameraHandler.current?.switch()}
            className="p-3 bg-teal-900 rounded-full text-white hover:bg-teal-700 transition ring-2 ring-white/30"
        >
            <SwitchCamera size={28} />
        </button>
    </div>
  );
}

interface LocationPickerProps {
    lat: number | "";
    lng: number | "";
    onLocationChange: (lat: number, lng: number) => void;
}

function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const geolocateRef = useRef<GeolocateControlInstance>(null);
  
  const [viewState, setViewState] = useState({
     longitude: lng || 35.9,
     latitude: lat || 31.8,
     zoom: 13
  });

  useEffect(() => {
      if (lat && lng) {
          setViewState(prev => ({ ...prev, latitude: Number(lat), longitude: Number(lng) }));
      }
  }, [lat, lng]);

  useEffect(() => {
    if(!mapRef.current || !geolocateRef.current ) return;
    
    geolocateRef.current.trigger();
  }, []);

  return (
    <div className="h-64 w-full rounded-3xl overflow-hidden border-2 border-teal-600/20  relative">
      <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          onClick={(e) => onLocationChange(e.lngLat.lat, e.lngLat.lng)}
      >
        <GeolocateControl 
            position="top-left" 
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            onGeolocate={(e) => {
                onLocationChange(e.coords.latitude, e.coords.longitude);
            }}
            ref={geolocateRef}
        />
        <FullscreenControl />
        <NavigationControl position="top-right" />

        {lat && lng && (
            <Marker 
                latitude={Number(lat)} 
                longitude={Number(lng)} 
                draggable 
                onDragEnd={(e) => onLocationChange(e.lngLat.lat, e.lngLat.lng)}
                anchor="bottom"
            >
                <div className="text-teal-600 drop-shadow-md hover:scale-110 transition-transform">
                    <MapPin size={40} fill="teal" className="text-white" />
                </div>
            </Marker>
        )}
    </Map>
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="bg-white/80 backdrop-blur text-xs px-3 py-1 rounded-full text-teal-800 font-medium ">
          Tap map or drag pin to adjust
        </span>
      </div>
    </div>
  );
}

const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
};


export default function AddObservation() {
    const navigate = useNavigate();
    const cameraHandler = useRef<WebCameraHandler>(null);
    
    const [step, setStep] = useState<"CAMERA" | "DETAILS">(window.innerWidth > 768 ? "DETAILS" : "CAMERA");
    const [latitude, setLatitude] = useState<number | "">("");
    const [longitude, setLongitude] = useState<number | "">("");
    const [weather, setWeather] = useState("");
    const [governorate, setGovernorate] = useState("");
    const [dateTime, setDateTime] = useState(getLocalISOString());
    
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    
    const [isPredicting, setIsPredicting] = useState(false);
    const [aiPrediction, setAiPrediction] = useState<{ species: string, confidence: number } | null>(null);
    const [selectedQuestId, setSelectedQuestId] = useState<string>("");
    const [openPicker, setOpenPicker] = useState<'weather' | 'governorate' | 'quest' | null>(null);

    usePageLayout({
      mobileTitleBar: { title: 'New Observation', fallbackPath: '/' },
      hideBottomNav: true
    });

    const { data: joinedQuests = [] } = useQuery({
      queryKey: ['quests'],
      queryFn: getQuests,
      select: (data) => data.filter(q => q.isJoined),
    });

    async function handleCapture() {
        const file = await cameraHandler.current?.capture();
        if (file) {
            setImageFiles((prev) => [...prev, file]);
            setPreviewUrls((prev) => [...prev, URL.createObjectURL(file)]); 
            setStep("DETAILS");
            if(!aiPrediction) {
              runAI(file);
            }
        }
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files && files?.length > 0) {
            const filesArray = Array.from(files); 
            setImageFiles((prev) => [...prev, ...filesArray]);
            const urls = filesArray.map(file => URL.createObjectURL(file))
            setPreviewUrls((prev) => [...prev, ...urls]);
            setStep("DETAILS");
            if(!aiPrediction) {
              runAI(filesArray[0]);
            }
        }
    }
    
    async function submitObservation() {
      if(!imageFiles || imageFiles.length < 1 || !longitude || !latitude || !aiPrediction || !aiPrediction.species || !aiPrediction.confidence) {
        toast.error('Please fill all mandatory fields');
        return;
      }
      //todo add better validation and toast notifcations and such

      const newObservationPayload: IObservationPayload = {
        images: imageFiles,
        description: description,
        longitude: longitude,
        latitude: latitude,
        species: aiPrediction?.species,
        confidence_level: aiPrediction.confidence,
        timestamp: dateTime,
        weather: weather || undefined,
        governorate: governorate || undefined,
      }

      
      try {
        const obs = await createObservation(newObservationPayload);
        if (obs && selectedQuestId) {
          try {
            await submitObservationToQuest(selectedQuestId, obs.id);
            toast.success('Observation submitted to quest!');
          } catch (err: any) {
            toast.error(err?.response?.data?.error ?? 'Observation created but quest assignment failed');
          }
        }
        if (obs) navigate('/');
      }
      catch (err: any) {
          toast.error('Error creating observation')
      }
      
    }

    async function runAI(image: File) {
        setIsPredicting(true);

        try {
          const predictionResult = await predictSpecies(image);
          setAiPrediction(predictionResult);
          setIsPredicting(false);
        }
        catch (err: any) {
          setIsPredicting(false);
          toast.error(err?.response?.data?.error || err?.message || 'AI prediction failed')
        }
    }

    if (step === "CAMERA") {
        return (
            <div className="fixed inset-0 z-150 bg-black flex flex-col items-center">
                <div className="flex justify-between items-center p-4 text-white z-10 bg-linear-to-b from-teal-900/40 to-transparent absolute top-0 w-full">
                    <button onClick={() => navigate(-1)} className="p-2 bg-teal-900/40 rounded-full backdrop-blur-lg">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="font-bold tracking-wide">New Observation</span>
                    <div className="w-10"></div>
                </div>

                <div className="grow flex overflow-hidden bottom-0 absolute top-0">
                    <WebCamera
                        style={{ height: "100%", width: "100%", objectFit: "cover" }}
                        captureMode="back"
                        ref={cameraHandler}
                    />
                </div>

                <CameraControls 
                  cameraHandler={cameraHandler}
                  handleCapture={handleCapture}
                  handleFileUpload={handleFileUpload}
                />
            </div>
        );
    }

    return (
        <div className=" overflow-y-auto flex flex-col pb-24 max-w-4xl mx-auto bg-white">

            <label className="m-4 h-72 rounded-3xl  border-2 border-teal-600/30 flex justify-center items-center flex-col gap-3 text-teal-700/70 font-bold bg-gray-200">
              {previewUrls.length > 0 ? <img 
                    src={previewUrls[selectedImage]!} 
                    alt="Preview" 
                    className="w-full h-71 object-cover rounded-3xl"
                /> 
              :
              <>
                <Upload size={44}/>
                <span >Upload images</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </>
              }
            </label>

            <div className="border-b-2  border-teal-600/20 mb-4">
              <span className="text-gray-400 p-4 text-sm">Additional photos</span>
              <div className="flex gap-4 m-4">
                {
                  previewUrls.map((url, index) =>
                  <button className={`${index == selectedImage ? 'border-3 border-teal-400/40' : 'border-2 border-teal-600/20'} w-24 h-24 rounded-3xl bg-gray-200 text-gray-400 flex justify-center items-center active:scale-95 transition-transform`}
                    onClick={() => { setSelectedImage(index) }}
                    >
                      <img src={url}
                        className="object-cover rounded-3xl w-full h-full"
                      />
                  </button>)
                }
                <button className="w-24 h-24 border-2 border-teal-600/20  rounded-3xl bg-gray-200 text-gray-400 flex justify-center items-center active:scale-95 transition-transform"
                    onClick={() => { setStep(window.innerWidth > 768 ? "DETAILS" : "CAMERA") }}
                    >
                      <Plus size={30} />
                  </button>
              </div>
            </div>


            <div className="px-4 mb-4">
                <div className="bg-white rounded-3xl border-2 border-teal-600/20  p-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Species Identification</p>
                    
                    {isPredicting ? (
                        <div className="flex items-center gap-3 py-2">
                            <Loader2 className="animate-spin text-teal-600" size={24} />
                            <span className="text-gray-600 font-medium animate-pulse">BioCLIP is analyzing image...</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{aiPrediction?.species}</h3>
                                <div className="flex items-center gap-1 mt-1 text-teal-600 text-sm font-medium">
                                    <CheckCircle2 size={16} />
                                    <span>AI Suggestion</span>
                                </div>
                            </div>
                            <div className="bg-teal-50 border border-teal-200 text-teal-700 font-bold px-3 py-1.5 rounded-full">
                                {aiPrediction?.confidence && (aiPrediction?.confidence * 100).toFixed(2)}%
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="px-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider pl-2">Location</p>
                <LocationPicker 
                    lat={latitude} 
                    lng={longitude} 
                    onLocationChange={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                    }}
                />
            </div>

            <div className="px-4 mb-4 w-full">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider pl-2">Date and time</p>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="border-2 border-teal-600/20 rounded-3xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-600 text-sm font-bold"
              />
            </div>

            <div className="px-4 flex flex-col gap-4">
                <div className="bg-white rounded-3xl border-2 border-teal-600/20  overflow-hidden">
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add optional notes about the observation (habitat, appearance, behavior)..."
                        className="w-full h-32 p-4 text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                    />
                </div>
            </div>
            <div className="px-4 flex flex-col gap-3 mb-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2 mt-4">Optional Data</p>
              <PickerTrigger
                label="Weather Conditions"
                value={WEATHER_OPTIONS.find(o => o.value === weather)?.label ?? weather}
                onClick={() => setOpenPicker('weather')}
                icon={<Cloud size={16} />}
              />
              <PickerTrigger
                label="Governorate"
                value={governorate}
                onClick={() => setOpenPicker('governorate')}
                icon={<MapPinned size={16} />}
              />
              {joinedQuests.length > 0 && (
                <PickerTrigger
                  label="Add to Quest or Event"
                  value={joinedQuests.find(q => String(q.id) === selectedQuestId)?.title ?? ''}
                  onClick={() => setOpenPicker('quest')}
                  icon={<Trophy size={16} />}
                />
              )}
            </div>

            {openPicker === 'weather' && (
              <PickerModal
                title="Weather Conditions"
                options={WEATHER_OPTIONS}
                value={weather}
                onChange={setWeather}
                onClose={() => setOpenPicker(null)}
                clearLabel="Clear selection"
              />
            )}
            {openPicker === 'governorate' && (
              <PickerModal
                title="Governorate"
                options={GOVERNORATE_OPTIONS}
                value={governorate}
                onChange={setGovernorate}
                onClose={() => setOpenPicker(null)}
                clearLabel="Clear selection"
              />
            )}
            {openPicker === 'quest' && (
              <PickerModal
                title="Add to Quest or Event"
                options={joinedQuests.map(q => ({
                  value: String(q.id),
                  label: q.title,
                  sublabel: `+${q.rewardPts} XP · ${q.progressPercent}% complete`,
                }))}
                value={selectedQuestId}
                onChange={setSelectedQuestId}
                onClose={() => setOpenPicker(null)}
                clearLabel="Don't assign to a quest"
              />
            )}

            <div className="fixed bottom-0 w-full p-4 bg-white border-t border-gray-100 z-50 flex items-center">
                <button
                    disabled={isPredicting}
                    className="w-full max-w-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-bold py-4 rounded-full shadow-lg transition-colors text-lg flex justify-center items-center gap-2 "
                    onClick={submitObservation}
                >
                    {isPredicting ? "Processing..." : "Submit Observation"}
                </button>
            </div>
        </div>
    );
}