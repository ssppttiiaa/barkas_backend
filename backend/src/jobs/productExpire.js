import cron from "node-cron";
import db from "./db.js";

cron.schedule("0 0 * * *", async () => {
  await db.execute(
    `UPDATE products
     SET is_active = FALSE
     WHERE expired_at < NOW()`
  );
});
