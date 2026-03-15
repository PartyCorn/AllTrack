import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateUpdateFranchiseDto {
  @ApiProperty({ example: 'Naruto' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'Shonen ninja universe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}