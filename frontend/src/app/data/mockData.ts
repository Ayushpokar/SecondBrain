import { AlertCircle, BookOpen, Code2, GitBranch, GitCommit, Layers } from "lucide-react";
import type { Chat, Repo } from "../types";

export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3b82f6", Rust: "#f97316", Python: "#a855f7",
  Go: "#06b6d4", HCL: "#8b5cf6", JavaScript: "#eab308",
  Shell: "#22c55e", Ruby: "#e11d48", Swift: "#f97316",
};

export const ALL_REPOS: Repo[] = [
  { id: "1", name: "next-commerce",    owner: "devraj", language: "TypeScript", stars: 847,  private: false, connected: true,  description: "E-commerce with Next.js 14, Prisma & Stripe", url: "https://github.com/devraj/next-commerce" },
  { id: "2", name: "rust-cli-tools",   owner: "devraj", language: "Rust",       stars: 312,  private: false, connected: true,  description: "Fast CLI utilities — watcher, scanner, tailer", url: "https://github.com/devraj/rust-cli-tools" },
  { id: "3", name: "ml-pipeline",      owner: "devraj", language: "Python",     stars: 1203, private: true,  connected: false, description: "Distributed ML training with Ray & PyTorch", url: "https://github.com/devraj/ml-pipeline" },
  { id: "4", name: "go-microservices", owner: "devraj", language: "Go",         stars: 529,  private: false, connected: false, description: "gRPC template with OpenTelemetry & Prometheus", url: "https://github.com/devraj/go-microservices" },
  { id: "5", name: "react-design-sys", owner: "devraj", language: "TypeScript", stars: 2341, private: false, connected: true,  description: "Headless component library with Tailwind variants", url: "https://github.com/devraj/react-design-sys" },
  { id: "6", name: "homelab-infra",    owner: "devraj", language: "HCL",        stars: 67,   private: true,  connected: false, description: "Terraform + Ansible for Kubernetes homelab", url: "https://github.com/devraj/homelab-infra" },
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: "c1", title: "Stripe webhook flow", preview: "How are failed webhooks retried?", time: "2h ago", pinned: true,
    messages: [
      { id: "m1", role: "user",      time: "2:34 PM", repos: ["next-commerce"], content: "How are failed webhooks retried?" },
      { id: "m2", role: "assistant", time: "2:34 PM", content: "In `next-commerce`, the handler lives in `app/api/webhooks/stripe/route.ts`. Stripe retries up to 3 times over 24h.\n\nYour verification:\n\n```typescript\nconst sig = headers().get('stripe-signature')!;\nconst event = stripe.webhooks.constructEvent(\n  body, sig, process.env.STRIPE_WEBHOOK_SECRET!\n);\n```\n\nReturning `400` after failure tells Stripe to retry. **Watch out:** no idempotency check — a retried `payment_intent.succeeded` could duplicate orders. Add a `processedWebhooks` table keyed on event ID." },
    ],
  },
  {
    id: "c2", title: "Rust CLI subcommands", preview: "Best way to add subcommands with clap?", time: "Yesterday", pinned: false,
    messages: [
      { id: "m3", role: "user",      time: "11:20 AM", repos: ["rust-cli-tools"], content: "Best way to add subcommands with clap?" },
      { id: "m4", role: "assistant", time: "11:21 AM", content: "Your `main.rs` uses clap v3 builder. Derive macro is cleaner for growing CLIs:\n\n```rust\n#[derive(Parser)]\nstruct Cli {\n    #[command(subcommand)]\n    command: Commands,\n}\n\n#[derive(Subcommand)]\nenum Commands {\n    Watch { path: PathBuf, #[arg(short)] recursive: bool },\n    Scan  { host: String, ports: Vec<u16> },\n}\n```\n\nEach variant is independent — new subcommands won't touch existing match arms." },
    ],
  },
  { id: "c3", title: "Design system tokens",       preview: "How are color tokens organized?",    time: "3 days ago", pinned: false, messages: [] },
  { id: "c4", title: "Order state machine",         preview: "Walk me through the order lifecycle", time: "5 days ago", pinned: false, messages: [] },
  { id: "c5", title: "Auth middleware refactor",    preview: "Which files handle JWT verification?", time: "1 week ago", pinned: false, messages: [] },
];

export const QUICK_STARTS = [
  { icon: Layers,      text: "Explain the main architecture" },
  { icon: Code2,       text: "How does authentication work?" },
  { icon: BookOpen,    text: "Summarize the README" },
  { icon: GitCommit,   text: "What changed in the last commit?" },
  { icon: AlertCircle, text: "Find potential bugs" },
  { icon: GitBranch,   text: "List all API endpoints" },
];

export const AI_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", desc: "Fast, balanced — recommended", badge: "Default" },
  { id: "claude-opus-4-8",   name: "Claude Opus 4.8",   desc: "Most capable, slower",         badge: "Best"    },
  { id: "claude-haiku-4-5",  name: "Claude Haiku 4.5",  desc: "Fastest, lightweight",         badge: "Fast"    },
];


