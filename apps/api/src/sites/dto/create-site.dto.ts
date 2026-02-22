import { IsString, IsUrl } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  domain!: string;
}
