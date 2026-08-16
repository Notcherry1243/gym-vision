import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HoldTimerCamera } from "../components/HoldTimerCamera";
import { RepCounterCamera } from "../components/RepCounterCamera";
import { RestTimer } from "../components/RestTimer";
import { StepHeader } from "../components/StepHeader";
import { useVoiceMentor } from "../hooks/useVoiceMentor";
import { useSessionStore } from "../state/sessionStore";
import { parseHoldSeconds } from "../utils/parseHoldSeconds";
import { parseRepTarget } from "../utils/parseRepTarget";

export function SessionPage() {
  const navigate = useNavigate();
  const routine = useSessionStore((s) => s.routine);
  const currentExerciseIndex = useSessionStore((s) => s.currentExerciseIndex);
  const currentSetIndex = useSessionStore((s) => s.currentSetIndex);
  const advanceSet = useSessionStore((s) => s.advanceSet);
  const resetSession = useSessionStore((s) => s.resetSession);
  const { playLine, muted, toggleMuted } = useVoiceMentor();

  const [resting, setResting] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  const exercise = routine?.exercises[currentExerciseIndex];
  const targetReps = exercise ? parseRepTarget(exercise.reps) : null;
  const holdSeconds = exercise ? parseHoldSeconds(exercise.reps) : null;
  const cameraAvailable = targetReps !== null || holdSeconds !== null;

  useEffect(() => {
    if (routine && !started) {
      playLine("start");
      setStarted(true);
    }
  }, [routine, started, playLine]);

  useEffect(() => {
    if (routine && currentExerciseIndex >= routine.exercises.length && !finished) {
      setFinished(true);
      playLine("end");
    }
  }, [routine, currentExerciseIndex, finished, playLine]);

  if (!routine) {
    return <p className="subtitle">No routine loaded.</p>;
  }

  if (finished) {
    return (
      <div className="session-container">
        <StepHeader step={5} total={5} label="Workout mode" />
        <div className="session-title">Workout complete!</div>
        <button
          className="btn-primary"
          onClick={() => {
            resetSession();
            navigate("/");
          }}
        >
          Start a New Session
        </button>
      </div>
    );
  }

  if (!exercise) {
    return <p className="subtitle">Loading next exercise...</p>;
  }

  function handleSetComplete() {
    playLine("betweenSets");
    if (exercise!.restSeconds >= 20) {
      setResting(true);
    } else {
      advanceSet();
    }
  }

  function handleRestComplete() {
    playLine("restEncouragement");
    setResting(false);
    advanceSet();
  }

  return (
    <div className="session-container">
      <StepHeader step={5} total={5} label="Workout mode" />
      <div className="session-title">{exercise.name}</div>
      <div className="session-subtitle">
        Set {currentSetIndex + 1} of {exercise.sets} · {exercise.reps}
      </div>

      {resting ? (
        <RestTimer seconds={exercise.restSeconds} onComplete={handleRestComplete} />
      ) : useCamera && targetReps ? (
        <>
          <RepCounterCamera
            key={`${currentExerciseIndex}-${currentSetIndex}`}
            exercise={exercise}
            targetReps={targetReps}
            onRepCounted={() => {}}
            onTargetReached={handleSetComplete}
          />
          <button className="toggle-link" onClick={() => setUseCamera(false)}>
            Switch to manual button
          </button>
        </>
      ) : useCamera && holdSeconds ? (
        <>
          <HoldTimerCamera
            key={`${currentExerciseIndex}-${currentSetIndex}`}
            seconds={holdSeconds}
            onComplete={handleSetComplete}
          />
          <button className="toggle-link" onClick={() => setUseCamera(false)}>
            Switch to manual button
          </button>
        </>
      ) : (
        <>
          <button className="btn-primary" style={{ width: "auto", padding: "16px 32px" }} onClick={handleSetComplete}>
            Set Complete
          </button>
          {cameraAvailable && (
            <button className="toggle-link" onClick={() => setUseCamera(true)}>
              {targetReps ? "Use camera to count reps" : "Use camera as hold timer"}
            </button>
          )}
        </>
      )}

      <button className="mute-button" onClick={toggleMuted}>
        {muted ? "Unmute Mentor" : "Mute Mentor"}
      </button>
    </div>
  );
}
