// Supabase Database 타입 정의
// supabase/schema.sql 과 동기화 필요

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          start_date: string | null;
          current_week: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          start_date?: string | null;
          current_week?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          start_date?: string | null;
          current_week?: number;
        };
      };
      sleep_diary: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          bedtime: string | null;
          wake_time: string | null;
          sleep_onset_latency: number | null;
          awakenings: number | null;
          waso: number | null;
          sleep_quality: number | null;
          morning_mood: string | null;
          total_sleep_time: number | null;
          sleep_efficiency: number | null;
          stress_level: number | null;
          caffeine: boolean | null;
          caffeine_last_time: string | null;
          exercise: boolean | null;
          exercise_type: string | null;
          nap: boolean | null;
          nap_duration: number | null;
          worry_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          bedtime?: string | null;
          wake_time?: string | null;
          sleep_onset_latency?: number | null;
          awakenings?: number | null;
          waso?: number | null;
          sleep_quality?: number | null;
          morning_mood?: string | null;
          total_sleep_time?: number | null;
          sleep_efficiency?: number | null;
          stress_level?: number | null;
          caffeine?: boolean | null;
          caffeine_last_time?: string | null;
          exercise?: boolean | null;
          exercise_type?: string | null;
          nap?: boolean | null;
          nap_duration?: number | null;
          worry_note?: string | null;
          created_at?: string;
        };
        Update: {
          date?: string;
          bedtime?: string | null;
          wake_time?: string | null;
          sleep_onset_latency?: number | null;
          awakenings?: number | null;
          waso?: number | null;
          sleep_quality?: number | null;
          morning_mood?: string | null;
          total_sleep_time?: number | null;
          sleep_efficiency?: number | null;
          stress_level?: number | null;
          caffeine?: boolean | null;
          caffeine_last_time?: string | null;
          exercise?: boolean | null;
          exercise_type?: string | null;
          nap?: boolean | null;
          nap_duration?: number | null;
          worry_note?: string | null;
        };
      };
      mission_logs: {
        Row: {
          id: string;
          user_id: string;
          mission_key: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_key: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          completed?: boolean;
        };
      };
      session_progress: {
        Row: {
          id: string;
          user_id: string;
          completed_sections: Record<string, boolean>;
          practice_checks: Record<string, boolean>;
          reflection_text: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          completed_sections?: Record<string, boolean>;
          practice_checks?: Record<string, boolean>;
          reflection_text?: Record<string, string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          completed_sections?: Record<string, boolean>;
          practice_checks?: Record<string, boolean>;
          reflection_text?: Record<string, string>;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          scores: number[];
          total_score: number;
          severity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scores: number[];
          total_score: number;
          severity: string;
          created_at?: string;
        };
        Update: {
          scores?: number[];
          total_score?: number;
          severity?: string;
        };
      };
    };
  };
}
