import { Typed } from "@quick-toolkit/class-transformer";
import { ApiProperty } from "@quick-toolkit/http";

export class SysAuthority {
    /** 权限类型:  0-菜单 1-功能 2-数据 */
    @ApiProperty({
      "type": "string",
      "description": "权限类型:  0-菜单 1-功能 2-数据"
    })
    @Typed(String, {
              "rules": {
                "type": "Enum",
                "enums": [
                  "0",
                  "1",
                  "2"
                ]
              }
            })
    public authorityType?: "0"|"1"|"2";
    /** 创建人 */
    @ApiProperty({
      "type": "string",
      "description": "创建人"
    })
    @Typed(String)
    public createBy?: string;
    /** 创建时间 */
    @ApiProperty({
      "type": "string",
      "description": "创建时间"
    })
    @Typed(String)
    public createDatetime?: string;
    /** 描述 */
    @ApiProperty({
      "type": "string",
      "description": "描述"
    })
    @Typed(String)
    public description?: string;
    /** 权限ID */
    @ApiProperty({
      "type": "string",
      "description": "权限ID"
    })
    @Typed(String)
    public id?: string;
    /** 名称 */
    @ApiProperty({
      "type": "string",
      "description": "名称"
    })
    @Typed(String)
    public name?: string;
    /** 父权限ID */
    @ApiProperty({
      "type": "string",
      "description": "父权限ID"
    })
    @Typed(String)
    public parentId?: string;
    /** 显示序号 */
    @ApiProperty({
      "type": "string",
      "description": "显示序号"
    })
    @Typed(String)
    public sortNo?: string;
    /** 状态:  0-录入 1-启用 2-禁用 */
    @ApiProperty({
      "type": "string",
      "description": "状态:  0-录入 1-启用 2-禁用"
    })
    @Typed(String, {
              "rules": {
                "type": "Enum",
                "enums": [
                  "0",
                  "1",
                  "2"
                ]
              }
            })
    public status?: "0"|"1"|"2";
    /** 更新人 */
    @ApiProperty({
      "type": "string",
      "description": "更新人"
    })
    @Typed(String)
    public updateBy?: string;
    /** 更新时间 */
    @ApiProperty({
      "type": "string",
      "description": "更新时间"
    })
    @Typed(String)
    public updateDatetime?: string;
    /** 版本号 */
    @ApiProperty({
      "type": "integer",
      "description": "版本号"
    })
    @Typed(Number)
    public version?: number;
}
