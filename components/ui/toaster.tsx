import * as React from "react"
import { X } from "lucide-react"

const ToastContext = React.createContext<{
  toast: (props: { title: string; description?: string }) => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a Toaster");
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Array<{ id: number; title: string; description?: string }>>([]);
  const [id, setId] = React.useState(0);

  const toast = React.useCallback((props: { title: string; description?: string }) => {
    setToasts((prev) => [...prev, { ...props, id: id }]);
    setId((prev) => prev + 1);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  }, [id]);

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-background border rounded-lg shadow-lg p-4 min-w-[300px]"
          >
            <p className="font-medium">{t.title}</p>
            {t.description && (
              <p className="text-sm text-muted-foreground">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}