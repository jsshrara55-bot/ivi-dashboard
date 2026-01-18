import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllMedicationCategories,
  getMedicationCategoryById,
  createMedicationCategory,
  updateMedicationCategory,
  deleteMedicationCategory,
  getRequirementsByCategoryId,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  createPreAuthRequest,
  getPreAuthRequestsByUserId,
  getPreAuthRequestById,
  updatePreAuthRequest,
  getAllPreAuthRequests,
  createRequestDocument,
  getDocumentsByRequestId,
  createChecklistItem,
  getChecklistItemsByRequestId,
  seedInitialData,
  // IVI Data functions
  getAllCorporateClients,
  getCorporateClientByContNo,
  getAllMembers,
  getMembersByContNo,
  getAllProviders,
  getProviderStats,
  getAllClaims,
  getClaimsByContNo,
  getClaimsStats,
  getAllInsurancePreAuths,
  getInsurancePreAuthsByContNo,
  getPreAuthStats,
  getAllCalls,
  getCallsByContNo,
  getCallStats,
  getAllIviScores,
  getIviScoreByContNo,
  getIviSummary,
  checkDataExists,
  clearAllIviData,
  bulkInsertCorporateClients,
  bulkInsertMembers,
  bulkInsertProviders,
  bulkInsertClaims,
  bulkInsertInsurancePreAuths,
  bulkInsertCalls,
  bulkInsertIviScores,
  // Risk Alerts
  getRiskChangeAlerts,
  getUnsentRiskAlerts,
  markAlertAsSent,
  createRiskChangeAlert,
  // Scheduler
  getSchedulerSettings,
  createOrUpdateSchedulerSettings,
  getNotificationLogs,
} from "./db";
import {
  startScheduler,
  stopScheduler,
  triggerSchedulerNow,
  getSchedulerStatus,
} from "./scheduler";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Admin procedure - only allows users with admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== Medication Categories ====================
  medications: router({
    list: publicProcedure.query(async () => {
      return getAllMedicationCategories();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getMedicationCategoryById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        code: z.string().min(1),
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createMedicationCategory(input);
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameEn: z.string().optional(),
        nameAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateMedicationCategory(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMedicationCategory(input.id);
        return { success: true };
      }),

    seed: adminProcedure.mutation(async () => {
      await seedInitialData();
      return { success: true };
    }),
  }),

  // ==================== Requirements ====================
  requirements: router({
    listByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return getRequirementsByCategoryId(input.categoryId);
      }),

    create: adminProcedure
      .input(z.object({
        categoryId: z.number(),
        code: z.string().min(1),
        labelEn: z.string().min(1),
        labelAr: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        isRequired: z.boolean().default(true),
        requiresDocument: z.boolean().default(false),
        documentTypes: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await createRequirement(input);
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        labelEn: z.string().optional(),
        labelAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        isRequired: z.boolean().optional(),
        requiresDocument: z.boolean().optional(),
        documentTypes: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateRequirement(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteRequirement(input.id);
        return { success: true };
      }),
  }),

  // ==================== Pre-Auth Requests ====================
  preAuth: router({
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        checklistItems: z.array(z.object({
          requirementId: z.number(),
          isChecked: z.boolean(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const requestId = await createPreAuthRequest({
          userId: ctx.user.id,
          categoryId: input.categoryId,
          status: 'pending',
        });

        // Create checklist items
        for (const item of input.checklistItems) {
          await createChecklistItem({
            requestId,
            requirementId: item.requirementId,
            isChecked: item.isChecked,
            checkedAt: item.isChecked ? new Date() : undefined,
          });
        }

        return { id: requestId };
      }),

    myRequests: protectedProcedure.query(async ({ ctx }) => {
      return getPreAuthRequestsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const request = await getPreAuthRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
        }
        // Users can only view their own requests unless admin
        if (request.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const documents = await getDocumentsByRequestId(input.id);
        const checklistItems = await getChecklistItemsByRequestId(input.id);
        
        return { ...request, documents, checklistItems };
      }),

    appeal: protectedProcedure
      .input(z.object({
        id: z.number(),
        appealReason: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const request = await getPreAuthRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
        }
        if (request.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        if (request.status !== 'rejected') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only appeal rejected requests' });
        }

        await updatePreAuthRequest(input.id, {
          status: 'appealed',
          appealReason: input.appealReason,
          appealedAt: new Date(),
        });

        return { success: true };
      }),

    // Admin endpoints
    listAll: adminProcedure.query(async () => {
      return getAllPreAuthRequests();
    }),

    review: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['approved', 'rejected']),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updatePreAuthRequest(input.id, {
          status: input.status,
          rejectionReason: input.rejectionReason,
          reviewedAt: new Date(),
          reviewedBy: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // ==================== Document Upload ====================
  documents: router({
    upload: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        requirementId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user owns the request
        const request = await getPreAuthRequestById(input.requestId);
        if (!request || request.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        // Decode base64 and upload to S3
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `preauth/${ctx.user.id}/${input.requestId}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        // Save document record
        const docId = await createRequestDocument({
          requestId: input.requestId,
          requirementId: input.requirementId,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: fileBuffer.length,
        });

        return { id: docId, url };
      }),

    listByRequest: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ ctx, input }) => {
        const request = await getPreAuthRequestById(input.requestId);
        if (!request) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
        }
        if (request.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        return getDocumentsByRequestId(input.requestId);
      }),
  }),

  // ==================== IVI Data API ====================
  ivi: router({
    // Summary and Overview
    summary: publicProcedure.query(async () => {
      return getIviSummary();
    }),

    // IVI Scores
    scores: router({
      list: publicProcedure.query(async () => {
        return getAllIviScores();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getIviScoreByContNo(input.contNo);
        }),
    }),

    // Corporate Clients
    clients: router({
      list: publicProcedure.query(async () => {
        return getAllCorporateClients();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getCorporateClientByContNo(input.contNo);
        }),
    }),

    // Members
    members: router({
      list: publicProcedure.query(async () => {
        return getAllMembers();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getMembersByContNo(input.contNo);
        }),
    }),

    // Providers
    providers: router({
      list: publicProcedure.query(async () => {
        return getAllProviders();
      }),

      stats: publicProcedure.query(async () => {
        return getProviderStats();
      }),
    }),

    // Claims
    claims: router({
      list: publicProcedure.query(async () => {
        return getAllClaims();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getClaimsByContNo(input.contNo);
        }),

      stats: publicProcedure.query(async () => {
        return getClaimsStats();
      }),
    }),

    // Insurance Pre-Authorizations
    insurancePreAuths: router({
      list: publicProcedure.query(async () => {
        return getAllInsurancePreAuths();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getInsurancePreAuthsByContNo(input.contNo);
        }),

      stats: publicProcedure.query(async () => {
        return getPreAuthStats();
      }),
    }),

    // Client Details (combined data)
    clientDetails: publicProcedure
      .input(z.object({ contNo: z.string() }))
      .query(async ({ input }) => {
        const [client, members, claims, calls] = await Promise.all([
          getIviScoreByContNo(input.contNo),
          getMembersByContNo(input.contNo),
          getClaimsByContNo(input.contNo),
          getCallsByContNo(input.contNo),
        ]);
        return { client, members, claims, calls };
      }),

    // Call Center
    calls: router({
      list: publicProcedure.query(async () => {
        return getAllCalls();
      }),

      getByContNo: publicProcedure
        .input(z.object({ contNo: z.string() }))
        .query(async ({ input }) => {
          return getCallsByContNo(input.contNo);
        }),

      stats: publicProcedure.query(async () => {
        return getCallStats();
      }),
    }),

    // Data Management (Admin only)
    data: router({
      checkExists: publicProcedure.query(async () => {
        return checkDataExists();
      }),

      clearAll: adminProcedure.mutation(async () => {
        await clearAllIviData();
        return { success: true };
      }),

      importFromJson: adminProcedure
        .input(z.object({
          corporateClients: z.array(z.any()).optional(),
          members: z.array(z.any()).optional(),
          providers: z.array(z.any()).optional(),
          claims: z.array(z.any()).optional(),
          insurancePreAuths: z.array(z.any()).optional(),
          calls: z.array(z.any()).optional(),
          iviScores: z.array(z.any()).optional(),
        }))
        .mutation(async ({ input }) => {
          if (input.corporateClients?.length) {
            await bulkInsertCorporateClients(input.corporateClients);
          }
          if (input.members?.length) {
            await bulkInsertMembers(input.members);
          }
          if (input.providers?.length) {
            await bulkInsertProviders(input.providers);
          }
          if (input.claims?.length) {
            await bulkInsertClaims(input.claims);
          }
          if (input.insurancePreAuths?.length) {
            await bulkInsertInsurancePreAuths(input.insurancePreAuths);
          }
          if (input.calls?.length) {
            await bulkInsertCalls(input.calls);
          }
          if (input.iviScores?.length) {
            await bulkInsertIviScores(input.iviScores);
          }
          return { success: true };
        }),
    }),

    // Risk Change Alerts
    riskAlerts: router({
      list: protectedProcedure.query(async () => {
        return getRiskChangeAlerts();
      }),

      getUnsent: adminProcedure.query(async () => {
        return getUnsentRiskAlerts();
      }),

      create: adminProcedure
        .input(z.object({
          contNo: z.string(),
          companyName: z.string().optional(),
          previousRisk: z.enum(["Low", "Medium", "High"]),
          newRisk: z.enum(["Low", "Medium", "High"]),
          previousScore: z.string().optional(),
          newScore: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await createRiskChangeAlert({
            contNo: input.contNo,
            companyName: input.companyName,
            previousRisk: input.previousRisk,
            newRisk: input.newRisk,
            previousScore: input.previousScore,
            newScore: input.newScore,
            notificationSent: false,
          });
          return { id };
        }),

      sendNotification: adminProcedure
        .input(z.object({ alertId: z.number() }))
        .mutation(async ({ input }) => {
          const alerts = await getUnsentRiskAlerts();
          const alert = alerts.find(a => a.id === input.alertId);
          
          if (!alert) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Alert not found' });
          }

          // Send notification to owner
          const title = `تنبيه: تغيير فئة المخاطر - ${alert.companyName}`;
          const content = `تغيرت فئة المخاطر للشركة "${alert.companyName}" (رقم العقد: ${alert.contNo})\n\n` +
            `الفئة السابقة: ${alert.previousRisk === 'High' ? 'عالية' : alert.previousRisk === 'Medium' ? 'متوسطة' : 'منخفضة'}\n` +
            `الفئة الجديدة: ${alert.newRisk === 'High' ? 'عالية' : alert.newRisk === 'Medium' ? 'متوسطة' : 'منخفضة'}\n` +
            `الدرجة السابقة: ${alert.previousScore || '-'}\n` +
            `الدرجة الجديدة: ${alert.newScore || '-'}\n\n` +
            `يرجى مراجعة لوحة التحكم للمزيد من التفاصيل.`;

          const success = await notifyOwner({ title, content });
          
          if (success) {
            await markAlertAsSent(input.alertId);
          }

          return { success };
        }),

      sendAllUnsent: adminProcedure.mutation(async () => {
        const alerts = await getUnsentRiskAlerts();
        const results = [];
        let sentCount = 0;
        let skippedCount = 0;

        for (const alert of alerts) {
          // Only send notifications for Medium -> High escalations
          if (alert.previousRisk === 'Medium' && alert.newRisk === 'High') {
            const title = `⚠️ تنبيه عاجل: ارتفاع مستوى المخاطر - ${alert.companyName}`;
            const content = `ارتفع مستوى المخاطر للشركة "${alert.companyName}" من "متوسطة" إلى "عالية"\n\n` +
              `📋 تفاصيل التنبيه:\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🏢 الشركة: ${alert.companyName}\n` +
              `📄 رقم العقد: ${alert.contNo}\n` +
              `📊 الدرجة السابقة: ${alert.previousScore || '-'}\n` +
              `📈 الدرجة الجديدة: ${alert.newScore || '-'}\n` +
              `📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `⚡ الإجراء المطلوب:\n` +
              `يرجى مراجعة هذا العميل واتخاذ الإجراءات اللازمة لتقليل مستوى المخاطر.\n\n` +
              `🔗 يمكنك الوصول إلى لوحة التحكم لمزيد من التفاصيل.`;

            const success = await notifyOwner({ title, content });
            
            if (success) {
              await markAlertAsSent(alert.id);
              sentCount++;
            }

            results.push({ alertId: alert.id, success, type: 'escalation' });
          } else if (alert.previousRisk === 'High' && (alert.newRisk === 'Medium' || alert.newRisk === 'Low')) {
            // Send positive notification for risk improvement from High
            const title = `✅ تحسن مستوى المخاطر - ${alert.companyName}`;
            const content = `انخفض مستوى المخاطر للشركة "${alert.companyName}"\n\n` +
              `📋 تفاصيل التحسن:\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🏢 الشركة: ${alert.companyName}\n` +
              `📄 رقم العقد: ${alert.contNo}\n` +
              `📉 الفئة السابقة: عالية\n` +
              `✨ الفئة الجديدة: ${alert.newRisk === 'Medium' ? 'متوسطة' : 'منخفضة'}\n` +
              `📊 الدرجة السابقة: ${alert.previousScore || '-'}\n` +
              `📈 الدرجة الجديدة: ${alert.newScore || '-'}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `🎉 هذا تحسن إيجابي في أداء العميل!`;

            const success = await notifyOwner({ title, content });
            
            if (success) {
              await markAlertAsSent(alert.id);
              sentCount++;
            }

            results.push({ alertId: alert.id, success, type: 'improvement' });
          } else {
            // Mark other alerts as sent without notification
            await markAlertAsSent(alert.id);
            skippedCount++;
            results.push({ alertId: alert.id, success: true, skipped: true, type: 'other' });
          }
        }

        return { 
          processed: results.length, 
          sent: sentCount,
          skipped: skippedCount,
          results 
        };
      }),
    }),

    // Scheduler management
    scheduler: router({
      getStatus: adminProcedure.query(async () => {
        return getSchedulerStatus();
      }),

      getSettings: adminProcedure.query(async () => {
        return getSchedulerSettings();
      }),

      updateSettings: adminProcedure
        .input(z.object({
          isEnabled: z.boolean(),
          scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
          daysOfWeek: z.string().regex(/^[0-6](,[0-6])*$/, "Invalid days format"),
        }))
        .mutation(async ({ input, ctx }) => {
          await createOrUpdateSchedulerSettings({
            isEnabled: input.isEnabled,
            scheduledTime: input.scheduledTime,
            daysOfWeek: input.daysOfWeek,
            modifiedBy: ctx.user.id,
          });

          // Start or stop scheduler based on settings
          if (input.isEnabled) {
            startScheduler();
          } else {
            stopScheduler();
          }

          return { success: true };
        }),

      triggerNow: adminProcedure.mutation(async () => {
        const result = await triggerSchedulerNow();
        return result;
      }),

      getLogs: adminProcedure
        .input(z.object({ limit: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return getNotificationLogs(input?.limit || 100);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
