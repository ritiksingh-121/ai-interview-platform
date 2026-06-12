import ReactMarkdown from "react-markdown";

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex flex-col gap-1 max-w-[92%] sm:max-w-xl ${
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 px-1 select-none">
        {isUser ? "You" : "AI"}
      </span>

      <div
        className={`p-3 sm:p-4 rounded-lg border ${
          isUser
            ? "bg-pink-500/10 border-pink-500/25 text-zinc-100"
            : "bg-zinc-900/60 border-zinc-800 text-zinc-100"
        }`}
      >
        <div className="text-sm leading-relaxed max-w-none">
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              code: ({ node, inline, ...props }) => (
                <code
                  className={`${
                    inline
                      ? "bg-zinc-800 px-1.5 py-0.5 rounded text-pink-300 text-xs font-mono"
                      : "block bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-100 font-mono overflow-x-auto my-2"
                  }`}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1.5 mb-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1.5 mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-zinc-400" {...props} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
