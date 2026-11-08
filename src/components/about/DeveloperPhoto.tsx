"use client";
import { useState } from "react";

/** Shows the developer photo; falls back to initials if the image file is missing. */
export default function DeveloperPhoto({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  return (
    <div className="dev-photo">
      {failed
        ? <span className="dev-initials" role="img" aria-label={name}>{initials}</span>
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={src} alt={`Photo of ${name}`} onError={() => setFailed(true)} />}
    </div>
  );
}