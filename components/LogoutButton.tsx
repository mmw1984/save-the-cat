"use client";

export default function LogoutButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="link-btn"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.reload();
      }}
    >
      {label}
    </button>
  );
}
