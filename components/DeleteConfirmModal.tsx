"use client";

interface DeleteConfirmModalProps {
  productName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  productName,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Delete Product</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)]">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p className="text-[var(--muted)]">
            Are you sure you want to delete <strong className="text-[var(--foreground)]">{productName}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn btn-danger">
            {loading ? <span className="spinner" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
