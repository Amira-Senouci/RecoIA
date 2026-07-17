const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const userAgent = process.env.npm_config_user_agent || "";

for (const fileName of ["package-lock.json", "yarn.lock"]) {
  const filePath = path.join(cwd, fileName);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
}

if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
