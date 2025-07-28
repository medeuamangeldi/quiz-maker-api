import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async createUser(@Body() body: CreateUserDto) {
    const { username, email, password } = body;
    return await this.userService.create(username, email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getByEmail(@Param('email') email: string) {
    return await this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getByUsername(@Param('username') username: string) {
    return await this.userService.findByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.userId;
    return this.userService.getMe(userId as number);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rankings')
  async getUserRankings() {
    return await this.userService.getUserRankings();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':testId/top-performers')
  async getTopPerformers(@Param('testId', ParseIntPipe) testId: number) {
    return this.userService.getTopPerformersByTest(testId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-ranking')
  @ApiOperation({ summary: 'Get current user ranking' })
  @ApiResponse({ status: 200, description: 'User ranking returned' })
  @ApiResponse({ status: 403, description: 'User not found or unauthorized' })
  async getMyRanking(@Req() req) {
    const userId = req.user.userId;
    return this.userService.getMyRanking(userId as number);
  }
}
