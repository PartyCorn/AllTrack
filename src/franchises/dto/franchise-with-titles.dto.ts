import { ApiProperty } from '@nestjs/swagger';
import { FranchiseDto } from './franchise.dto';
import { TitleDto } from '../../titles/dto/title.dto';

export class FranchiseWithTitlesDto extends FranchiseDto {
  @ApiProperty({
    description: 'Тайтлы франшизы, сгруппированные по типам',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { $ref: '#/components/schemas/TitleDto' },
    },
    example: {
      MOVIE: [{ id: 1, title: 'Movie Title', type: 'MOVIE' }],
      SERIES: [{ id: 2, title: 'Series Title', type: 'SERIES' }],
    },
  })
  titles: { [key: string]: TitleDto[] };
}
