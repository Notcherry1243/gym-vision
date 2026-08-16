export function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="subtitle">{label}</p>
    </div>
  );
}
