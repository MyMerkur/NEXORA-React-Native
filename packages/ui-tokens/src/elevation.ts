interface ElevationLevel {
  ios: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  android: { elevation: number };
}

export const elevation = {
  low: {
    ios: { shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.24, shadowRadius: 4 },
    android: { elevation: 2 },
  },
  medium: {
    ios: { shadowColor: "#000000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 16 },
    android: { elevation: 8 },
  },
  high: {
    ios: { shadowColor: "#000000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.4, shadowRadius: 28 },
    android: { elevation: 16 },
  },
} satisfies Record<string, ElevationLevel>;

export type ElevationToken = keyof typeof elevation;
