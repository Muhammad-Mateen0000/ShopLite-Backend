const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is missing`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 5000,

  supabaseUrl: getRequiredEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),

  stripeSecretKey: getRequiredEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: getRequiredEnv("STRIPE_WEBHOOK_SECRET"),

  frontendUrl:
  process.env.FRONTEND_URL ||
  "https://shoplite-frontend-inky.vercel.app",
} as const;