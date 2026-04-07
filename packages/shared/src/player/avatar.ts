export const AVATAR_OPTIONS = ["coral", "mint", "sky"] as const;

export type AvatarId = (typeof AVATAR_OPTIONS)[number];

export type AvatarDefinition = {
  id: AvatarId;
  label: string;
  color: number;
  cssColor: string;
};

const AVATAR_DEFINITION_MAP: Record<AvatarId, AvatarDefinition> = {
  coral: {
    id: "coral",
    label: "Coral",
    color: 0xff7f6a,
    cssColor: "#ff7f6a"
  },
  mint: {
    id: "mint",
    label: "Mint",
    color: 0x54d2a3,
    cssColor: "#54d2a3"
  },
  sky: {
    id: "sky",
    label: "Sky",
    color: 0x5ba7ff,
    cssColor: "#5ba7ff"
  }
};

export const AVATAR_DEFINITIONS: AvatarDefinition[] = [
  {
    id: "coral",
    label: "Coral",
    color: 0xff7f6a,
    cssColor: "#ff7f6a"
  },
  {
    id: "mint",
    label: "Mint",
    color: 0x54d2a3,
    cssColor: "#54d2a3"
  },
  {
    id: "sky",
    label: "Sky",
    color: 0x5ba7ff,
    cssColor: "#5ba7ff"
  }
];

export function isAvatarId(value: string): value is AvatarId {
  return AVATAR_OPTIONS.includes(value as AvatarId);
}

export function getAvatarDefinition(avatar: AvatarId): AvatarDefinition {
  return AVATAR_DEFINITION_MAP[avatar];
}
