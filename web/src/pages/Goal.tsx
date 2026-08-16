import { useNavigate } from "react-router-dom";
import type { MuscleGroup } from "../types";
import { EquipmentChecklist } from "../components/EquipmentChecklist";
import { IntensitySelector } from "../components/IntensitySelector";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { StepHeader } from "../components/StepHeader";
import { useGenerateRoutine } from "../hooks/useGenerateRoutine";
import { useSessionStore } from "../state/sessionStore";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "biceps",
  "triceps",
  "chest",
  "back",
  "shoulders",
  "legs",
  "glutes",
  "core",
  "full_body",
];

export function GoalPage() {
  const navigate = useNavigate();
  const detectedEquipment = useSessionStore((s) => s.detectedEquipment);
  const hasAnalyzed = useSessionStore((s) => s.hasAnalyzed);
  const toggleEquipmentConfirmed = useSessionStore((s) => s.toggleEquipmentConfirmed);
  const addManualEquipment = useSessionStore((s) => s.addManualEquipment);
  const goal = useSessionStore((s) => s.goal);
  const setGoal = useSessionStore((s) => s.setGoal);
  const intensity = useSessionStore((s) => s.intensity);
  const setIntensity = useSessionStore((s) => s.setIntensity);
  const { runGenerate, loading, error } = useGenerateRoutine();

  async function handleContinue() {
    const ok = await runGenerate();
    if (ok) navigate("/routine");
  }

  if (loading) return <LoadingOverlay label="Building your routine..." />;

  return (
    <>
      <StepHeader step={2} total={5} label="Confirm equipment" />
      <h2 style={{ marginTop: 0 }}>Detected equipment</h2>
      <p className="subtitle">Tap to confirm/deselect anything we got wrong.</p>
      <EquipmentChecklist
        equipment={detectedEquipment}
        onToggle={toggleEquipmentConfirmed}
        onAdd={addManualEquipment}
        hasAnalyzed={hasAnalyzed}
      />

      <h2>What are you working on?</h2>
      <div className="chip-grid">
        {MUSCLE_GROUPS.map((mg) => (
          <button
            key={mg}
            onClick={() => setGoal(mg)}
            className={`chip${goal === mg ? " selected" : ""}`}
          >
            {mg.replace("_", " ")}
          </button>
        ))}
      </div>

      <h2>Intensity</h2>
      <IntensitySelector value={intensity} onChange={setIntensity} />

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary bottom-cta" onClick={handleContinue}>
        Generate Routine
      </button>
    </>
  );
}
