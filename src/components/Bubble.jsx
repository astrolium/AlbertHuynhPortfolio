/* One iMessage bubble. Used by the contact thread, and as the small asides
 * that turn up beside the hero and each work chapter, so the conversation at
 * the bottom of the page has been quietly going on the whole way down.
 * Needs an `.imsg` ancestor for its colours. */
export default function Bubble({ children, tail, reaction, sent, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={[
        "bubble",
        sent ? "bubble--sent" : "",
        tail ? "bubble--tail" : "",
        reaction ? "bubble--reacted" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {reaction && (
        <span className="bubble__reaction" aria-label={`Reacted ${reaction}`}>
          {reaction}
        </span>
      )}
      {children}
    </Tag>
  );
}
