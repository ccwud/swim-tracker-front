# 月度财务汇总模块 API 文档

## 概述

月度财务汇总模块提供按月统计和分析用户财务数据的功能，包括月度收支汇总、趋势分析、同比环比分析等高级统计功能。

### 基础信息

- **Base URL**: `/api/monthly-summaries`
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

### 1. 获取月度汇总

**接口地址**: `GET /api/monthly-summaries/{year}/{month}`

**功能描述**: 获取指定年月的财务汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "id": 1,
  "userId": 123,
  "year": 2024,
  "month": 1,
  "totalIncome": 5000.00,
  "totalExpense": 3500.00,
  "netAmount": 1500.00,
  "recordCount": 45,
  "incomeCount": 15,
  "expenseCount": 30,
  "averageIncome": 333.33,
  "averageExpense": 116.67,
  "topIncomeCategory": "工资",
  "topExpenseCategory": "餐饮",
  "topIncomeCategoryAmount": 4000.00,
  "topExpenseCategoryAmount": 1200.00,
  "createdAt": "2024-02-01T00:00:00",
  "updatedAt": "2024-02-01T00:00:00"
}
```

### 2. 获取年度汇总列表

**接口地址**: `GET /api/monthly-summaries/year/{year}`

**功能描述**: 获取指定年份的所有月度汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 123,
    "year": 2024,
    "month": 1,
    "totalIncome": 5000.00,
    "totalExpense": 3500.00,
    "netAmount": 1500.00,
    "recordCount": 45,
    "incomeCount": 15,
    "expenseCount": 30,
    "averageIncome": 333.33,
    "averageExpense": 116.67,
    "topIncomeCategory": "工资",
    "topExpenseCategory": "餐饮",
    "topIncomeCategoryAmount": 4000.00,
    "topExpenseCategoryAmount": 1200.00,
    "createdAt": "2024-02-01T00:00:00",
    "updatedAt": "2024-02-01T00:00:00"
  },
  {
    "id": 2,
    "userId": 123,
    "year": 2024,
    "month": 2,
    "totalIncome": 5200.00,
    "totalExpense": 3800.00,
    "netAmount": 1400.00,
    "recordCount": 52,
    "incomeCount": 18,
    "expenseCount": 34,
    "averageIncome": 288.89,
    "averageExpense": 111.76,
    "topIncomeCategory": "工资",
    "topExpenseCategory": "餐饮",
    "topIncomeCategoryAmount": 4200.00,
    "topExpenseCategoryAmount": 1300.00,
    "createdAt": "2024-03-01T00:00:00",
    "updatedAt": "2024-03-01T00:00:00"
  }
]
```

### 3. 获取用户所有汇总

**接口地址**: `GET /api/monthly-summaries`

**功能描述**: 获取当前用户的所有月度汇总数据，支持分页

**查询参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 0 | 页码，从0开始 |
| size | Integer | 否 | 12 | 每页大小 |
| sort | String | 否 | year,desc,month,desc | 排序字段和方向 |

**响应示例**:
```json
{
  "content": [
    {
      "id": 1,
      "userId": 123,
      "year": 2024,
      "month": 1,
      "totalIncome": 5000.00,
      "totalExpense": 3500.00,
      "netAmount": 1500.00,
      "recordCount": 45,
      "incomeCount": 15,
      "expenseCount": 30,
      "averageIncome": 333.33,
      "averageExpense": 116.67,
      "topIncomeCategory": "工资",
      "topExpenseCategory": "餐饮",
      "topIncomeCategoryAmount": 4000.00,
      "topExpenseCategoryAmount": 1200.00,
      "createdAt": "2024-02-01T00:00:00",
      "updatedAt": "2024-02-01T00:00:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 12
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

### 4. 生成月度汇总

**接口地址**: `POST /api/monthly-summaries/generate/{year}/{month}`

**功能描述**: 手动生成指定年月的汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "id": 1,
  "userId": 123,
  "year": 2024,
  "month": 1,
  "totalIncome": 5000.00,
  "totalExpense": 3500.00,
  "netAmount": 1500.00,
  "recordCount": 45,
  "incomeCount": 15,
  "expenseCount": 30,
  "averageIncome": 333.33,
  "averageExpense": 116.67,
  "topIncomeCategory": "工资",
  "topExpenseCategory": "餐饮",
  "topIncomeCategoryAmount": 4000.00,
  "topExpenseCategoryAmount": 1200.00,
  "createdAt": "2024-02-01T00:00:00",
  "updatedAt": "2024-02-01T00:00:00"
}
```

### 5. 批量生成年度汇总

**接口地址**: `POST /api/monthly-summaries/generate-year/{year}`

**功能描述**: 批量生成指定年份所有月份的汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |

**响应示例**:
```json
{
  "year": 2024,
  "generatedCount": 12,
  "updatedCount": 0,
  "totalCount": 12,
  "summaries": [
    {
      "month": 1,
      "totalIncome": 5000.00,
      "totalExpense": 3500.00,
      "netAmount": 1500.00
    },
    {
      "month": 2,
      "totalIncome": 5200.00,
      "totalExpense": 3800.00,
      "netAmount": 1400.00
    }
  ]
}
```

### 6. 获取年度统计

**接口地址**: `GET /api/monthly-summaries/yearly-statistics/{year}`

**功能描述**: 获取指定年份的年度统计数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |

**响应示例**:
```json
{
  "year": 2024,
  "totalIncome": 60000.00,
  "totalExpense": 42000.00,
  "netAmount": 18000.00,
  "totalRecords": 540,
  "averageMonthlyIncome": 5000.00,
  "averageMonthlyExpense": 3500.00,
  "averageMonthlyNet": 1500.00,
  "highestIncomeMonth": {
    "month": 12,
    "amount": 8000.00
  },
  "highestExpenseMonth": {
    "month": 11,
    "amount": 5000.00
  },
  "bestNetMonth": {
    "month": 12,
    "amount": 3500.00
  },
  "monthlyTrend": {
    "incomeGrowthRate": 5.2,
    "expenseGrowthRate": 3.8,
    "netGrowthRate": 8.1
  }
}
```

### 7. 获取趋势分析

**接口地址**: `GET /api/monthly-summaries/trend-analysis`

**功能描述**: 获取用户的财务趋势分析数据

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| months | Integer | 否 | 分析月数，默认12个月 |

**响应示例**:
```json
{
  "analysisMonths": 12,
  "overallTrend": {
    "incomeGrowthRate": 5.2,
    "expenseGrowthRate": 3.8,
    "netGrowthRate": 8.1,
    "savingsRate": 30.0
  },
  "monthlyData": [
    {
      "year": 2024,
      "month": 1,
      "income": 5000.00,
      "expense": 3500.00,
      "net": 1500.00,
      "savingsRate": 30.0,
      "incomeGrowth": 0.0,
      "expenseGrowth": 0.0
    },
    {
      "year": 2024,
      "month": 2,
      "income": 5200.00,
      "expense": 3800.00,
      "net": 1400.00,
      "savingsRate": 26.9,
      "incomeGrowth": 4.0,
      "expenseGrowth": 8.6
    }
  ],
  "predictions": {
    "nextMonthIncome": 5500.00,
    "nextMonthExpense": 4000.00,
    "nextMonthNet": 1500.00
  }
}
```

### 8. 获取同比分析

**接口地址**: `GET /api/monthly-summaries/year-over-year/{year}/{month}`

**功能描述**: 获取指定月份的同比分析数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "currentYear": 2024,
  "previousYear": 2023,
  "month": 1,
  "currentData": {
    "totalIncome": 5000.00,
    "totalExpense": 3500.00,
    "netAmount": 1500.00,
    "recordCount": 45
  },
  "previousData": {
    "totalIncome": 4500.00,
    "totalExpense": 3200.00,
    "netAmount": 1300.00,
    "recordCount": 38
  },
  "comparison": {
    "incomeGrowthRate": 11.11,
    "expenseGrowthRate": 9.38,
    "netGrowthRate": 15.38,
    "recordGrowthRate": 18.42
  },
  "analysis": {
    "incomeStatus": "INCREASED",
    "expenseStatus": "INCREASED",
    "netStatus": "INCREASED",
    "overallPerformance": "IMPROVED"
  }
}
```

### 9. 获取环比分析

**接口地址**: `GET /api/monthly-summaries/month-over-month/{year}/{month}`

**功能描述**: 获取指定月份的环比分析数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "currentMonth": {
    "year": 2024,
    "month": 2
  },
  "previousMonth": {
    "year": 2024,
    "month": 1
  },
  "currentData": {
    "totalIncome": 5200.00,
    "totalExpense": 3800.00,
    "netAmount": 1400.00,
    "recordCount": 52
  },
  "previousData": {
    "totalIncome": 5000.00,
    "totalExpense": 3500.00,
    "netAmount": 1500.00,
    "recordCount": 45
  },
  "comparison": {
    "incomeGrowthRate": 4.0,
    "expenseGrowthRate": 8.57,
    "netGrowthRate": -6.67,
    "recordGrowthRate": 15.56
  },
  "analysis": {
    "incomeStatus": "INCREASED",
    "expenseStatus": "INCREASED",
    "netStatus": "DECREASED",
    "overallPerformance": "MIXED"
  }
}
```

### 10. 获取分类汇总

**接口地址**: `GET /api/monthly-summaries/category-summary/{year}/{month}`

**功能描述**: 获取指定年月的分类汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "year": 2024,
  "month": 1,
  "incomeCategories": [
    {
      "categoryId": 2,
      "categoryName": "工资",
      "amount": 4000.00,
      "recordCount": 1,
      "percentage": 80.0
    },
    {
      "categoryId": 3,
      "categoryName": "奖金",
      "amount": 1000.00,
      "recordCount": 1,
      "percentage": 20.0
    }
  ],
  "expenseCategories": [
    {
      "categoryId": 1,
      "categoryName": "餐饮",
      "amount": 1200.00,
      "recordCount": 25,
      "percentage": 34.29
    },
    {
      "categoryId": 4,
      "categoryName": "交通",
      "amount": 800.00,
      "recordCount": 15,
      "percentage": 22.86
    }
  ],
  "summary": {
    "totalIncomeCategories": 2,
    "totalExpenseCategories": 6,
    "topIncomeCategory": "工资",
    "topExpenseCategory": "餐饮"
  }
}
```

### 11. 删除月度汇总

**接口地址**: `DELETE /api/monthly-summaries/{year}/{month}`

**功能描述**: 删除指定年月的汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**:
```json
{
  "message": "月度汇总删除成功"
}
```

### 12. 重新计算汇总

**接口地址**: `PUT /api/monthly-summaries/recalculate/{year}/{month}`

**功能描述**: 重新计算指定年月的汇总数据

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| year | Integer | 年份 (如: 2024) |
| month | Integer | 月份 (1-12) |

**响应示例**: 同获取月度汇总接口

---

## 数据模型

### MonthlyFinancialSummary (月度财务汇总)

```json
{
  "id": "Long - 汇总ID",
  "userId": "Long - 用户ID",
  "year": "Integer - 年份",
  "month": "Integer - 月份",
  "totalIncome": "BigDecimal - 总收入",
  "totalExpense": "BigDecimal - 总支出",
  "netAmount": "BigDecimal - 净收入",
  "recordCount": "Long - 记录总数",
  "incomeCount": "Long - 收入记录数",
  "expenseCount": "Long - 支出记录数",
  "averageIncome": "BigDecimal - 平均收入",
  "averageExpense": "BigDecimal - 平均支出",
  "topIncomeCategory": "String - 最高收入分类",
  "topExpenseCategory": "String - 最高支出分类",
  "topIncomeCategoryAmount": "BigDecimal - 最高收入分类金额",
  "topExpenseCategoryAmount": "BigDecimal - 最高支出分类金额",
  "createdAt": "LocalDateTime - 创建时间",
  "updatedAt": "LocalDateTime - 更新时间"
}
```

### YearlyStatistics (年度统计)

```json
{
  "year": "Integer - 年份",
  "totalIncome": "BigDecimal - 年度总收入",
  "totalExpense": "BigDecimal - 年度总支出",
  "netAmount": "BigDecimal - 年度净收入",
  "totalRecords": "Long - 年度记录总数",
  "averageMonthlyIncome": "BigDecimal - 月均收入",
  "averageMonthlyExpense": "BigDecimal - 月均支出",
  "averageMonthlyNet": "BigDecimal - 月均净收入",
  "highestIncomeMonth": "MonthAmount - 最高收入月份",
  "highestExpenseMonth": "MonthAmount - 最高支出月份",
  "bestNetMonth": "MonthAmount - 最佳净收入月份",
  "monthlyTrend": "TrendData - 月度趋势"
}
```

### TrendAnalysis (趋势分析)

```json
{
  "analysisMonths": "Integer - 分析月数",
  "overallTrend": "TrendData - 整体趋势",
  "monthlyData": "List<MonthlyTrendData> - 月度数据",
  "predictions": "PredictionData - 预测数据"
}
```

---

## 枚举类型

### PerformanceStatus (表现状态)
- `IMPROVED`: 改善
- `DECLINED`: 下降
- `STABLE`: 稳定
- `MIXED`: 混合

### GrowthStatus (增长状态)
- `INCREASED`: 增长
- `DECREASED`: 下降
- `STABLE`: 稳定

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 汇总数据不存在 |
| 409 | 汇总数据已存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 获取月度汇总
```bash
GET /api/monthly-summaries/2024/1
Authorization: Bearer {token}
```

### 生成月度汇总
```bash
POST /api/monthly-summaries/generate/2024/1
Authorization: Bearer {token}
```

### 获取年度统计
```bash
GET /api/monthly-summaries/yearly-statistics/2024
Authorization: Bearer {token}
```

### 获取趋势分析
```bash
GET /api/monthly-summaries/trend-analysis?months=12
Authorization: Bearer {token}
```

### 获取同比分析
```bash
GET /api/monthly-summaries/year-over-year/2024/1
Authorization: Bearer {token}
```

---

## 注意事项

1. 所有接口都需要在请求头中携带有效的JWT Token
2. 月度汇总数据通常在每月初自动生成
3. 用户只能查看和操作自己的汇总数据
4. 汇总数据基于用户的财务记录实时计算
5. 趋势分析需要至少3个月的数据才能提供有意义的结果
6. 同比分析需要上一年同月的数据
7. 环比分析需要上一个月的数据
8. 重新计算汇总会覆盖现有数据
9. 删除汇总不会影响原始财务记录

---

*文档版本: v1.0*  
*最后更新: 2024-01-01*