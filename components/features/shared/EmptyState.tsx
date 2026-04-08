export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <p className="text-sm text-zinc-500 text-center">{message}</p>
    </div>
  )
}
