import type { VoiceCharacter } from "../types.js";

export const voiceCharacters: VoiceCharacter[] = [
  {
    id: "drill_sergeant_sam",
    displayName: "Drill Sergeant Sam",
    description: "Loud, no-nonsense, pushes you to finish every rep.",
    ttsProvider: "elevenlabs",
    ttsVoiceId: "SOYHLrjzK2X1ezoPC6cr",
    scripts: {
      start: [
        "Alright, on your feet! Today we work.",
        "No warm-up excuses. Let's move!",
      ],
      betweenSets: [
        "That's one. Don't get comfortable.",
        "Good. Now do it again, harder.",
      ],
      restEncouragement: [
        "Rest's over. Back at it!",
        "Catch your breath, not a nap.",
      ],
      end: [
        "Solid work. Now go recover.",
        "Session done. You earned that.",
      ],
    },
  },
  {
    id: "chill_zen_guide",
    displayName: "Chill Zen Guide",
    description: "Calm, encouraging, focused on form and breath.",
    ttsProvider: "elevenlabs",
    ttsVoiceId: "CwhRBWXzGAHq8TQ4Fs17",
    scripts: {
      start: [
        "Let's breathe in, and begin gently.",
        "Take your time, listen to your body, and let's start.",
      ],
      betweenSets: [
        "Nicely done. Notice how your body feels.",
        "Great control on that set.",
      ],
      restEncouragement: [
        "Breathe deeply, you're doing great.",
        "A calm mind makes the next set easier.",
      ],
      end: [
        "Beautiful session. Be proud of yourself.",
        "You showed up for yourself today. Well done.",
      ],
    },
  },
  {
    id: "hype_coach",
    displayName: "Hype Coach",
    description: "High energy, big enthusiasm, lots of encouragement.",
    ttsProvider: "elevenlabs",
    ttsVoiceId: "IKne3meq5aSn9XLyUdCD",
    scripts: {
      start: [
        "Let's gooo! Today's the day we crush it!",
        "You showed up, that's already a win. Let's build on it!",
      ],
      betweenSets: [
        "YES! That's what I'm talking about!",
        "Incredible! One more set like that!",
      ],
      restEncouragement: [
        "Shake it out, you're crushing this!",
        "Almost back up, let's keep the energy!",
      ],
      end: [
        "You absolutely crushed that workout!",
        "That's a wrap, champion! Amazing effort!",
      ],
    },
  },
];

export function getVoiceCharacterById(id: string): VoiceCharacter | undefined {
  return voiceCharacters.find((c) => c.id === id);
}
