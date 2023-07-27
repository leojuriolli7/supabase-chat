const { exec } = require("child_process");
const dotenv = require("dotenv");

dotenv.config();

const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

if (!supabaseId) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_ID is not set in the .env file.");
  process.exit(1);
}

const command = `npx supabase gen types typescript --project-id ${supabaseId} > src/types/database.ts`;

try {
  exec(command, { stdio: "inherit" });
  console.log("Types generation successful!");
} catch (err) {
  console.error("Error generating types:", err.message);
  process.exit(1);
}
