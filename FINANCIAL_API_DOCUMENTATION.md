# 记账系统 API 文档

## 概述

本文档描述了记账系统的所有REST API接口，包括分类管理、财务记录管理和月度汇总统计功能。

## 基础信息

- **Base URL**: `http://localhost:8080/api`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "data": {...},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "error": "错误信息描述"
}
```

## 1. 分类管理 API

### 1.1 创建分类

**接口地址**: `POST /api/categories`

**请求参数**:
```json
{
  "name": "餐饮",
  "type": "EXPENSE",
  "description": "日常餐饮支出",
  "iconName": "restaurant",
  "colorCode": "#FF5722"
}
```

**参数说明**:
- `name` (string, 必填): 分类名称，1-50字符
- `type` (string, 必填): 分类类型，INCOME(收入) 或 EXPENSE(支出)
- `description` (string, 可选): 分类描述，最多200字符
- `iconName` (string, 可选): 图标名称，最多50字符
- `colorCode` (string, 可选): 颜色代码，格式如#FF5722

**响应示例**:
```json
{
  "id": 1,
  "userId": 123,
  "name": "餐饮",
  "type": "EXPENSE",
  "description": "日常餐饮支出",
  "iconName": "restaurant",
  "colorCode": "#FF5722",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

### 1.2 更新分类

**接口地址**: `PUT /api/categories/{categoryId}`

**请求参数**: 同创建分类

**响应示例**: 同创建分类

### 1.3 删除分类

**接口地址**: `DELETE /api/categories/{categoryId}`

**响应示例**:
```json
{
  "message": "分类删除成功"
}
```

### 1.4 获取用户所有分类

**接口地址**: `GET /api/categories`

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 123,
    "name": "餐饮",
    "type": "EXPENSE",
    "description": "日常餐饮支出",
    "iconName": "restaurant",
    "colorCode": "#FF5722",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
]
```

### 1.5 根据类型获取分类

**接口地址**: `GET /api/categories/type/{type}`

**路径参数**:
- `type`: INCOME 或 EXPENSE

### 1.6 获取收入分类

**接口地址**: `GET /api/categories/income`

### 1.7 获取支出分类

**接口地址**: `GET /api/categories/expense`

### 1.8 获取分类详情

**接口地址**: `GET /api/categories/{categoryId}`

### 1.9 统计分类数量

**接口地址**: `GET /api/categories/count`

**响应示例**:
```json
{
  "total": 15,
  "income": 5,
  "expense": 10
}
```

### 1.10 初始化默认分类

**接口地址**: `POST /api/categories/initialize`

**响应示例**:
```json
{
  "message": "默认分类初始化成功"
}
```

## 2. 财务记录管理 API

### 2.1 创建财务记录

**接口地址**: `POST /api/financial-records`

**请求参数**:
```json
{
  "categoryId": 1,
  "amount": 50.00,
  "recordDate": "2024-01-01",
  "description": "午餐",
  "paymentMethod": "支付宝",
  "location": "公司附近",
  "tags": ["工作日", "午餐"],
  "isRecurring": false,
  "recurringType": null
}
```

**参数说明**:
- `categoryId` (long, 必填): 分类ID
- `amount` (decimal, 必填): 金额，必须大于0，最多2位小数
- `recordDate` (date, 必填): 记录日期，格式YYYY-MM-DD
- `description` (string, 可选): 描述，最多500字符
- `paymentMethod` (string, 可选): 支付方式，最多50字符
- `location` (string, 可选): 地点，最多100字符
- `tags` (array, 可选): 标签数组
- `isRecurring` (boolean, 可选): 是否重复，默认false
- `recurringType` (string, 可选): 重复类型，DAILY/WEEKLY/MONTHLY/YEARLY

**响应示例**:
```json
{
  "id": 1,
  "categoryId": 1,
  "categoryName": "餐饮",
  "categoryType": "EXPENSE",
  "categoryIcon": "restaurant",
  "categoryColor": "#FF5722",
  "amount": 50.00,
  "recordDate": "2024-01-01",
  "description": "午餐",
  "paymentMethod": "支付宝",
  "location": "公司附近",
  "tags": ["工作日", "午餐"],
  "isRecurring": false,
  "recurringType": null,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

### 2.2 更新财务记录

**接口地址**: `PUT /api/financial-records/{recordId}`

**请求参数**: 同创建财务记录

### 2.3 删除财务记录

**接口地址**: `DELETE /api/financial-records/{recordId}`

**响应示例**:
```json
{
  "message": "记录删除成功"
}
```

### 2.4 分页获取财务记录

**接口地址**: `GET /api/financial-records`

**查询参数**:
- `page` (int, 可选): 页码，从0开始，默认0
- `size` (int, 可选): 每页大小，默认20
- `sortBy` (string, 可选): 排序字段，默认recordDate
- `sortDir` (string, 可选): 排序方向，asc/desc，默认desc

**响应示例**:
```json
{
  "content": [
    {
      "id": 1,
      "categoryId": 1,
      "categoryName": "餐饮",
      "categoryType": "EXPENSE",
      "amount": 50.00,
      "recordDate": "2024-01-01",
      "description": "午餐",
      "createdAt": "2024-01-01T12:00:00"
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
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

### 2.5 根据日期范围获取记录

**接口地址**: `GET /api/financial-records/date-range`

**查询参数**:
- `startDate` (date, 必填): 开始日期，格式YYYY-MM-DD
- `endDate` (date, 必填): 结束日期，格式YYYY-MM-DD
- `page` (int, 可选): 页码，默认0
- `size` (int, 可选): 每页大小，默认20

### 2.6 根据分类获取记录

**接口地址**: `GET /api/financial-records/category/{categoryId}`

**查询参数**:
- `page` (int, 可选): 页码，默认0
- `size` (int, 可选): 每页大小，默认20

### 2.7 根据分类类型获取记录

**接口地址**: `GET /api/financial-records/type/{type}`

**路径参数**:
- `type`: INCOME 或 EXPENSE

### 2.8 搜索记录

**接口地址**: `GET /api/financial-records/search`

**查询参数**:
- `keyword` (string, 必填): 搜索关键词
- `page` (int, 可选): 页码，默认0
- `size` (int, 可选): 每页大小，默认20

### 2.9 获取最近记录

**接口地址**: `GET /api/financial-records/recent`

**查询参数**:
- `limit` (int, 可选): 记录数量，默认10

### 2.10 获取记录详情

**接口地址**: `GET /api/financial-records/{recordId}`

### 2.11 获取月度收入

**接口地址**: `GET /api/financial-records/monthly-income/{yearMonth}`

**路径参数**:
- `yearMonth`: 年月，格式YYYY-MM

**响应示例**:
```json
{
  "yearMonth": "2024-01",
  "income": 5000.00
}
```

### 2.12 获取月度支出

**接口地址**: `GET /api/financial-records/monthly-expense/{yearMonth}`

**响应示例**:
```json
{
  "yearMonth": "2024-01",
  "expense": 3000.00
}
```

### 2.13 获取分类统计

**接口地址**: `GET /api/financial-records/category-statistics`

**查询参数**:
- `startDate` (date, 必填): 开始日期
- `endDate` (date, 必填): 结束日期
- `type` (string, 必填): 分类类型，INCOME/EXPENSE

**响应示例**:
```json
[
  {
    "categoryName": "餐饮",
    "amount": 1500.00,
    "percentage": 50.0
  },
  {
    "categoryName": "交通",
    "amount": 800.00,
    "percentage": 26.7
  }
]
```

### 2.14 获取记录统计概览

**接口地址**: `GET /api/financial-records/statistics/overview`

**响应示例**:
```json
{
  "currentMonth": "2024-01",
  "monthlyIncome": 5000.00,
  "monthlyExpense": 3000.00,
  "netAmount": 2000.00,
  "incomeCount": 5,
  "expenseCount": 25,
  "totalRecords": 30,
  "maxIncome": 2000.00,
  "maxExpense": 500.00
}
```

## 3. 月度汇总统计 API

### 3.1 获取指定月份汇总

**接口地址**: `GET /api/monthly-summaries/{yearMonth}`

**路径参数**:
- `yearMonth`: 年月，格式YYYY-MM

**响应示例**:
```json
{
  "yearMonth": "2024-01",
  "totalIncome": 5000.00,
  "totalExpense": 3000.00,
  "netAmount": 2000.00,
  "incomeCount": 5,
  "expenseCount": 25,
  "totalRecords": 30,
  "averageDailyExpense": 96.77,
  "largestExpense": 500.00,
  "largestIncome": 2000.00,
  "categoryStatistics": [
    {
      "categoryName": "餐饮",
      "amount": 1500.00,
      "percentage": 50.0
    }
  ]
}
```

### 3.2 获取所有月度汇总

**接口地址**: `GET /api/monthly-summaries`

### 3.3 获取指定年份汇总

**接口地址**: `GET /api/monthly-summaries/year/{year}`

**路径参数**:
- `year`: 年份，如2024

### 3.4 获取最近几个月汇总

**接口地址**: `GET /api/monthly-summaries/recent`

**查询参数**:
- `months` (int, 可选): 月份数量，默认6

### 3.5 获取日期范围汇总

**接口地址**: `GET /api/monthly-summaries/range`

**查询参数**:
- `startYearMonth` (string, 必填): 开始年月，格式YYYY-MM
- `endYearMonth` (string, 必填): 结束年月，格式YYYY-MM

### 3.6 手动更新月度汇总

**接口地址**: `POST /api/monthly-summaries/update/{yearMonth}`

**响应示例**:
```json
{
  "message": "月度汇总更新成功"
}
```

### 3.7 获取收入最高月份

**接口地址**: `GET /api/monthly-summaries/highest-income`

### 3.8 获取支出最高月份

**接口地址**: `GET /api/monthly-summaries/highest-expense`

### 3.9 获取财务趋势分析

**接口地址**: `GET /api/monthly-summaries/trends`

**查询参数**:
- `months` (int, 可选): 分析月份数，默认12

**响应示例**:
```json
{
  "period": "12个月",
  "averageIncome": 4500.00,
  "averageExpense": 3200.00,
  "averageNet": 1300.00,
  "latestMonth": "2024-01",
  "latestIncome": 5000.00,
  "latestExpense": 3000.00,
  "latestNet": 2000.00,
  "summaries": [...]
}
```

### 3.10 获取汇总统计信息

**接口地址**: `GET /api/monthly-summaries/statistics`

**响应示例**:
```json
{
  "totalIncome": 54000.00,
  "totalExpense": 38400.00,
  "totalNet": 15600.00,
  "totalRecords": 360,
  "monthsWithData": 12,
  "averageMonthlyIncome": 4500.00,
  "averageMonthlyExpense": 3200.00,
  "highestIncomeMonth": {...},
  "highestExpenseMonth": {...}
}
```

## 4. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 5. 数据模型

### 5.1 分类 (Category)

```json
{
  "id": "分类ID",
  "userId": "用户ID",
  "name": "分类名称",
  "type": "分类类型(INCOME/EXPENSE)",
  "description": "分类描述",
  "iconName": "图标名称",
  "colorCode": "颜色代码",
  "isActive": "是否激活",
  "createdAt": "创建时间",
  "updatedAt": "更新时间"
}
```

### 5.2 财务记录 (FinancialRecord)

```json
{
  "id": "记录ID",
  "userId": "用户ID",
  "categoryId": "分类ID",
  "amount": "金额",
  "recordDate": "记录日期",
  "description": "描述",
  "paymentMethod": "支付方式",
  "location": "地点",
  "tags": "标签数组",
  "isRecurring": "是否重复",
  "recurringType": "重复类型",
  "createdAt": "创建时间",
  "updatedAt": "更新时间"
}
```

### 5.3 月度汇总 (MonthlyFinancialSummary)

```json
{
  "id": "汇总ID",
  "userId": "用户ID",
  "yearMonth": "年月",
  "totalIncome": "总收入",
  "totalExpense": "总支出",
  "netAmount": "净额",
  "incomeCount": "收入记录数",
  "expenseCount": "支出记录数",
  "totalRecords": "总记录数",
  "averageDailyExpense": "日均支出",
  "largestExpense": "最大支出",
  "largestIncome": "最大收入",
  "createdAt": "创建时间",
  "updatedAt": "更新时间"
}
```

## 6. 使用示例

### 6.1 创建一笔支出记录

```bash
curl -X POST http://localhost:8080/api/financial-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "categoryId": 1,
    "amount": 50.00,
    "recordDate": "2024-01-01",
    "description": "午餐",
    "paymentMethod": "支付宝"
  }'
```

### 6.2 获取当月统计

```bash
curl -X GET http://localhost:8080/api/monthly-summaries/2024-01 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6.3 搜索记录

```bash
curl -X GET "http://localhost:8080/api/financial-records/search?keyword=午餐&page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 7. 注意事项

1. 所有API都需要JWT认证，请在请求头中包含有效的Authorization token
2. 日期格式统一使用ISO 8601标准 (YYYY-MM-DD)
3. 金额字段使用BigDecimal类型，支持最多2位小数
4. 分页查询的页码从0开始
5. 删除分类时会进行软删除，不会物理删除数据
6. 月度汇总会在创建/更新/删除财务记录时自动更新
7. 所有时间字段都使用UTC时区

## 8. 版本信息

- **API版本**: v1.0
- **文档版本**: 1.0.0
- **最后更新**: 2024-01-01