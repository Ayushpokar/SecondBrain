export type Theme = "dark" | "light";

export type Repo = {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  private: boolean;
  connected: boolean;
  description: string;
  url: string;
  external?: boolean;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  repos?: string[];
};

export type Chat = {
  id: string;
  title: string;
  preview: string;
  time: string;
  messages: Message[];
  pinned?: boolean;
};

export type SettingsSection = "profile" | "model" | "apikeys" | "appearance" | "shortcuts";
