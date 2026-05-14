import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  fallbackPath?: string;
}

export default function MobileNavBar({ title, fallbackPath = '/' }: Props) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <div className='md:hidden bg-white px-4 py-3 flex items-center border-b border-teal-100 sticky top-0 z-10'>
      <button
        onClick={goBack}
        className='p-2 text-teal-600 rounded-full hover:bg-teal-50'
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className='grow text-center font-bold text-gray-800 pr-10'>
        {title}
      </h1>
    </div>
  );
}
