interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle = ({ checked, onChange }: ToggleProps) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition-colors ${
      checked ? 'bg-slate-900' : 'bg-slate-300'
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);
