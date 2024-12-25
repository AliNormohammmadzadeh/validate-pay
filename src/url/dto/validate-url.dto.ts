import { IsUrl } from "class-validator";


export class ValidateUrlDto {
    @IsUrl({} , { message: "Invalid URL format"})
    url : string
}