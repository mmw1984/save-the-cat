/* eslint-disable @next/next/no-img-element */
export default function CatIcon({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/cat-48.png"
      width={size}
      height={size}
      alt=""
      style={{ display: "block", width: size, height: size }}
    />
  );
}
