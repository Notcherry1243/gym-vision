import { useNavigate } from "react-router-dom";
import { ExerciseCard } from "../components/ExerciseCard";
import { StepHeader } from "../components/StepHeader";
import { useSessionStore } from "../state/sessionStore";

export function RoutinePage() {
  const navigate = useNavigate();
  const routine = useSessionStore((s) => s.routine);

  if (!routine) {
    return <p className="subtitle">No routine yet — go back and generate one.</p>;
  }

  return (
    <>
      <StepHeader step={3} total={5} label="Your routine" />
      <h1 style={{ textTransform: "capitalize" }}>
        {routine.goal.replace("_", " ")} · {routine.intensity}
      </h1>
      <p className="subtitle">{routine.exercises.length} exercises</p>

      <div className="exercise-list">
        {routine.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <button className="btn-primary bottom-cta" onClick={() => navigate("/voice-picker")}>
        Choose Your Voice Mentor
      </button>
    </>
  );
}
