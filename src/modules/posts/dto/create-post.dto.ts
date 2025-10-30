import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'My First Blog Post',
    description: 'The title of the post',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'This is the content of my blog post...',
    description: 'The content of the post',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

