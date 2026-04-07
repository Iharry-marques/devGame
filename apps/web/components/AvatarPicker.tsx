"use client";

import { AVATAR_DEFINITIONS, AvatarId } from "@social-universe/shared";

type AvatarPickerProps = {
  value: AvatarId;
  onChange: (avatar: AvatarId) => void;
};

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="avatar-grid">
      {AVATAR_DEFINITIONS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          className="avatar-option"
          data-active={value === avatar.id}
          onClick={() => onChange(avatar.id)}
        >
          <div className="avatar-preview" style={{ background: avatar.cssColor }} />
          <strong>{avatar.label}</strong>
        </button>
      ))}
    </div>
  );
}

