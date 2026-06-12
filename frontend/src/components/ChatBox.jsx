import MessageBubble from "./MessageBubble";

export default function ChatBox({ messages }) {
  return (
    <div className="space-y-6">
      {messages.map((msg, i) => (
        <MessageBubble key={i} msg={msg} />
      ))}
    </div>
  );
}