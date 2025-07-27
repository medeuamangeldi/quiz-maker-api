import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  questionId: string;

  @ApiProperty({
    description:
      'User answers. For single/multiple choice: array of strings; for text: array with one string',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers: string[];
}

export class SubmitTestDto {
  @ApiProperty({ description: 'Test ID' })
  @IsNumber()
  testId: number;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
