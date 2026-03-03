# Database Automated Backups

You can run automated backups of the DevProgress MCP SQLite database using the provided `backup.ts` script. We recommend creating a `cron` job that runs this script periodically (e.g., daily).

## Set up Cron Job (Linux/macOS)

1. Open your crontab configuration:
   ```bash
   crontab -e
   ```

2. Add the following entry to run the backup every day at midnight. Make sure to replace `/path/to/project` with the actual path to your DevProgress folder.
   ```cron
   0 0 * * * cd /path/to/project && npx tsx scripts/backup.ts >> /path/to/project/backups/backup.log 2>&1
   ```

Depending on your node/npx installation, you may need to provide the absolute path to your `npx` executable in the cron job.

This will securely copy your local SQLite DB into the `backups/` directory, keeping the 7 latest backups.
