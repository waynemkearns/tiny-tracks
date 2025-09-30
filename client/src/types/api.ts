// Common interfaces
export interface BaseRecord {
  id: number;
  createdAt?: string;
}

// User related interfaces
export interface User extends BaseRecord {
  username: string;
  pregnancyMode: boolean;
}

// Baby related interfaces
export interface Baby extends BaseRecord {
  name: string;
  birthDate: string;
  gender: string;
  userId: number;
}

export interface Feed extends BaseRecord {
  babyId: number;
  type: 'bottle' | 'left_breast' | 'right_breast' | 'both_breasts' | 'solid';
  amount?: number;
  timestamp: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
}

export interface Nappy extends BaseRecord {
  babyId: number;
  type: 'wet' | 'dirty' | 'both';
  timestamp: string;
  notes?: string;
}

export interface SleepSession extends BaseRecord {
  babyId: number;
  type?: 'nap' | 'night';
  startTime: string;
  endTime?: string;
  duration?: number;
  quality?: string;
  location?: string;
  notes?: string;
}

export interface HealthRecord extends BaseRecord {
  babyId: number;
  type: string;
  timestamp: string;
  value?: string;
  notes?: string;
}

export interface GrowthRecord extends BaseRecord {
  babyId: number;
  timestamp: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
  notes?: string;
}

// Pregnancy related interfaces
export interface Pregnancy extends BaseRecord {
  userId: number;
  estimatedDueDate: string;
  lastPeriodDate: string;
  notes?: string;
  isActive: boolean;
  babyId?: number;
}

export interface Contraction extends BaseRecord {
  pregnancyId: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  intensity: number;
  notes?: string;
}

export interface FetalMovement extends BaseRecord {
  pregnancyId: number;
  timestamp: string;
  duration?: number;
  responseToStimuli?: string;
  notes?: string;
}

export interface MaternalHealth extends BaseRecord {
  pregnancyId: number;
  type: 'weight' | 'blood_pressure' | 'symptom' | 'mood';
  timestamp: string;
  value: string;
  details?: string;
  notes?: string;
}

export interface PregnancyAppointment extends BaseRecord {
  pregnancyId: number;
  title: string;
  date: string;
  location?: string;
  notes?: string;
  attachedMedia?: string[];
  completed: boolean;
}

export interface StatsDaily {
  date: string;
  feedCount: number;
  sleepDuration: number;
  nappyCount: number;
}

export interface WeeklyStats {
  daily: StatsDaily[];
}
