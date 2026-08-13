import { MOODS, type Mood, MOOD_BY_KEY } from "../types/library";

interface Props {
  value: Mood | null;
  onChange: (m: Mood) => void;
}

// The emotional heart of hoshii. Each mood is a pill showing emoji +
// label; hovering hints its phrase, and the selected mood reveals its
// prescription below.
export default function MoodPicker({ value, onChange }: Props) {
  const selected = value ? MOOD_BY_KEY[value] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => {
          const active = value === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onChange(m.key)}
              title={m.phrase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition border"
              style={
                active
                  ? {
                      backgroundColor: m.color,
                      borderColor: m.color,
                      color: "#fff",
                    }
                  : {
                      backgroundColor: "transparent",
                      borderColor: m.color + "66",
                      color: "#4a3f3a",
                    }
              }
            >
              <span className="text-base">{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="mt-3 px-3 py-2 rounded-lg text-sm"
          style={{ backgroundColor: selected.color + "22" }}
        >
          <span className="italic text-ink/70">{selected.phrase}</span>
          <span className="text-ink/45"> · {selected.prescription}</span>
        </div>
      )}
    </div>
  );
}