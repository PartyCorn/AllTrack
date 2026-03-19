import { ApiProperty } from '@nestjs/swagger';

export class CoverSearchResultDto {
  @ApiProperty({
    description: 'Массив URL обложек',
    type: [String],
    example: [
      'https://example.com/cover1.jpg',
      'https://example.com/cover2.jpg',
    ],
  })
  covers: string[];
}
