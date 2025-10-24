# 财务记录模块 API 文档

## 概述

财务记录模块提供完整的收支记录管理功能，包括记录的创建、更新、删除、查询、搜索和统计分析等操作。

### 基础信息

- **Base URL**: `/api/financial-records`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 通用响应格式

#### 成功响应
```json
{
  "data": {...},
  "status": 200
}
```

#### 错误响应
```json
{
  "error": "错误信息",
  "status": 400/500
}
```

---

## API 接口列表

### 1. 创建财务记录

**接口地址**: `POST /api/financial-records`

**功能描述**: 创建新的收入或支出记录

**请求参数**:
```json
{
  "amount": 150.50,
  "categoryId": 1,
  "description": "午餐费用",
  "recordDate": "2024-01-15",
  "tags": ["餐饮", "工作日"]
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| amount | BigDecimal | 是 | 金额，必须大于0 |
| categoryId | Long | 是 | 分类ID |
| description | String | 否 | 描述，最大500字符 |
| recordDate | LocalDate | 是 | 记录日期 |
| tags | List<String> | 否 | 标签列表 |

**响应示例**:
```json
{
  "id": 1,
  "userId": 123,
  "amount": 150.50,
  "categoryId": 1,
  "categoryName": "餐饮",
  "categoryType": "EXPENSE",
  "description": "午餐费用",
  "recordDate": "2024-01-15",
  "tags": ["餐饮", "工作日"],
  "createdAt": "2024-01-15T12:30:00",
  "updatedAt": "2024-01-15T12:30:00"
}
```

### 2. 更新财务记录

**接口地址**: `PUT /api/financial-records/{recordId}`

**功能描述**: 更新指定财务记录的信息

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| recordId | Long | 记录ID |

**请求参数**: 同创建财务记录接口

**响应示例**: 同创建财务记录接口

### 3. 删除财务记录

**接口地址**: `DELETE /api/financial-records/{recordId}`

**功能描述**: 删除指定财务记录

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| recordId | Long | 记录ID |

**响应示例**:
```json
{
  "message": "财务记录删除成功"
}
```

### 4. 获取财务记录详情

**接口地址**: `GET /api/financial-records/{recordId}`

**功能描述**: 获取指定财务记录的详细信息

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| recordId | Long | 记录ID |

**响应示例**:
```json
{
  "id": 1,
  "userId": 123,
  "amount": 150.50,
  "categoryId": 1,
  "categoryName": "餐饮",
  "categoryType": "EXPENSE",
  "description": "午餐费用",
  "recordDate": "2024-01-15",
  "tags": ["餐饮", "工作日"],
  "createdAt": "2024-01-15T12:30:00",
  "updatedAt": "2024-01-15T12:30:00"
}
```

### 5. 获取用户财务记录列表

**接口地址**: `GET /api/financial-records`

**功能描述**: 获取当前用户的财务记录列表，支持分页

**查询参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 0 | 页码，从0开始 |
| size | Integer | 否 | 20 | 每页大小 |
| sort | String | 否 | recordDate,desc | 排序字段和方向 |

**响应示例**:
```json
{
  "content": [
    {
      "id": 1,
      "userId": 123,
      "amount": 150.50,
      "categoryId": 1,
      "categoryName": "餐饮",
      "categoryType": "EXPENSE",
      "description": "午餐费用",
      "recordDate": "2024-01-15",
      "tags": ["餐饮", "工作日"],
      "createdAt": "2024-01-15T12:30:00",
      "updatedAt": "2024-01-15T12:30:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

### 6. 按日期范围查询财务记录

**接口地址**: `GET /api/financial-records/date-range`

**功能描述**: 根据日期范围查询财务记录

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | LocalDate | 是 | 开始日期 |
| endDate | LocalDate | 是 | 结束日期 |
| page | Integer | 否 | 页码，从0开始 |
| size | Integer | 否 | 每页大小 |

**请求示例**:
```
GET /api/financial-records/date-range?startDate=2024-01-01&endDate=2024-01-31&page=0&size=20
```

**响应示例**: 同获取财务记录列表接口

### 7. 按分类查询财务记录

**接口地址**: `GET /api/financial-records/category/{categoryId}`

**功能描述**: 根据分类ID查询财务记录

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| categoryId | Long | 分类ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Integer | 否 | 页码，从0开始 |
| size | Integer | 否 | 每页大小 |

**响应示例**: 同获取财务记录列表接口

### 8. 搜索财务记录

**接口地址**: `GET /api/financial-records/search`

**功能描述**: 根据关键词搜索财务记录（搜索描述和标签）

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | String | 是 | 搜索关键词 |
| page | Integer | 否 | 页码，从0开始 |
| size | Integer | 否 | 每页大小 |

**请求示例**:
```
GET /api/financial-records/search?keyword=午餐&page=0&size=20
```

**响应示例**: 同获取财务记录列表接口

### 9. 获取财务统计信息

**接口地址**: `GET /api/financial-records/statistics`

**功能描述**: 获取用户的财务统计信息

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | LocalDate | 否 | 统计开始日期 |
| endDate | LocalDate | 否 | 统计结束日期 |

**响应示例**:
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 3500.00,
  "netAmount": 1500.00,
  "recordCount": 45,
  "incomeCount": 15,
  "expenseCount": 30,
  "averageIncome": 333.33,
  "averageExpense": 116.67,
  "topIncomeCategory": {
    "categoryId": 2,
    "categoryName": "工资",
    "amount": 4000.00
  },
  "topExpenseCategory": {
    "categoryId": 1,
    "categoryName": "餐饮",
    "amount": 1200.00
  }
}
```

### 10. 按月份统计财务数据

**接口地址**: `GET /api/financial-records/monthly-statistics`

**功能描述**: 按月份统计收入和支出数据

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| year | Integer | 是 | 年份 |

**请求示例**:
```
GET /api/financial-records/monthly-statistics?year=2024
```

**响应示例**:
```json
[
  {
    "month": 1,
    "totalIncome": 5000.00,
    "totalExpense": 3500.00,
    "netAmount": 1500.00,
    "recordCount": 45
  },
  {
    "month": 2,
    "totalIncome": 5200.00,
    "totalExpense": 3800.00,
    "netAmount": 1400.00,
    "recordCount": 52
  }
]
```

### 11. 按分类统计财务数据

**接口地址**: `GET /api/financial-records/category-statistics`

**功能描述**: 按分类统计收入和支出数据

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | LocalDate | 否 | 统计开始日期 |
| endDate | LocalDate | 否 | 统计结束日期 |
| type | String | 否 | 分类类型：INCOME/EXPENSE |

**响应示例**:
```json
[
  {
    "categoryId": 1,
    "categoryName": "餐饮",
    "categoryType": "EXPENSE",
    "totalAmount": 1200.00,
    "recordCount": 25,
    "percentage": 34.29
  },
  {
    "categoryId": 2,
    "categoryName": "交通",
    "categoryType": "EXPENSE",
    "totalAmount": 800.00,
    "recordCount": 15,
    "percentage": 22.86
  }
]
```

### 12. 获取最近记录

**接口地址**: `GET /api/financial-records/recent`

**功能描述**: 获取用户最近的财务记录

**查询参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| limit | Integer | 否 | 10 | 返回记录数量 |

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 123,
    "amount": 150.50,
    "categoryId": 1,
    "categoryName": "餐饮",
    "categoryType": "EXPENSE",
    "description": "午餐费用",
    "recordDate": "2024-01-15",
    "tags": ["餐饮", "工作日"],
    "createdAt": "2024-01-15T12:30:00",
    "updatedAt": "2024-01-15T12:30:00"
  }
]
```

### 13. 批量导入财务记录

**接口地址**: `POST /api/financial-records/batch-import`

**功能描述**: 批量导入财务记录

**请求参数**:
```json
[
  {
    "amount": 150.50,
    "categoryId": 1,
    "description": "午餐费用",
    "recordDate": "2024-01-15",
    "tags": ["餐饮", "工作日"]
  },
  {
    "amount": 3000.00,
    "categoryId": 2,
    "description": "月度工资",
    "recordDate": "2024-01-01",
    "tags": ["工资", "收入"]
  }
]
```

**响应示例**:
```json
{
  "successCount": 2,
  "failureCount": 0,
  "totalCount": 2,
  "errors": []
}
```

---

## 数据模型

### FinancialRecord (财务记录)

```json
{
  "id": "Long - 记录ID",
  "userId": "Long - 用户ID",
  "amount": "BigDecimal - 金额",
  "categoryId": "Long - 分类ID",
  "categoryName": "String - 分类名称",
  "categoryType": "CategoryType - 分类类型",
  "description": "String - 描述",
  "recordDate": "LocalDate - 记录日期",
  "tags": "List<String> - 标签列表",
  "createdAt": "LocalDateTime - 创建时间",
  "updatedAt": "LocalDateTime - 更新时间"
}
```

### FinancialRecordRequest (财务记录请求)

```json
{
  "amount": "BigDecimal - 金额 (必填，必须大于0)",
  "categoryId": "Long - 分类ID (必填)",
  "description": "String - 描述 (可选，最大500字符)",
  "recordDate": "LocalDate - 记录日期 (必填)",
  "tags": "List<String> - 标签列表 (可选)"
}
```

### FinancialRecordResponse (财务记录响应)

```json
{
  "id": "Long - 记录ID",
  "userId": "Long - 用户ID",
  "amount": "BigDecimal - 金额",
  "categoryId": "Long - 分类ID",
  "categoryName": "String - 分类名称",
  "categoryType": "CategoryType - 分类类型",
  "description": "String - 描述",
  "recordDate": "LocalDate - 记录日期",
  "tags": "List<String> - 标签列表",
  "createdAt": "LocalDateTime - 创建时间",
  "updatedAt": "LocalDateTime - 更新时间"
}
```

### FinancialStatisticsResponse (财务统计响应)

```json
{
  "totalIncome": "BigDecimal - 总收入",
  "totalExpense": "BigDecimal - 总支出",
  "netAmount": "BigDecimal - 净收入",
  "recordCount": "Long - 记录总数",
  "incomeCount": "Long - 收入记录数",
  "expenseCount": "Long - 支出记录数",
  "averageIncome": "BigDecimal - 平均收入",
  "averageExpense": "BigDecimal - 平均支出",
  "topIncomeCategory": "CategoryStatistics - 最高收入分类",
  "topExpenseCategory": "CategoryStatistics - 最高支出分类"
}
```

---

## 枚举类型

### CategoryType (分类类型)
- `INCOME`: 收入
- `EXPENSE`: 支出

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 记录不存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 创建支出记录
```bash
POST /api/financial-records
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 150.50,
  "categoryId": 1,
  "description": "午餐费用",
  "recordDate": "2024-01-15",
  "tags": ["餐饮", "工作日"]
}
```

### 查询日期范围内的记录
```bash
GET /api/financial-records/date-range?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

### 搜索包含关键词的记录
```bash
GET /api/financial-records/search?keyword=午餐
Authorization: Bearer {token}
```

### 获取财务统计信息
```bash
GET /api/financial-records/statistics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

---

## 注意事项

1. 所有接口都需要在请求头中携带有效的JWT Token
2. 金额字段使用BigDecimal类型，支持精确的小数计算
3. 记录日期不能是未来日期
4. 用户只能操作自己创建的财务记录
5. 删除记录是物理删除，请谨慎操作
6. 标签功能可用于记录的分类和搜索
7. 分页查询默认按记录日期倒序排列
8. 统计接口支持日期范围过滤，不传日期则统计全部数据

---

*文档版本: v1.0*  
*最后更新: 2024-01-01*