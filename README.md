# @quick-toolkit/qgen
The `@quick-toolkit/qgen` package is used to generate TS class files with the openAPI interface.

## Installing

```shell
npm i -g @quick-toolkit/qgen
```

## Configuration file

Create `openapi.config.yaml` or `openapi.config.yml` or `openapi.config.json` in you project root path.

Examples: `openapi.config.yam`
```yaml 
projects:
  - name: "ucenter"
    description: "用户中心"
    services:
      - name: "auth"
        description: "权限校验服务"
        OpenAPI:
          version: "2.0"
          url: "https://accountdev.mingqi-tech.cn/api/auth-service/v2/api-docs"
      - name: "user"
        description: "用户服务"
        OpenAPI:
          version: "2.0"
          url: "https://accountdev.mingqi-tech.cn/api/user-service/v2/api-docs"
  - name: "P&L"
    description: "P&L"
    services:
      - name: "pl"
        description: "用户服务"
        OpenAPI:
          version: "3.0"
          url: "https://pl.mingqi-tech.cn/v3/api-docs"
```


```shell
# help message
qgen -h

# start gen
qgen swagger
```

## Issues
Create [issues](https://github.com/geckoai/ggen/issues) in this repository for anything related to the Class Transformer. When creating issues please search for existing issues to avoid duplicates.


## License
Licensed under the [MIT](https://github.com/geckoai/ggen/blob/master/LICENSE) License.
