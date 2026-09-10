
export default function DROLogo({
  className = "",
  size=50,
  fill="currentColor",
  ...props
}) {
  const style = size
    ? { width: size, height: size }
    : undefined;

  return (
    <img
      src="/DRO_logo_editable.svg"
      alt="DRO Logo"
      className={className}
      width={size}
      height={size}

      {...props}
    />
  );
}
