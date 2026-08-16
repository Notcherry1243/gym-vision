import { useState } from "react";
import type { DetectedEquipment } from "../types";
import { EQUIPMENT_OPTIONS } from "../data/equipmentOptions";

interface Props {
  equipment: DetectedEquipment[];
  onToggle: (id: string) => void;
  onAdd: (id: string, label: string) => void;
  hasAnalyzed?: boolean;
}

export function EquipmentChecklist({ equipment, onToggle, onAdd, hasAnalyzed }: Props) {
  const [showAddList, setShowAddList] = useState(false);
  const knownIds = new Set(equipment.map((e) => e.id));
  const addableOptions = EQUIPMENT_OPTIONS.filter((opt) => !knownIds.has(opt.id));

  return (
    <div className="checklist">
      {equipment.length === 0 &&
        (hasAnalyzed ? (
          <div className="banner-success">
            <span>✓</span>
            <span>No gym equipment detected — we'll build you a bodyweight-only routine instead.</span>
          </div>
        ) : (
          <p className="subtitle">No equipment detected yet.</p>
        ))}

      {equipment.map((item) => (
        <button
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={`checklist-row${item.userConfirmed ? " confirmed" : ""}`}
        >
          <span className="checklist-label">{item.label}</span>
          <span className="checklist-confidence">{Math.round(item.confidence * 100)}%</span>
          <span className="checklist-check">{item.userConfirmed ? "✓" : ""}</span>
        </button>
      ))}

      {!showAddList && (
        <button className="btn-secondary" onClick={() => setShowAddList(true)}>
          + Add equipment the scan missed
        </button>
      )}

      {showAddList && (
        <div className="chip-grid">
          {addableOptions.map((opt) => (
            <button
              key={opt.id}
              className="chip"
              onClick={() => {
                onAdd(opt.id, opt.label);
              }}
            >
              + {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
