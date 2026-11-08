"use client";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type Props = {
  value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; minLength?: number;
};

export default function PasswordField({ value, onChange, placeholder = "Password", autoComplete, minLength }: Props) {
  const [show, setShow] = useState(false);
  return (
    <label className="field-label">
      <span className="field-title"><Lock size={18} />Password</span>
      <span className="input-wrap">
        <input type={show ? "text" : "password"} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} required minLength={minLength} autoComplete={autoComplete} />
        <button type="button" className="input-toggle" onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"} title={show ? "Hide password" : "Show password"}>
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </span>
    </label>
  );
}