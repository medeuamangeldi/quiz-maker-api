/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CreateOpenAiTestDto } from './dto/create-openai-test.dto';
import { OpenAI } from 'openai';
export interface DetailedResult {
  questionId: string;
  correct: boolean;
  earnedPoints?: number;
  totalPoints?: number;
  message?: string;
}
@Injectable()
export class TestService {
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

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

  async createTestWithOpenAi(createOpenAiTestDto: CreateOpenAiTestDto) {
    const { topic, numberOfQuestions, specialInstructions } =
      createOpenAiTestDto;

    const prompt = `
You are an expert test creator. Create a test titled "${topic}" with ${numberOfQuestions} questions.
Each question should include:
- question text,
- type: one of "single", "multiple", or "text",
- options (for "single" and "multiple" only),
- correctAnswers (for all types),
- points (assign between 1 and 5 points per question).

${specialInstructions ? `Special instructions: ${specialInstructions}` : ''}

Return the result as a JSON object in the following format:

{
  "title": "${topic}",
  "tags": ["${topic}"],
  "questions": [
    {
      "text": "Question text",
      "type": "single" | "multiple" | "text",
      "options": ["option1", "option2", ...],  // omit for "text" type
      "correctAnswers": ["correct option(s) or text answer"],
      "points": number
    }
  ]
}
Only return JSON, no additional commentary.
    `.trim();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates quiz tests in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const jsonText = response.choices[0].message?.content?.trim();
    if (!jsonText) {
      throw new Error('OpenAI did not return any content');
    }

    let testData;
    try {
      testData = JSON.parse(jsonText);
    } catch (e) {
      throw new Error('Failed to parse JSON from OpenAI response');
    }

    return this.create(testData);
  }

  findAll(userId: number) {
    return this.prisma.test.findMany({
      include: {
        questions: true,
        testSubmissions: {
          where: { userId },
          take: 1,
        },
      },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: true,
        testSubmissions: {
          where: { userId },
          take: 1,
        },
      },
    });
  }

  async submitTest(
    userId: number,
    testId: number,
    answers: { questionId: string; answers: string[] }[],
  ) {
    const existingSubmission = await this.prisma.testSubmission.findUnique({
      where: {
        userId_testId: { userId, testId },
      },
    });

    if (existingSubmission) {
      throw new Error('You have already submitted this test.');
    }

    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    const questionsMap = new Map<string, (typeof test.questions)[0]>();
    test.questions.forEach((q) => questionsMap.set(String(q.id), q));

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

      const correctAnswers = question.correctAnswers.map((a) =>
        a.trim().toLowerCase(),
      );
      const givenAnswers = userAnswer.answers.map((a) =>
        a.trim().toLowerCase(),
      );

      let isCorrect = false;
      if (question.type === 'text') {
        isCorrect = givenAnswers.some((ans) => correctAnswers.includes(ans));
      } else {
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

    await this.prisma.testSubmission.create({
      data: {
        userId,
        testId,
        answers,
        earnedPoints,
        totalPoints,
      },
    });

    return {
      testId,
      totalPoints,
      earnedPoints,
      detailedResults,
    };
  }
}
