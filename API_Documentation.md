# 游泳记录追踪系统 API 文档

## 项目概述

游泳记录追踪系统是一个基于Spring Boot的后端服务，提供用户认证、游泳记录管理和统计报告功能。

### 技术栈
- **框架**: Spring Boot 3.5.6
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Token)
- **安全**: Spring Security
- **ORM**: Spring Data JPA
- **构建工具**: Maven

### 基础信息
- **Base URL**: `http://localhost:8080`
- **API 前缀**: `/api`
- **认证方式**: Bearer Token (JWT)

---

## 认证相关 API

### 1. 用户注册
**POST** `/api/auth/register`

注册新用户账户。

#### 请求体
```json
{
  "username": "string",     // 用户名，3-50字符，必填
  "password": "string",     // 密码，至少6字符，必填
  "email": "string"         // 邮箱地址，必填
}
```

#### 响应
**成功 (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "message": "注册成功"
}
```

**失败 (400)**
```json
"用户名已存在" // 或其他错误信息
```

#### 示例
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "swimmer123",
    "password": "password123",
    "email": "swimmer@example.com"
  }'
```

---

### 2. 用户登录
**POST** `/api/auth/login`

用户登录获取访问令牌。

#### 请求体
```json
{
  "username": "string",     // 用户名，必填
  "password": "string"      // 密码，必填
}
```

#### 响应
**成功 (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "message": "登录成功"
}
```

**失败 (400)**
```json
"用户名或密码错误"
```

#### 示例
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "swimmer123",
    "password": "password123"
  }'
```

---

### 3. Token 验证
**POST** `/api/auth/validate`

验证JWT令牌的有效性。

#### 请求头
```
Authorization: Bearer <token>
```

#### 响应
**成功 (200)**
```json
"Token有效，用户: swimmer123"
```

**失败 (400)**
```json
"Token无效" // 或 "Token验证失败"
```

#### 示例
```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 游泳记录管理 API

> **注意**: 以下所有API都需要在请求头中包含有效的JWT令牌

### 4. 游泳打卡
**POST** `/api/swimming/punch-in`

记录一次游泳活动。

#### 请求头
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### 请求体
```json
{
  "rounds": 20,              // 游泳圈数，必须大于0
  "roundLengthMeters": 50.0  // 每圈长度（米），必须大于0
}
```

#### 响应
**成功 (200)**
```json
{
  "id": 1,
  "recordDate": "2024-01-15",
  "rounds": 20,
  "roundLengthMeters": 50.0,
  "distanceMeters": 1000.0,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**失败 (400)**
```json
"打卡失败: 错误信息"
```

#### 示例
```bash
curl -X POST http://localhost:8080/api/swimming/punch-in \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rounds": 20,
    "roundLengthMeters": 50.0
  }'
```

---

### 5. 获取所有游泳记录
**GET** `/api/swimming/records`

获取当前用户的所有游泳记录。

#### 请求头
```
Authorization: Bearer <token>
```

#### 响应
**成功 (200)**
```json
[
  {
    "id": 1,
    "recordDate": "2024-01-15",
    "rounds": 20,
    "roundLengthMeters": 50.0,
    "distanceMeters": 1000.0,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "recordDate": "2024-01-14",
    "rounds": 15,
    "roundLengthMeters": 50.0,
    "distanceMeters": 750.0,
    "createdAt": "2024-01-14T09:15:00",
    "updatedAt": "2024-01-14T09:15:00"
  }
]
```

#### 示例
```bash
curl -X GET http://localhost:8080/api/swimming/records \
  -H "Authorization: Bearer <token>"
```

---

### 6. 按日期范围获取记录
**GET** `/api/swimming/records/range`

获取指定日期范围内的游泳记录。

#### 请求头
```
Authorization: Bearer <token>
```

#### 查询参数
- `startDate`: 开始日期 (格式: YYYY-MM-DD)
- `endDate`: 结束日期 (格式: YYYY-MM-DD)

#### 响应
**成功 (200)**
```json
[
  {
    "id": 1,
    "recordDate": "2024-01-15",
    "rounds": 20,
    "roundLengthMeters": 50.0,
    "distanceMeters": 1000.0,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

#### 示例
```bash
curl -X GET "http://localhost:8080/api/swimming/records/range?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

---

### 7. 获取今日记录
**GET** `/api/swimming/records/today`

获取当前用户今天的游泳记录。

#### 请求头
```
Authorization: Bearer <token>
```

#### 响应
**成功 (200) - 有记录**
```json
{
  "id": 1,
  "recordDate": "2024-01-15",
  "rounds": 20,
  "roundLengthMeters": 50.0,
  "distanceMeters": 1000.0,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**成功 (200) - 无记录**
```json
"今天还没有游泳记录"
```

#### 示例
```bash
curl -X GET http://localhost:8080/api/swimming/records/today \
  -H "Authorization: Bearer <token>"
```

---

## 统计报告 API

### 8. 获取月度统计
**GET** `/api/reports/monthly`

获取当前用户的月度游泳统计数据。

#### 请求头
```
Authorization: Bearer <token>
```

#### 响应
**成功 (200)**
```json
[
  {
    "year": 2024,
    "month": 1,
    "totalRecords": 15,
    "totalDistance": 12500,
    "averageDistance": 833.33
  },
  {
    "year": 2023,
    "month": 12,
    "totalRecords": 20,
    "totalDistance": 18000,
    "averageDistance": 900.0
  }
]
```

#### 字段说明
- `year`: 年份
- `month`: 月份 (1-12)
- `totalRecords`: 该月总记录数
- `totalDistance`: 该月总游泳距离（米）
- `averageDistance`: 该月平均每次游泳距离（米）

#### 示例
```bash
curl -X GET http://localhost:8080/api/reports/monthly \
  -H "Authorization: Bearer <token>"
```

---

### 9. 获取周度统计
**GET** `/api/reports/weekly`

获取当前用户的周度游泳统计数据。

#### 请求头
```
Authorization: Bearer <token>
```

#### 响应
**成功 (200)**
```json
[
  {
    "year": 2024,
    "week": 3,
    "totalRecords": 4,
    "totalDistance": 3200,
    "averageDistance": 800.0
  },
  {
    "year": 2024,
    "week": 2,
    "totalRecords": 5,
    "totalDistance": 4500,
    "averageDistance": 900.0
  }
]
```

#### 字段说明
- `year`: 年份
- `week`: 周数 (1-53)
- `totalRecords`: 该周总记录数
- `totalDistance`: 该周总游泳距离（米）
- `averageDistance`: 该周平均每次游泳距离（米）

#### 示例
```bash
curl -X GET http://localhost:8080/api/reports/weekly \
  -H "Authorization: Bearer <token>"
```

---

## 系统健康检查 API

### 10. 健康检查
**GET** `/api/health`

检查系统运行状态。

#### 响应
**成功 (200)**
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00",
  "service": "swim-tracker-backend",
  "version": "1.0.0"
}
```

#### 示例
```bash
curl -X GET http://localhost:8080/api/health
```

---

## 数据模型

### User (用户)
```json
{
  "id": "Long",                    // 用户ID
  "username": "String",            // 用户名 (3-50字符)
  "password": "String",            // 密码 (加密存储)
  "email": "String",               // 邮箱地址
  "createdAt": "LocalDateTime",    // 创建时间
  "updatedAt": "LocalDateTime"     // 更新时间
}
```

### SwimmingRecord (游泳记录)
```json
{
  "id": "Long",                    // 记录ID
  "recordDate": "LocalDate",       // 记录日期
  "rounds": "Integer",             // 游泳圈数
  "roundLengthMeters": "Double",   // 每圈长度（米）
  "distanceMeters": "Double",      // 总距离（米，自动计算）
  "createdAt": "LocalDateTime",    // 创建时间
  "updatedAt": "LocalDateTime"     // 更新时间
}
```

---

## 错误处理

### 常见HTTP状态码
- **200 OK**: 请求成功
- **400 Bad Request**: 请求参数错误或验证失败
- **401 Unauthorized**: 未认证或Token无效
- **403 Forbidden**: 权限不足
- **404 Not Found**: 资源不存在
- **500 Internal Server Error**: 服务器内部错误

### 错误响应格式
```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 认证说明

### JWT Token 使用
1. 通过登录或注册接口获取Token
2. 在后续请求的Header中添加: `Authorization: Bearer <token>`
3. Token有过期时间，过期后需要重新登录获取新Token

### 安全注意事项
- 所有密码都经过加密存储
- JWT Token包含用户信息，请妥善保管
- 建议在HTTPS环境下使用
- Token应该存储在安全的地方（如HttpOnly Cookie）

---

## 开发环境配置

### 数据库配置
项目使用PostgreSQL数据库，配置信息在 `application.yml` 中：
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/swim_tracker
    username: your_username
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### 启动项目
```bash
# 使用Maven启动
./mvnw spring-boot:run

# 或者先编译再运行
./mvnw clean package
java -jar target/swim-tracker-backend-0.0.1-SNAPSHOT.jar
```

---

## 联系信息

如有问题或建议，请联系开发团队。

**项目版本**: 1.0.0  
**最后更新**: 2024-01-15