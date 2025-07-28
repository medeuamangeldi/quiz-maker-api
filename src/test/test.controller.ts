import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SubmitTestDto } from './dto/submit-test.dto';
import { CreateOpenAiTestDto } from './dto/create-openai-test.dto';

@ApiTags('tests')
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new test (requires auth)' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tests with current user submission (auth)',
  })
  findAll(@Req() req) {
    const userId = req.user.userId;
    return this.testService.findAll(userId as number);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get test by ID with current user submission (auth)',
  })
  findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.testService.findOne(+id, userId as number);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitTestEndpoint(@Req() req, @Body() submitTestDto: SubmitTestDto) {
    const userId = req.user.userId;
    return await this.testService.submitTest(
      userId as number,
      submitTestDto.testId,
      submitTestDto.answers,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateTest(@Body() dto: CreateOpenAiTestDto) {
    return this.testService.createTestWithOpenAi(dto);
  }
}
