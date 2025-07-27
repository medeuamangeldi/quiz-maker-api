import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';

export interface DetailedResult {
  questionId: string;
  correct: boolean;
  earnedPoints?: number;
  totalPoints?: number;
  message?: string;
}

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async create(createTestDto: CreateTestDto) {
    const { title, tags, questions } = createTestDto;

    return await this.prisma.test.create({
      data: {
        title,
        tags,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            correctAnswers: q.correctAnswers,
            points: q.points,
          })),
        },
      },
      include: { questions: true },
    });
  }

  findAll() {
    return this.prisma.test.findMany({ include: { questions: true } });
  }

  findOne(id: number) {
    return this.prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    });
  }

  // test.service.ts (add this method)

  async submitTest(
    testId: number,
    answers: { questionId: string; answers: string[] }[],
  ) {
    // Load test with questions from DB
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    // Map questionId to question for fast lookup
    const questionsMap = new Map<string, (typeof test.questions)[0]>();
    test.questions.forEach((q) => questionsMap.set(String(q.id as number), q));

    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedResults: DetailedResult[] = [];

    for (const userAnswer of answers) {
      const question = questionsMap.get(userAnswer.questionId);
      if (!question) {
        detailedResults.push({
          questionId: userAnswer.questionId,
          correct: false,
          message: 'Question not found',
        });
        continue;
      }

      totalPoints += question.points;

      // Normalize arrays for comparison (case insensitive, trimmed)
      const correctAnswers = question.correctAnswers.map((a) =>
        a.trim().toLowerCase(),
      );
      const givenAnswers = userAnswer.answers.map((a) =>
        a.trim().toLowerCase(),
      );

      // Check correctness depending on question type
      let isCorrect = false;
      if (question.type === 'text') {
        // Check if any correct answer matches user answer
        isCorrect = givenAnswers.some((ans) => correctAnswers.includes(ans));
      } else {
        // For single and multiple, check if arrays match exactly (order-insensitive)
        isCorrect =
          givenAnswers.length === correctAnswers.length &&
          givenAnswers.every((ans) => correctAnswers.includes(ans));
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }

      detailedResults.push({
        questionId: String(question.id),
        correct: isCorrect,
        earnedPoints: isCorrect ? question.points : 0,
        totalPoints: question.points,
      });
    }

    return {
      testId,
      totalPoints,
      earnedPoints,
      detailedResults,
    };
  }
}
