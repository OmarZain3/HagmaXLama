export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EECC4E] border-t-transparent" />
      {message && <p className="text-[#F8ECA7]">{message}</p>}
    </div>
  );
}
