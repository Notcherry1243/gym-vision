interface Props {
  step: number;
  total: number;
  label: string;
}

export function StepHeader({ step, total, label }: Props) {
  return (
    <div className="step-header">
      Step {step} of {total} · {label}
    </div>
  );
}
