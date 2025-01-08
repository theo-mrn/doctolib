import { useState } from "react";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hour, setHour] = useState(value.split(":")[0] || "");
  const [minute, setMinute] = useState(value.split(":")[1] || "");

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00","05","10", "15","20","25", "30","35","40", "45","50","55"];

  const handleTimeChange = (newHour: string, newMinute: string) => {
    setHour(newHour);
    setMinute(newMinute);
    onChange(`${newHour}:${newMinute}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={hour}
        onChange={(e) => handleTimeChange(e.target.value, minute)}
        className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400"
      >
        <option value="">HH</option>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      :
      <select
        value={minute}
        onChange={(e) => handleTimeChange(hour, e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400"
      >
        <option value="">MM</option>
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}