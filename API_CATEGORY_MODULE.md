# 分类管理模块 API 文档

## 概述

分类管理模块提供记账分类的完整管理功能，包括收入分类和支出分类的创建、更新、删除、查询和统计等操作。

### 基础信息

- **Base URL**: `/api/categories`
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

### 1. 创建分类

**接口地址**: `POST /api/categories`

**功能描述**: 创建新的收入或支出分类

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
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | String | 是 | 分类名称，最大50字符 |
| type | String | 是 | 分类类型：INCOME(收入)/EXPENSE(支出) |
| description | String | 否 | 描述，最大200字符 |
| iconName | String | 否 | 图标名称，最大50字符 |
| colorCode | String | 否 | 颜色代码，最大7字符 |

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

### 2. 更新分类

**接口地址**: `PUT /api/categories/{categoryId}`

**功能描述**: 更新指定分类的信息

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| categoryId | Long | 分类ID |

**请求参数**: 同创建分类接口

**响应示例**: 同创建分类接口

### 3. 删除分类

**接口地址**: `DELETE /api/categories/{categoryId}`

**功能描述**: 删除指定分类（软删除）

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| categoryId | Long | 分类ID |

**响应示例**:
```json
{
  "message": "分类删除成功"
}
```

### 4. 获取用户所有分类

**接口地址**: `GET /api/categories`

**功能描述**: 获取当前用户的所有有效分类

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "餐饮",
    "type": "EXPENSE",
    "description": "日常餐饮支出",
    "iconName": "restaurant",
    "colorCode": "#FF5722",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  },
  {
    "id": 2,
    "name": "工资",
    "type": "INCOME",
    "description": "月度工资收入",
    "iconName": "salary",
    "colorCode": "#4CAF50",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
]
```

### 5. 根据类型获取分类

**接口地址**: `GET /api/categories/type/{type}`

**功能描述**: 根据分类类型获取分类列表

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| type | String | 分类类型：INCOME/EXPENSE |

**响应示例**: 同获取所有分类接口，但只返回指定类型的分类

### 6. 获取收入分类

**接口地址**: `GET /api/categories/income`

**功能描述**: 获取所有收入分类

**响应示例**:
```json
[
  {
    "id": 2,
    "name": "工资",
    "type": "INCOME",
    "description": "月度工资收入",
    "iconName": "salary",
    "colorCode": "#4CAF50",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  },
  {
    "id": 3,
    "name": "奖金",
    "type": "INCOME",
    "description": "年终奖金等",
    "iconName": "bonus",
    "colorCode": "#2196F3",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
]
```

### 7. 获取支出分类

**接口地址**: `GET /api/categories/expense`

**功能描述**: 获取所有支出分类

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "餐饮",
    "type": "EXPENSE",
    "description": "日常餐饮支出",
    "iconName": "restaurant",
    "colorCode": "#FF5722",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  },
  {
    "id": 4,
    "name": "交通",
    "type": "EXPENSE",
    "description": "交通出行费用",
    "iconName": "transport",
    "colorCode": "#FF9800",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  }
]
```

### 8. 获取分类详情

**接口地址**: `GET /api/categories/{categoryId}`

**功能描述**: 获取指定分类的详细信息

**路径参数**:
| 参数名 | 类型 | 说明 |
|--------|------|------|
| categoryId | Long | 分类ID |

**响应示例**:
```json
{
  "id": 1,
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

### 9. 统计分类数量

**接口地址**: `GET /api/categories/count`

**功能描述**: 统计用户的分类数量信息

**响应示例**:
```json
{
  "total": 10,
  "income": 4,
  "expense": 6
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | Long | 总分类数量 |
| income | Long | 收入分类数量 |
| expense | Long | 支出分类数量 |

### 10. 初始化默认分类

**接口地址**: `POST /api/categories/initialize`

**功能描述**: 为新用户初始化默认的收入和支出分类

**响应示例**:
```json
{
  "message": "默认分类初始化成功"
}
```

**默认分类说明**:
- **收入分类**: 工资、奖金、投资收益、其他收入
- **支出分类**: 餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出

---

## 数据模型

### Category (分类)

```json
{
  "id": "Long - 分类ID",
  "userId": "Long - 用户ID",
  "name": "String - 分类名称",
  "type": "CategoryType - 分类类型",
  "description": "String - 描述",
  "iconName": "String - 图标名称",
  "colorCode": "String - 颜色代码",
  "isActive": "Boolean - 是否激活",
  "createdAt": "LocalDateTime - 创建时间",
  "updatedAt": "LocalDateTime - 更新时间"
}
```

### CategoryRequest (分类请求)

```json
{
  "name": "String - 分类名称 (必填，最大50字符)",
  "type": "CategoryType - 分类类型 (必填)",
  "description": "String - 描述 (可选，最大200字符)",
  "iconName": "String - 图标名称 (可选，最大50字符)",
  "colorCode": "String - 颜色代码 (可选，最大7字符)"
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
| 404 | 分类不存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 创建支出分类
```bash
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "餐饮",
  "type": "EXPENSE",
  "description": "日常餐饮支出",
  "iconName": "restaurant",
  "colorCode": "#FF5722"
}
```

### 获取所有支出分类
```bash
GET /api/categories/expense
Authorization: Bearer {token}
```

### 更新分类信息
```bash
PUT /api/categories/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "餐饮美食",
  "type": "EXPENSE",
  "description": "日常餐饮和美食支出",
  "iconName": "restaurant",
  "colorCode": "#FF5722"
}
```

---

## 注意事项

1. 所有接口都需要在请求头中携带有效的JWT Token
2. 分类名称在同一用户下不能重复
3. 删除分类为软删除，不会影响已有的财务记录
4. 用户只能操作自己创建的分类
5. 分类类型创建后不能修改
6. 颜色代码建议使用十六进制格式，如：#FF5722
7. 图标名称建议使用统一的图标库命名规范

---

*文档版本: v1.0*  
*最后更新: 2024-01-01*