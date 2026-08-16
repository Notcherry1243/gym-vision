import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PhotoCapturePage } from "./pages/PhotoCapture";
import { GoalPage } from "./pages/Goal";
import { RoutinePage } from "./pages/Routine";
import { VoicePickerPage } from "./pages/VoicePicker";
import { SessionPage } from "./pages/Session";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhotoCapturePage />} />
        <Route path="/goal" element={<GoalPage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/voice-picker" element={<VoicePickerPage />} />
        <Route path="/session" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
