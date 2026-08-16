import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  onComplete: () => void;
}

export function RestTimer({ seconds, onComplete }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div>
      <div className="timer">{remaining}s</div>
      <div className="timer-label">Rest</div>
    </div>
  );
}
