import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':id')
  findPostWithAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneWithAuthor(id);
  }
}
