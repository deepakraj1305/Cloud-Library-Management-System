import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

let externalShow: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(msg: string, type: ToastType = 'success') {
  externalShow?.(msg, type);
}

export default function ToastHost() {
  const [items, setItems] = useState<{ id: number; msg: string; type: ToastType }[]>([]);

  useEffect(() => {
    externalShow = (msg: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => {
      externalShow = null;
    };
  }, []);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          style={{ animation: 'toastIn 0.25s ease-out' }}
        >
          {icons[t.type]}
          <span className="text-sm font-medium text-slate-700">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
