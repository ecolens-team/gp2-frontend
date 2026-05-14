import { Loader2 } from 'lucide-react';

interface Props {
  className?: string;
}

export default function Spinner({ className = '' }: Props) {
  return (
    <div
      role='status'
      className={`flex items-center justify-center ${className}`}
    >
      <Loader2 size={32} className='animate-spin text-teal-500' />
      <span className='sr-only'>Loading...</span>
    </div>
  );
}
