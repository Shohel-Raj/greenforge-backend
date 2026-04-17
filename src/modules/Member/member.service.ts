import { prisma } from "../../lib/prisma";

// ================= OVERVIEW =================

const getDashboardOverview = async (userId: string) => {
  const totalIdeas = await prisma.idea.count({
    where: { memberId: userId },
  });

  const approvedIdeas = await prisma.idea.count({
    where: { memberId: userId, status: "APPROVED" },
  });

  const pendingIdeas = await prisma.idea.count({
    where: { memberId: userId, status: "UNDER_REVIEW" },
  });

  const rejectedIdeas = await prisma.idea.count({
    where: { memberId: userId, status: "REJECTED" },
  });

  const totalComments = await prisma.comment.count({
    where: { userId },
  });

  const totalVotesOnMyIdeas = await prisma.vote.count({
    where: {
      idea: {
        memberId: userId,
      },
    },
  });

  return {
    totalIdeas,
    approvedIdeas,
    pendingIdeas,
    rejectedIdeas,
    totalComments,
    totalVotesOnMyIdeas,
  };
};

// ================= IDEA CHART =================

const getIdeaChart = async (userId: string) => {
  const ideas = await prisma.idea.findMany({
    where: { memberId: userId },
    select: { createdAt: true },
  });

  const monthly: any = {};

  ideas.forEach((i) => {
    const month = new Date(i.createdAt).toLocaleString("default", {
      month: "short",
    });

    monthly[month] = (monthly[month] || 0) + 1;
  });

  return Object.keys(monthly).map((m) => ({
    month: m,
    ideas: monthly[m],
  }));
};

// ================= VOTE CHART =================

const getVoteChart = async (userId: string) => {
  const votes = await prisma.vote.findMany({
    where: {
      idea: {
        memberId: userId,
      },
    },
    select: {
      type: true,
    },
  });

  let up = 0;
  let down = 0;

  votes.forEach((v) => {
    if (v.type === "UP") up++;
    if (v.type === "DOWN") down++;
  });

  return [
    { name: "Upvotes", value: up },
    { name: "Downvotes", value: down },
  ];
};

// ================= RECENT IDEAS =================

const getRecentIdeas = async (userId: string) => {
  return prisma.idea.findMany({
    where: { memberId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      category: true,
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
    },
  });
};

export const MemberService = {
  getDashboardOverview,
  getIdeaChart,
  getVoteChart,
  getRecentIdeas,
};