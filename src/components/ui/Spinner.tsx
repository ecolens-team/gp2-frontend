import { Loader2 } from "lucide-react";

interface Props {
  className?: string;
}

export default function Spinner({ className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={32} className="animate-spin text-teal-500" />
    </div>
  );
}
