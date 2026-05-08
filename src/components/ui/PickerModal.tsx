import { X, CheckCircle } from 'lucide-react';

export interface PickerOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface PickerModalProps {
  title: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  clearLabel?: string;
}

export function PickerModal({ title, options, value, onChange, onClose, clearLabel }: PickerModalProps) {
  const select = (v: string) => { onChange(v); onClose(); };

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[70vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
          {clearLabel && value && (
            <button
              onClick={() => select('')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all text-left"
            >
              <span className="text-sm text-gray-400 font-medium">{clearLabel}</span>
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                value === opt.value
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div>
                <p className="font-bold text-sm text-gray-800">{opt.label}</p>
                {opt.sublabel && (
                  <p className="text-xs text-teal-600 font-medium mt-0.5">{opt.sublabel}</p>
                )}
              </div>
              {value === opt.value && (
                <CheckCircle size={18} className="text-teal-500 shrink-0 ml-3" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PickerTriggerProps {
  label: string;
  value: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function PickerTrigger({ label, value, onClick, icon }: PickerTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white rounded-3xl border-2 border-teal-600/20 px-5 py-3.5 text-left hover:border-teal-400/40 active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-teal-500 shrink-0">{icon}</span>}
        <span className={`text-sm font-semibold ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value || label}
        </span>
      </div>
      <span className={`text-xs font-black px-3 py-1 rounded-full transition-colors ${
        value
          ? 'bg-teal-100 text-teal-700'
          : 'bg-teal-600 text-white'
      }`}>
        {value ? 'Change' : 'Add'}
      </span>
    </button>
  );
}
