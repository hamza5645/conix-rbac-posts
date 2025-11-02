import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../entities/post.entity';

export class PaginatedPostsResponseDto {
  @ApiProperty({ description: 'Array of posts', type: [Post] })
  data: Post[];

  @ApiProperty({ description: 'Total number of posts matching the query' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}
