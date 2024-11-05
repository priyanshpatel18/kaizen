interface DropIndicatorProps {
  edge: "top" | "bottom";
  gap: string;
}

export default function DropIndicator({ edge, gap }: DropIndicatorProps) {
  const edgeClassMap = {
    top: `-top-[calc(0.65*(${gap} + 2px))]`,
    bottom: `-bottom-[calc(0.65*(${gap} + 2px))]`,
  };

  return (
    <div
      style={{ "--gap": gap } as React.CSSProperties}
      className={`absolute z-10 bg-blue-600 pointer-events-none h-[2px] left-[4px] right-[4px] -top-1 ${edgeClassMap[edge]}`}
    ></div>
  );
}
