import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 12);
  const reviewerPassword = await bcrypt.hash("review123", 12);
  const publisherPassword = await bcrypt.hash("pub123", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@jms.com" },
    update: {},
    create: {
      name: "Dr. Sarah Mitchell",
      email: "admin@jms.com",
      password: adminPassword,
      role: "ADMIN",
      institution: "Journal Management Office",
    },
  });

  const reviewer1 = await db.user.upsert({
    where: { email: "reviewer@jms.com" },
    update: {},
    create: {
      name: "Prof. James Chen",
      email: "reviewer@jms.com",
      password: reviewerPassword,
      role: "REVIEWER",
      institution: "MIT",
      expertise: "machine learning, deep learning, computer vision",
      bio: "Professor of Computer Science with 15 years of research experience.",
    },
  });

  const reviewer2 = await db.user.upsert({
    where: { email: "reviewer2@jms.com" },
    update: {},
    create: {
      name: "Dr. Emily Watson",
      email: "reviewer2@jms.com",
      password: reviewerPassword,
      role: "REVIEWER",
      institution: "Stanford University",
      expertise: "natural language processing, text mining, computational linguistics",
    },
  });

  const publisher = await db.user.upsert({
    where: { email: "publisher@jms.com" },
    update: {},
    create: {
      name: "Dr. Alex Rivera",
      email: "publisher@jms.com",
      password: publisherPassword,
      role: "AUTHOR",
      institution: "University of California, Berkeley",
    },
  });

  const publisher2 = await db.user.upsert({
    where: { email: "publisher2@jms.com" },
    update: {},
    create: {
      name: "Dr. Priya Sharma",
      email: "publisher2@jms.com",
      password: publisherPassword,
      role: "AUTHOR",
      institution: "Oxford University",
    },
  });

  // Create journals
  const journal1 = await db.journal.upsert({
    where: { id: "journal-ai" },
    update: {},
    create: {
      id: "journal-ai",
      name: "Journal of Artificial Intelligence Research",
      description: "Premier venue for AI and machine learning research.",
      scope: "We publish original research in all areas of artificial intelligence including machine learning, NLP, computer vision, and robotics.",
      issnPrint: "1076-9757",
      issnOnline: "1076-9765",
      reviewType: "DOUBLE_BLIND",
      reviewerCount: 2,
    },
  });

  const journal2 = await db.journal.upsert({
    where: { id: "journal-cs" },
    update: {},
    create: {
      id: "journal-cs",
      name: "International Journal of Computer Science",
      description: "Broad-scope CS research publication.",
      scope: "Covers all aspects of computer science theory and applications.",
      reviewType: "DOUBLE_BLIND",
      reviewerCount: 3,
    },
  });

  // Create submissions with different statuses
  const sub1 = await db.submission.upsert({
    where: { manuscriptId: "ms-001-demo" },
    update: {},
    create: {
      manuscriptId: "ms-001-demo",
      title: "Transformer-Based Architectures for Multilingual Sentiment Analysis",
      abstract: "We present a novel approach to multilingual sentiment analysis using transformer-based architectures pre-trained on diverse language corpora. Our method achieves state-of-the-art results on 12 benchmark datasets across 8 languages, outperforming existing approaches by an average of 4.2% on F1 score.",
      keywords: "sentiment analysis, transformer, multilingual, BERT, NLP",
      authorName: "Dr. Alex Rivera",
      authorEmail: "publisher@jms.com",
      institution: "University of California, Berkeley",
      publisherId: publisher.id,
      journalId: journal1.id,
      status: "PEER_REVIEW",
      submittedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      deskReviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      reviewStartedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  const sub2 = await db.submission.upsert({
    where: { manuscriptId: "ms-002-demo" },
    update: {},
    create: {
      manuscriptId: "ms-002-demo",
      title: "Federated Learning with Differential Privacy: A Comprehensive Survey",
      abstract: "This survey provides a comprehensive analysis of federated learning systems incorporating differential privacy mechanisms. We categorize existing approaches, identify key challenges, and propose a unified framework for evaluating privacy-utility tradeoffs in distributed ML systems.",
      keywords: "federated learning, differential privacy, distributed machine learning, survey",
      authorName: "Dr. Alex Rivera",
      authorEmail: "publisher@jms.com",
      institution: "University of California, Berkeley",
      publisherId: publisher.id,
      journalId: journal1.id,
      status: "REVISION_REQUESTED",
      submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      deskReviewedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      reviewStartedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      decisionAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      revisionDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  const sub3 = await db.submission.upsert({
    where: { manuscriptId: "ms-003-demo" },
    update: {},
    create: {
      manuscriptId: "ms-003-demo",
      title: "Graph Neural Networks for Drug-Target Interaction Prediction",
      abstract: "We propose GraphDTI, a novel graph neural network framework for predicting drug-target interactions. Our approach leverages molecular structure graphs and protein interaction networks to achieve 93.8% accuracy on benchmark datasets, significantly improving upon state-of-the-art methods.",
      keywords: "graph neural networks, drug discovery, bioinformatics, GNN",
      authorName: "Dr. Priya Sharma",
      authorEmail: "publisher2@jms.com",
      institution: "Oxford University",
      publisherId: publisher2.id,
      journalId: journal1.id,
      status: "PUBLISHED",
      submittedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  const sub4 = await db.submission.upsert({
    where: { manuscriptId: "ms-004-demo" },
    update: {},
    create: {
      manuscriptId: "ms-004-demo",
      title: "Quantum Computing Approaches to Combinatorial Optimization",
      abstract: "This paper explores the application of quantum algorithms, specifically the Quantum Approximate Optimization Algorithm (QAOA), to solve NP-hard combinatorial optimization problems. We demonstrate quantum advantage for specific problem classes.",
      keywords: "quantum computing, QAOA, optimization, quantum advantage",
      authorName: "Dr. Alex Rivera",
      authorEmail: "publisher@jms.com",
      institution: "University of California, Berkeley",
      publisherId: publisher.id,
      journalId: journal2.id,
      status: "DESK_REVIEW",
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Status history for sub1
  await db.statusHistory.deleteMany({ where: { submissionId: sub1.id } });
  await db.statusHistory.createMany({
    data: [
      { submissionId: sub1.id, toStatus: "SUBMITTED", note: "Initial submission", changedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      { submissionId: sub1.id, fromStatus: "SUBMITTED", toStatus: "DESK_REVIEW", note: "Assigned to handling editor", changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { submissionId: sub1.id, fromStatus: "DESK_REVIEW", toStatus: "PEER_REVIEW", note: "Passed desk review, sent to reviewers", changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Status history for sub2
  await db.statusHistory.deleteMany({ where: { submissionId: sub2.id } });
  await db.statusHistory.createMany({
    data: [
      { submissionId: sub2.id, toStatus: "SUBMITTED", changedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
      { submissionId: sub2.id, fromStatus: "SUBMITTED", toStatus: "DESK_REVIEW", changedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000) },
      { submissionId: sub2.id, fromStatus: "DESK_REVIEW", toStatus: "PEER_REVIEW", changedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) },
      { submissionId: sub2.id, fromStatus: "PEER_REVIEW", toStatus: "REVISION_REQUESTED", note: "Two reviewers completed. Major revision requested.", changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Status history for sub3
  await db.statusHistory.deleteMany({ where: { submissionId: sub3.id } });
  await db.statusHistory.createMany({
    data: [
      { submissionId: sub3.id, toStatus: "SUBMITTED", changedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
      { submissionId: sub3.id, fromStatus: "SUBMITTED", toStatus: "PEER_REVIEW", changedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000) },
      { submissionId: sub3.id, fromStatus: "PEER_REVIEW", toStatus: "ACCEPTED", changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { submissionId: sub3.id, fromStatus: "ACCEPTED", toStatus: "IN_COPYEDITING", changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { submissionId: sub3.id, fromStatus: "IN_COPYEDITING", toStatus: "PUBLISHED", changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Status history for sub4
  await db.statusHistory.deleteMany({ where: { submissionId: sub4.id } });
  await db.statusHistory.createMany({
    data: [
      { submissionId: sub4.id, toStatus: "SUBMITTED", changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { submissionId: sub4.id, fromStatus: "SUBMITTED", toStatus: "DESK_REVIEW", changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Create review invitations for sub1 (PEER_REVIEW)
  const inv1 = await db.reviewInvitation.upsert({
    where: { submissionId_reviewerId: { submissionId: sub1.id, reviewerId: reviewer1.id } },
    update: {},
    create: {
      submissionId: sub1.id,
      reviewerId: reviewer1.id,
      status: "ACCEPTED",
      invitedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const inv2 = await db.reviewInvitation.upsert({
    where: { submissionId_reviewerId: { submissionId: sub1.id, reviewerId: reviewer2.id } },
    update: {},
    create: {
      submissionId: sub1.id,
      reviewerId: reviewer2.id,
      status: "PENDING",
      invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    },
  });

  // Create empty review for inv1
  await db.review.upsert({
    where: { invitationId: inv1.id },
    update: {},
    create: { invitationId: inv1.id },
  });

  // Create completed reviews for sub2 (REVISION_REQUESTED)
  const inv3 = await db.reviewInvitation.upsert({
    where: { submissionId_reviewerId: { submissionId: sub2.id, reviewerId: reviewer1.id } },
    update: {},
    create: {
      submissionId: sub2.id,
      reviewerId: reviewer1.id,
      status: "ACCEPTED",
      invitedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await db.review.upsert({
    where: { invitationId: inv3.id },
    update: {},
    create: {
      invitationId: inv3.id,
      scoreOriginality: 4,
      scoreMethodology: 3,
      scoreClarity: 4,
      scoreSignificance: 4,
      overallScore: 3.75,
      decision: "MAJOR_REVISION",
      publicComments: "This is an interesting survey on federated learning with differential privacy. The coverage of existing methods is comprehensive. However, I have several major concerns:\n\n1. The proposed unified framework lacks formal mathematical definition. Please provide rigorous definitions of the privacy-utility tradeoff metrics.\n2. The experimental comparison is missing key recent baselines (2022-2023).\n3. The section on Byzantine-robust FL (Section 4.3) appears incomplete.\n4. References 23-31 are incorrectly formatted.\n\nI recommend major revisions before acceptance.",
      privateComments: "The authors have clearly done significant work, but the framework section needs substantial development. Happy to re-review after revisions.",
      isSubmitted: true,
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const inv4 = await db.reviewInvitation.upsert({
    where: { submissionId_reviewerId: { submissionId: sub2.id, reviewerId: reviewer2.id } },
    update: {},
    create: {
      submissionId: sub2.id,
      reviewerId: reviewer2.id,
      status: "ACCEPTED",
      invitedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    },
  });

  await db.review.upsert({
    where: { invitationId: inv4.id },
    update: {},
    create: {
      invitationId: inv4.id,
      scoreOriginality: 3,
      scoreMethodology: 3,
      scoreClarity: 3,
      scoreSignificance: 4,
      overallScore: 3.25,
      decision: "MAJOR_REVISION",
      publicComments: "The survey addresses an important topic but requires significant improvements:\n\n1. The taxonomy in Figure 2 is unclear and overlapping categories should be resolved.\n2. Privacy analysis should be more rigorous—current guarantees are stated without proof.\n3. The discussion of communication efficiency is underdeveloped compared to privacy aspects.\n4. Several important papers are missing from the literature review.",
      isSubmitted: true,
      submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Demo accounts:");
  console.log("  Admin:     admin@jms.com     / admin123");
  console.log("  Reviewer:  reviewer@jms.com  / review123");
  console.log("  Publisher: publisher@jms.com / pub123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
