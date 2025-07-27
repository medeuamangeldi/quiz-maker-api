import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SubmitTestDto } from './dto/submit-test.dto';

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
  @ApiOperation({ summary: 'Get all tests' })
  findAll() {
    return this.testService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by ID' })
  findOne(@Param('id') id: string) {
    return this.testService.findOne(+id);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit answers for a test and get results' })
  async submitTestEndpoint(@Body() submitTestDto: SubmitTestDto) {
    return await this.testService.submitTest(
      submitTestDto.testId,
      submitTestDto.answers,
    );
  }
}
