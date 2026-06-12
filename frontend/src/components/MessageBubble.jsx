import ReactMarkdown from "react-markdown";

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-xl animate-scale-in ${
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1 select-none">
        {isUser ? "Candidate" : "AI Interviewer"}
      </span>

      <div
        className={`p-4 rounded-2xl border shadow-sm transition-all duration-300 ${
          isUser
            ? "bg-accent-500/10 border-accent-500/25 text-white rounded-tr-sm"
            : "bg-darkbg-card border-white/10 text-white/90 rounded-tl-sm"
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
                      ? "bg-white/10 px-1.5 py-0.5 rounded text-accent-300 text-xs font-mono"
                      : "block bg-[#050505] p-3 rounded-lg border border-white/5 text-xs text-white/90 font-mono overflow-x-auto my-2"
                  }`}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1.5 mb-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1.5 mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-white/80" {...props} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
