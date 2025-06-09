import { Typed } from "@quick-toolkit/class-transformer";
import { ApiProperty } from "@quick-toolkit/http";

export class HttpResource<A> {
    @ApiProperty({
      "type": "string"
    })
    @Typed(String)
    public code?: string;
    @ApiProperty({
      "type": "array"
    })
    public data?: A;
    @ApiProperty({
      "type": "string"
    })
    @Typed(String)
    public message?: string;
    @ApiProperty({
      "type": "boolean"
    })
    public ok?: boolean;
}
