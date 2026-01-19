interface PublishModalProps {
  message: string;
  onClose: () => void;
}

const PublishModal = ({ message, onClose }: PublishModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-panel p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-white">Publish</h3>
        <p className="mt-2 text-sm text-white/70">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
