import type { Intensity } from "../types";

const OPTIONS: Intensity[] = ["light", "moderate", "intense"];

export function IntensitySelector({
  value,
  onChange,
}: {
  value: Intensity;
  onChange: (intensity: Intensity) => void;
}) {
  return (
    <div className="intensity-row">
      {OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`intensity-option${value === option ? " selected" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
