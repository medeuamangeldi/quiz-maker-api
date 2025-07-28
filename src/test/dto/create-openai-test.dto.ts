import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateOpenAiTestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mathematics' })
  topic: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5, description: 'Number of questions to generate' })
  numberOfQuestions: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Focus on algebra and simple equations',
    required: false,
  })
  specialInstructions?: string;
}
