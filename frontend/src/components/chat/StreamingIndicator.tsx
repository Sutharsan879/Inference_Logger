export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-2 text-sm text-gray-500 sm:px-4">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
      </span>
      Generating response…
    </div>
  );
}
