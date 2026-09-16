import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed with Part 1 Demo Data...");

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
      processingStatus: "INDEXED",
      linkedAccount: "Acme Corp",
      extractedEntitiesCount: 38,
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
  console.log("✓ Documents & Reports created");

  // 6. Create Internal Conversation & Messages
  const conv = await prisma.conversation.create({
    data: {
      id: "int_1",
      organizationId: org.id,
      topic: "Acme Renewal Strategy & Risk Mitigation",
      contextLabel: "Account: Acme Corp",
      rfLead: "RF Intelligence Support",
      unread: true,
      messages: {
        create: [
          {
            organizationId: org.id,
            senderId: priya.id,
            isRFTeam: false,
            content: "Can we sync on the Acme renewal deck before EOD?",
          },
          {
            organizationId: org.id,
            senderId: jordan.id,
            isRFTeam: false,
            content: "Thanks! Let's lock in an offline review at 3 PM today.",
          },
        ],
      },
    },
  });
  console.log("✓ Internal Conversations & Messages created");

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
