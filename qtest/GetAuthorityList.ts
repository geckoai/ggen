import { Typed } from "@quick-toolkit/class-transformer";
import { ApiProperty, ApiRequest } from "@quick-toolkit/http";

@ApiRequest({
      "url": "/api/user-service/authority/list",
      "method": "get",
      "description": "权限列表"
    })
export class GetAuthorityList {
    @ApiProperty({
          "required": false,
          "description": "Bearer Token",
          "in": "header"
        })
    @Typed(String)
    public Authorization?: string;
}
