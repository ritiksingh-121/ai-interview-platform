import ReactMarkdown from "react-markdown";

export default function MessageBubble({ msg }) {
  return (
    <div
      className={`p-3 rounded max-w-2xl whitespace-pre-wrap ${
        msg.role === "user"
          ? "bg-blue-500 ml-auto"
          : "bg-gray-700"
      }`}
    >
      <p className="text-xs opacity-60 mb-1">
        {msg.role === "user" ? "You" : "Interviewer"}
      </p>

      <div className="text-sm leading-relaxed">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
}