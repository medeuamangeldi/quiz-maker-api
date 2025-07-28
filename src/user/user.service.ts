import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(username: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ForbiddenException(
        'User with this email or username already exists',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({ where: { username } });
  }

  async validatePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, testSubmissions: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return user;
  }

  async getUserRankings() {
    const users = await this.prisma.user.findMany({
      include: {
        testSubmissions: true,
      },
    });

    const rankings = users.map((user) => {
      const earned = user.testSubmissions.reduce(
        (a, b) => a + b.earnedPoints,
        0,
      );
      const possible = user.testSubmissions.reduce(
        (a, b) => a + b.totalPoints,
        0,
      );
      const avgScore = possible ? earned / possible : 0;

      return {
        id: user.id,
        username: user.username,
        totalEarned: earned,
        totalPossible: possible,
        averageScore: Number((avgScore * 100).toFixed(2)),
      };
    });

    return rankings.sort((a, b) => b.totalEarned - a.totalEarned);
  }

  async getTopPerformersByTest(testId: number, limit = 10) {
    const submissions = await this.prisma.testSubmission.findMany({
      where: { testId },
      include: { user: true },
      orderBy: { earnedPoints: 'desc' },
      take: limit,
    });

    return submissions.map((sub) => ({
      userId: sub.userId,
      username: sub.user.username,
      earnedPoints: sub.earnedPoints,
      totalPoints: sub.totalPoints,
      submittedAt: sub.createdAt,
    }));
  }

  async getMyRanking(userId: number) {
    const users = await this.prisma.user.findMany({
      include: {
        testSubmissions: true,
      },
    });

    const rankings = users.map((user) => {
      const earned = user.testSubmissions.reduce(
        (a, b) => a + b.earnedPoints,
        0,
      );
      const possible = user.testSubmissions.reduce(
        (a, b) => a + b.totalPoints,
        0,
      );
      const avgScore = possible ? earned / possible : 0;

      return {
        id: user.id,
        username: user.username,
        totalEarned: earned,
        totalPossible: possible,
        averageScore: Number((avgScore * 100).toFixed(2)),
      };
    });

    // Sort by totalEarned descending
    const sorted = rankings.sort((a, b) => b.totalEarned - a.totalEarned);

    // Find the rank of the given userId
    const myRank = sorted.findIndex((user) => user.id === userId);

    if (myRank === -1) {
      throw new ForbiddenException('User not found in ranking list');
    }

    return {
      rank: myRank + 1, // ranks are 1-based
      totalUsers: sorted.length,
      ...sorted[myRank],
    };
  }
}
