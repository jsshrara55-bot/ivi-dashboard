import { notifyOwner } from "./_core/notification";
import {
  getSchedulerSettings,
  getUnsentRiskAlerts,
  markAlertAsSent,
  updateSchedulerLastRun,
  updateSchedulerNextRun,
  createNotificationLog,
} from "./db";

// Scheduler state
let schedulerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Calculate the next run time based on scheduler settings
 */
function calculateNextRunTime(scheduledTime: string, daysOfWeek: string): Date {
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const allowedDays = daysOfWeek.split(",").map(Number);
  
  const now = new Date();
  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, start from tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  // Find the next allowed day
  let daysChecked = 0;
  while (!allowedDays.includes(nextRun.getDay()) && daysChecked < 7) {
    nextRun.setDate(nextRun.getDate() + 1);
    daysChecked++;
  }
  
  return nextRun;
}

/**
 * Check if it's time to run the scheduler
 */
function shouldRunNow(scheduledTime: string, daysOfWeek: string): boolean {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const allowedDays = daysOfWeek.split(",").map(Number);
  
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return (
    allowedDays.includes(currentDay) &&
    currentHour === hours &&
    currentMinute === minutes
  );
}

/**
 * Send all pending risk alerts
 */
async function sendPendingAlerts(): Promise<{ sent: number; failed: number; skipped: number }> {
  const alerts = await getUnsentRiskAlerts();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const alert of alerts) {
    try {
      // Only send notifications for Medium -> High escalations
      if (alert.previousRisk === "Medium" && alert.newRisk === "High") {
        const title = `⚠️ تنبيه عاجل: ارتفاع مستوى المخاطر - ${alert.companyName}`;
        const content = `ارتفع مستوى المخاطر للشركة "${alert.companyName}" من "متوسطة" إلى "عالية"\n\n` +
          `📋 تفاصيل التنبيه:\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🏢 الشركة: ${alert.companyName}\n` +
          `📄 رقم العقد: ${alert.contNo}\n` +
          `📊 الدرجة السابقة: ${alert.previousScore || "-"}\n` +
          `📈 الدرجة الجديدة: ${alert.newScore || "-"}\n` +
          `📅 التاريخ: ${new Date().toLocaleDateString("ar-SA")}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `⚡ الإجراء المطلوب:\n` +
          `يرجى مراجعة هذا العميل واتخاذ الإجراءات اللازمة لتقليل مستوى المخاطر.\n\n` +
          `🔗 يمكنك الوصول إلى لوحة التحكم لمزيد من التفاصيل.`;

        const success = await notifyOwner({ title, content });

        // Log the notification
        await createNotificationLog({
          notificationType: "scheduled_daily",
          alertId: alert.id,
          contNo: alert.contNo,
          companyName: alert.companyName,
          title,
          success,
          errorMessage: success ? null : "Failed to send notification",
        });

        if (success) {
          await markAlertAsSent(alert.id);
          sent++;
        } else {
          failed++;
        }
      } else if (
        alert.previousRisk === "High" &&
        (alert.newRisk === "Medium" || alert.newRisk === "Low")
      ) {
        // Send positive notification for risk improvement
        const title = `✅ تحسن مستوى المخاطر - ${alert.companyName}`;
        const content = `انخفض مستوى المخاطر للشركة "${alert.companyName}"\n\n` +
          `📋 تفاصيل التحسن:\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🏢 الشركة: ${alert.companyName}\n` +
          `📄 رقم العقد: ${alert.contNo}\n` +
          `📉 الفئة السابقة: عالية\n` +
          `✨ الفئة الجديدة: ${alert.newRisk === "Medium" ? "متوسطة" : "منخفضة"}\n` +
          `📊 الدرجة السابقة: ${alert.previousScore || "-"}\n` +
          `📈 الدرجة الجديدة: ${alert.newScore || "-"}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🎉 هذا تحسن إيجابي في أداء العميل!`;

        const success = await notifyOwner({ title, content });

        await createNotificationLog({
          notificationType: "scheduled_daily",
          alertId: alert.id,
          contNo: alert.contNo,
          companyName: alert.companyName,
          title,
          success,
          errorMessage: success ? null : "Failed to send notification",
        });

        if (success) {
          await markAlertAsSent(alert.id);
          sent++;
        } else {
          failed++;
        }
      } else {
        // Mark other alerts as sent without notification
        await markAlertAsSent(alert.id);
        skipped++;
      }
    } catch (error) {
      console.error(`[Scheduler] Error processing alert ${alert.id}:`, error);
      failed++;
    }
  }

  return { sent, failed, skipped };
}

/**
 * Run the scheduled notification job
 */
async function runScheduledJob(): Promise<void> {
  if (isRunning) {
    console.log("[Scheduler] Job already running, skipping...");
    return;
  }

  isRunning = true;
  console.log("[Scheduler] Starting scheduled notification job...");

  try {
    const settings = await getSchedulerSettings();
    if (!settings || !settings.isEnabled) {
      console.log("[Scheduler] Scheduler is disabled, skipping...");
      isRunning = false;
      return;
    }

    const result = await sendPendingAlerts();
    const totalProcessed = result.sent + result.failed + result.skipped;

    // Determine status
    let status: "success" | "failed" | "partial";
    if (result.failed === 0) {
      status = "success";
    } else if (result.sent === 0 && result.failed > 0) {
      status = "failed";
    } else {
      status = "partial";
    }

    // Update scheduler status
    await updateSchedulerLastRun(status, result.sent);

    // Calculate and update next run time
    const nextRun = calculateNextRunTime(settings.scheduledTime, settings.daysOfWeek);
    await updateSchedulerNextRun(nextRun);

    console.log(
      `[Scheduler] Job completed. Sent: ${result.sent}, Failed: ${result.failed}, Skipped: ${result.skipped}`
    );
  } catch (error) {
    console.error("[Scheduler] Error running scheduled job:", error);
    await updateSchedulerLastRun("failed", 0, String(error));
  } finally {
    isRunning = false;
  }
}

/**
 * Check and run scheduler if it's time
 */
async function checkAndRun(): Promise<void> {
  try {
    const settings = await getSchedulerSettings();
    if (!settings || !settings.isEnabled) {
      return;
    }

    if (shouldRunNow(settings.scheduledTime, settings.daysOfWeek)) {
      await runScheduledJob();
    }
  } catch (error) {
    console.error("[Scheduler] Error in checkAndRun:", error);
  }
}

/**
 * Start the scheduler
 */
export function startScheduler(): void {
  if (schedulerInterval) {
    console.log("[Scheduler] Scheduler already running");
    return;
  }

  console.log("[Scheduler] Starting notification scheduler...");
  
  // Check every minute
  schedulerInterval = setInterval(checkAndRun, 60 * 1000);
  
  // Also run immediately on startup to update next run time
  initializeScheduler();
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Scheduler] Scheduler stopped");
  }
}

/**
 * Initialize scheduler settings and calculate next run
 */
async function initializeScheduler(): Promise<void> {
  try {
    const settings = await getSchedulerSettings();
    if (settings && settings.isEnabled) {
      const nextRun = calculateNextRunTime(settings.scheduledTime, settings.daysOfWeek);
      await updateSchedulerNextRun(nextRun);
      console.log(`[Scheduler] Next scheduled run: ${nextRun.toISOString()}`);
    }
  } catch (error) {
    console.error("[Scheduler] Error initializing scheduler:", error);
  }
}

/**
 * Manually trigger the scheduler (for testing or immediate execution)
 */
export async function triggerSchedulerNow(): Promise<{ sent: number; failed: number; skipped: number }> {
  console.log("[Scheduler] Manual trigger requested...");
  return sendPendingAlerts();
}

/**
 * Get scheduler status
 */
export async function getSchedulerStatus(): Promise<{
  isEnabled: boolean;
  isRunning: boolean;
  scheduledTime: string;
  daysOfWeek: string;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  lastRunStatus: string | null;
  lastRunCount: number;
}> {
  const settings = await getSchedulerSettings();
  
  return {
    isEnabled: settings?.isEnabled ?? false,
    isRunning,
    scheduledTime: settings?.scheduledTime ?? "09:00",
    daysOfWeek: settings?.daysOfWeek ?? "1,2,3,4,5",
    lastRunAt: settings?.lastRunAt ?? null,
    nextRunAt: settings?.nextRunAt ?? null,
    lastRunStatus: settings?.lastRunStatus ?? null,
    lastRunCount: settings?.lastRunCount ?? 0,
  };
}
