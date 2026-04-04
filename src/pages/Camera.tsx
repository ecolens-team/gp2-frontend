import { useRef, useState, type ChangeEvent, type RefObject } from "react";
import { WebCamera, type WebCameraHandler } from "@shivantra/react-web-camera";
import { ArrowLeft, SwitchCamera, Image as ImageIcon, CheckCircle2, Loader2, MapPin, Calendar, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MobileTopBar({ text, onClickFn }: {text: string, onClickFn: () => void}) {
  return (
    <div className="bg-white px-4 py-3 flex items-center border-b border-teal-100 sticky top-0 z-10">
        <button onClick={() => onClickFn()} className="p-2 text-teal-600 rounded-full hover:bg-teal-50">
            <ArrowLeft size={24} />
        </button>
        <h1 className="grow text-center font-bold text-gray-800 pr-10">{ text }</h1>
    </div>
  )
}

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

export default function AddObservation() {
    const navigate = useNavigate();
    const cameraHandler = useRef<WebCameraHandler>(null);
    
    const [step, setStep] = useState<"CAMERA" | "DETAILS">("CAMERA");
    
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    
    const [isPredicting, setIsPredicting] = useState(false);
    const [aiPrediction, setAiPrediction] = useState<{ species: string, confidence: number } | null>(null);

    async function handleCapture() {
        const file = await cameraHandler.current?.capture();
        if (file) {
            setImageFiles((prev) => [...prev, file]);
            setPreviewUrls((prev) => [...prev, URL.createObjectURL(file)]); 
            setStep("DETAILS");
            if(!aiPrediction) {
              runAI();
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
              runAI();
            }
        }
    }

    function runAI() {
        setIsPredicting(true);

        //i will add an endpoint to the backend that only runs the ai, and the endpoint that adds observation maybe just adds it to db ie requires species to be already in payload or make it that it runs ai if species not in payload only
        setTimeout(() => {
            setAiPrediction({ species: "Iris nigricans (Black Iris)", confidence: 94.2 });
            setIsPredicting(false);
        }, 2500); 
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
        <div className="fixed inset-0 z-100 bg-gray-50 overflow-y-auto flex flex-col pb-24">
          <div className="md:hidden">
            <MobileTopBar text={'New Observation'} onClickFn={() => { setStep('CAMERA') }}/>
          </div>

            {/* Image Preview */}
            <div className="p-4 ">
                <img 
                    src={previewUrl!} 
                    alt="Preview" 
                    className="w-full h-72 object-cover rounded-3xl shadow-sm border-2 border-teal-600/30"
                />
            </div>

            {/*additional photos */}

            <div className="border-b-2  border-teal-600/20 mb-4">
              <span className="text-gray-400 p-4 text-sm">Additional photos</span>
              <button className="w-24 h-24 border-2 border-teal-600/20 m-4 rounded-3xl bg-gray-200 text-gray-400 flex justify-center items-center active:scale-95 transition-transform"
              onClick={() => { setStep('CAMERA') }}
              >
                <Plus size={30} />
              </button>
            </div>

            {/* AI Suggestion Box */}
            <div className="px-4 mb-4">
                <div className="bg-white rounded-2xl border-2 border-teal-100/60 shadow-sm p-4">
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
                                {aiPrediction?.confidence}%
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="px-4 flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add optional notes about the observation (habitat, appearance, behavior)..."
                        className="w-full h-32 p-4 text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                    />
                </div>
            </div>

            {/* Submit Button fixed to bottom */}
            <div className="fixed bottom-0 w-full p-4 bg-white border-t border-gray-100">
                <button 
                    disabled={isPredicting}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-bold py-4 rounded-full shadow-lg transition-colors text-lg flex justify-center items-center gap-2"
                >
                    {isPredicting ? "Processing..." : "Submit Observation"}
                </button>
            </div>
        </div>
    );
}