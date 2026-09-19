import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed with Part 1 Demo Data...");

  // 0. Reset demo tenants so the seed is idempotent (cascades to all child rows)
  await prisma.organization.deleteMany({
    where: { id: { in: ["org_acme", "org_rf"] } },
  });

  // 1. Create Demo Organization
  const org = await prisma.organization.create({
    data: {
      id: "org_acme",
      name: "Acme Corp",
      plan: "Enterprise",
    },
  });
  console.log(`✓ Organization created: ${org.name}`);

  // 2. Create Primary Demo Users
  const jordan = await prisma.user.create({
    data: {
      id: "usr_jordan",
      organizationId: org.id,
      name: "Jordan Ellis",
      email: "jordan.ellis@acmecorp.com",
      role: "ADMIN",
      avatarInitials: "JE",
    },
  });

  const priya = await prisma.user.create({
    data: {
      id: "usr_priya",
      organizationId: org.id,
      name: "Priya Sharma",
      email: "priya.sharma@acmecorp.com",
      role: "MEMBER",
      avatarInitials: "PS",
    },
  });

  const tom = await prisma.user.create({
    data: {
      id: "usr_tom",
      organizationId: org.id,
      name: "Tom Kwan",
      email: "tom.kwan@acmecorp.com",
      role: "MEMBER",
      avatarInitials: "TK",
    },
  });

  const ana = await prisma.user.create({
    data: {
      id: "usr_ana",
      organizationId: org.id,
      name: "Ana Reyes",
      email: "ana.reyes@acmecorp.com",
      role: "MEMBER",
      avatarInitials: "AR",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      id: "usr_marcus",
      organizationId: org.id,
      name: "Marcus Lee",
      email: "marcus.lee@acmecorp.com",
      role: "MEMBER",
      avatarInitials: "ML",
    },
  });

  // RF Operations support seats (isRFTeam identifies the RF Operations side)
  const rfTech = await prisma.user.create({
    data: {
      id: "usr_rf_tech",
      organizationId: org.id,
      name: "RF Technical Specialist",
      email: "tech@rf-intelligence.com",
      role: "MEMBER",
      avatarInitials: "RF",
      isRFTeam: true,
    },
  });

  const rfOnboard = await prisma.user.create({
    data: {
      id: "usr_rf_onboard",
      organizationId: org.id,
      name: "RF Onboarding AI Specialist",
      email: "onboarding@rf-intelligence.com",
      role: "MEMBER",
      avatarInitials: "RF",
      isRFTeam: true,
    },
  });

  const rfData = await prisma.user.create({
    data: {
      id: "usr_rf_data",
      organizationId: org.id,
      name: "RF Data Engineering",
      email: "data@rf-intelligence.com",
      role: "MEMBER",
      avatarInitials: "RF",
      isRFTeam: true,
    },
  });

  // Per-user notification delivery preferences
  await prisma.notificationPreference.createMany({
    data: [jordan, priya, tom, ana, marcus, rfTech, rfOnboard, rfData].map(
      (user) => ({
        userId: user.id,
        organizationId: org.id,
      }),
    ),
  });
  console.log("✓ Demo Users created");

  // 3. Create Active Projects & Activities
  const projHorizon = await prisma.project.create({
    data: {
      id: "proj_horizon",
      organizationId: org.id,
      ownerId: priya.id,
      name: "Horizon v2 Launch",
      accountName: "Meridian Health",
      status: "ON_TRACK",
      progress: 72,
      dueDate: new Date("2026-09-28T00:00:00Z"),
      openTasksCount: 4,
      activities: {
        create: [
          {
            organizationId: org.id,
            authorId: priya.id,
            action: "Updated progress to 72%",
            details: "Completed API integration milestone on schedule.",
            type: "status",
          },
          {
            organizationId: org.id,
            authorId: jordan.id,
            action: "Added task: Finalize staging verification",
            type: "task",
          },
        ],
      },
    },
  });

  const projAcme = await prisma.project.create({
    data: {
      id: "proj_renewal_acme",
      organizationId: org.id,
      ownerId: jordan.id,
      name: "Acme Renewal Prep",
      accountName: "Acme Corp",
      status: "AT_RISK",
      progress: 45,
      dueDate: new Date("2026-09-20T00:00:00Z"),
      openTasksCount: 9,
      activities: {
        create: [
          {
            organizationId: org.id,
            authorId: jordan.id,
            action: "Flagged project as At Risk",
            details: "Executive sponsor turnover detected on customer side.",
            type: "status",
          },
        ],
      },
    },
  });
  console.log("✓ Projects & Activities created");

  // 4. Create AI Insights
  await prisma.insight.create({
    data: {
      id: "ins_pipeline_conc",
      organizationId: org.id,
      type: "RISK",
      severity: "CRITICAL",
      title: "Pipeline concentration risk",
      body: "3 accounts represent 61% of Q4 ARR. Diversification recommended before close period.",
      accountName: null,
      ctaHref: "/ai-insights",
      ctaLabel: "View analysis",
      read: false,
      whatHappened: "Three major Enterprise accounts comprise 61% ($2.4M) of total forecasted pipeline for Q4 2026.",
      whyDetected: "RF Intelligence calculated an HHI concentration score of 0.38 across pipeline deals, exceeding safe threshold (0.20).",
      chartTitle: "Pipeline Share by Top Accounts vs Threshold (%)",
      chartType: "bar",
      chartDataJson: JSON.stringify([
        { label: "Acme Corp", value: 26, benchmark: 10 },
        { label: "Meridian", value: 20, benchmark: 10 },
        { label: "GlobalFin", value: 15, benchmark: 10 },
      ]),
      businessImpact: "If any single top-3 deal slips or churns, Q4 target attainment will drop below baseline.",
      recommendedAction: "Accelerate stage-2 opportunities in mid-market tier.",
    },
  });
  console.log("✓ AI Insights created");

  // 5. Create Documents & Reports
  await prisma.document.create({
    data: {
      id: "doc_1",
      organizationId: org.id,
      uploadedById: jordan.id,
      fileName: "Acme_Master_Services_Agreement_2026.pdf",
      fileSize: "4.5 MB",
      fileUrl: "https://storage.rf-intelligence.com/docs/acme_msa.pdf",
      mimeType: "application/pdf",
      storageKey: `${org.id}/seed/acme_msa.pdf`,
      processingStatus: "PROCESSED",
      linkedAccount: "Acme Corp",
      extractedEntitiesCount: 38,
      metadataJson: JSON.stringify({
        extension: "pdf",
        contentType: "application/pdf",
        wordCount: null,
        entitiesCount: 38,
      }),
    },
  });

  await prisma.report.create({
    data: {
      id: "rep_1",
      organizationId: org.id,
      createdById: jordan.id,
      title: "GlobalFin Q3 QBR Presentation Deck",
      type: "QBR Deck",
      accountName: "GlobalFin",
      size: "14.2 MB",
      status: "READY",
      fileUrl: "https://storage.rf-intelligence.com/reports/globalfin_qbr.pdf",
    },
  });

  // Metadata-only report generated for the seeded processed document (mirrors
  // the report the document processor creates for real uploads).
  await prisma.report.create({
    data: {
      id: "rep_doc_1",
      organizationId: org.id,
      createdById: jordan.id,
      documentId: "doc_1",
      title: "Analysis: Acme_Master_Services_Agreement_2026.pdf",
      type: "Document Analysis",
      accountName: "Acme Corp",
      size: "4.5 MB",
      status: "READY",
      fileUrl: "https://storage.rf-intelligence.com/docs/acme_msa.pdf",
    },
  });
  console.log("✓ Documents & Reports created");

  // 6. Create Internal Conversations & Messages (Client Team ↔ RF Operations)
  const now = Date.now();
  const minutesAgo = (m: number) => new Date(now - m * 60_000);

  await prisma.conversation.create({
    data: {
      id: "int_1",
      organizationId: org.id,
      topic: "Acme Renewal Strategy & Risk Mitigation",
      contextLabel: "Account: Acme Corp",
      rfLead: "RF Intelligence Support",
      unread: true,
      createdAt: minutesAgo(180),
      updatedAt: minutesAgo(4),
      messages: {
        create: [
          {
            organizationId: org.id,
            senderId: priya.id,
            isRFTeam: false,
            createdAt: minutesAgo(9),
            content:
              "Can we sync on the Acme renewal deck before EOD? I have concerns about slide 4 sentiment metrics.",
          },
          {
            organizationId: org.id,
            senderId: rfTech.id,
            isRFTeam: true,
            createdAt: minutesAgo(6),
            content:
              "Hi Priya! I reviewed slide 4. The sentiment metric calculated a 0.41 score based on recent executive turnover phrasing. We can adjust the weighting model if you have offline context.",
          },
          {
            organizationId: org.id,
            senderId: jordan.id,
            isRFTeam: false,
            createdAt: minutesAgo(4),
            content: "Thanks! Let's lock in an offline review at 3 PM today.",
          },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      id: "int_2",
      organizationId: org.id,
      topic: "Northstar Onboarding Sign-off",
      contextLabel: "Project: Northstar Onboarding",
      rfLead: "RF Onboarding AI Specialist",
      unread: false,
      createdAt: minutesAgo(180),
      updatedAt: minutesAgo(46),
      messages: {
        create: [
          {
            organizationId: org.id,
            senderId: tom.id,
            isRFTeam: false,
            createdAt: minutesAgo(48),
            content: "Northstar onboarding is basically done. Final checklist attached.",
          },
          {
            organizationId: org.id,
            senderId: rfOnboard.id,
            isRFTeam: true,
            createdAt: minutesAgo(46),
            content:
              "Verified. All 24 user accounts pass compliance policy checks. Ready for final handover.",
          },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      id: "int_3",
      organizationId: org.id,
      topic: "GlobalFin QBR Data Integration Blocker",
      contextLabel: "Project: GlobalFin QBR Deck",
      rfLead: "RF Data Engineering",
      unread: false,
      createdAt: minutesAgo(180),
      updatedAt: minutesAgo(118),
      messages: {
        create: [
          {
            organizationId: org.id,
            senderId: ana.id,
            isRFTeam: false,
            createdAt: minutesAgo(122),
            content:
              "Blocked on GlobalFin QBR — need the usage export from integrations.",
          },
          {
            organizationId: org.id,
            senderId: rfData.id,
            isRFTeam: true,
            createdAt: minutesAgo(118),
            content:
              "Export is running now. I'll drop the signed URL into this thread once the warehouse job completes.",
          },
        ],
      },
    },
  });
  console.log("✓ Internal Conversations & Messages created");

  // 7. Create Notification Bell entries
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        userId: jordan.id,
        title: "New AI insight ready",
        body: "Q3 pipeline analysis is complete.",
        read: false,
        createdAt: minutesAgo(2),
      },
      {
        organizationId: org.id,
        userId: jordan.id,
        title: "Project updated",
        body: "Horizon v2 milestones were updated by Priya.",
        read: false,
        createdAt: minutesAgo(18),
      },
      {
        organizationId: org.id,
        userId: jordan.id,
        title: "Message from Priya S.",
        body: "Can we sync on the renewal deck?",
        read: true,
        createdAt: minutesAgo(63),
      },
      {
        organizationId: org.id,
        userId: jordan.id,
        title: "Report exported",
        body: "Q2 Customer Health report is ready to download.",
        read: true,
        createdAt: minutesAgo(180),
      },
    ],
  });
  console.log("✓ Notifications created");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
