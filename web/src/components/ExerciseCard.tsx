import type { Exercise } from "../types";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <span className="exercise-name">{exercise.name}</span>
        {exercise.isBodyweightSubstitute && <span className="exercise-badge">Substituted (no equipment)</span>}
      </div>
      <p className="exercise-detail">
        {exercise.sets} sets × {exercise.reps} · rest {exercise.restSeconds}s
      </p>
      <a className="exercise-link" href={exercise.youtubeUrl} target="_blank" rel="noreferrer">
        Watch demo on YouTube ↗
      </a>
    </div>
  );
}
