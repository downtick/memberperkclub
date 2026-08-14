"use client";
import Icon from "./Icon";

// The outbound "Get deal" action. Same family as the Join button, one step
// lighter (.btn-deal) so it doesn't compete with it. Never ember.
export default function ResourceClickLink({
  href,
  label = "Get deal",
}: {
  href: string;
  label?: string;
}) {
  function logClick() {
    fetch("/api/resource-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: href }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={logClick}
      className="btn btn-deal"
    >
      {label} <Icon name="arrow" />
    </a>
  );
}
