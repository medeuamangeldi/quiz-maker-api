import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsIn(['single', 'multiple', 'text'])
  @ApiProperty({ enum: ['single', 'multiple', 'text'] })
  type: string;

  @IsArray()
  @ApiProperty({ type: [String], required: false })
  options: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  correctAnswers: string[];

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 5 })
  points: number;
}

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  tags: string[];

  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsArray()
  @ApiProperty({ type: [CreateQuestionDto] })
  questions: CreateQuestionDto[];
}
