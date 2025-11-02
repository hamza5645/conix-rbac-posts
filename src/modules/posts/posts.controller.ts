import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts-response.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination and filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully with pagination',
    type: PaginatedPostsResponseDto,
  })
  findAll(@Query() queryDto: GetPostsQueryDto): Promise<PaginatedPostsResponseDto> {
    return this.postsService.findAll(queryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post (Authenticated users only)' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a post with author details' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findPostWithAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneWithAuthor(id);
  }
}
