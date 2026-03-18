import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
const port = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((item) => item.trim()) }));
app.use(express.json());

function ok(data = null, message = "ok") {
  return { success: true, message, data };
}

function fail(message, status = 400) {
  return { success: false, message, status };
}

function mapEmployee(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    name: row.name,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    department: row.department,
    position: row.position,
    status: row.status,
    hireDate: row.hire_date,
    birthDate: row.birth_date,
    education: row.education,
    idNumber: row.id_number,
    address: row.address,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateEmployee(payload) {
  const requiredFields = [
    ["employeeCode", "工号不能为空"],
    ["name", "姓名不能为空"],
    ["phone", "手机号不能为空"],
    ["department", "部门不能为空"],
    ["position", "岗位不能为空"],
    ["hireDate", "入职日期不能为空"]
  ];

  for (const [field, message] of requiredFields) {
    if (!String(payload[field] ?? "").trim()) {
      return message;
    }
  }

  const phonePattern = /^1[3-9]\d{9}$/;
  if (!phonePattern.test(String(payload.phone))) {
    return "手机号格式不正确";
  }

  if (payload.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(payload.email))) {
      return "邮箱格式不正确";
    }
  }

  if (payload.status && !["active", "inactive"].includes(payload.status)) {
    return "状态值不合法";
  }

  return null;
}

function sanitizePayload(payload) {
  return {
    employeeCode: String(payload.employeeCode ?? "").trim(),
    name: String(payload.name ?? "").trim(),
    gender: String(payload.gender ?? "").trim(),
    phone: String(payload.phone ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    department: String(payload.department ?? "").trim(),
    position: String(payload.position ?? "").trim(),
    status: String(payload.status ?? "active").trim() || "active",
    hireDate: String(payload.hireDate ?? "").trim(),
    birthDate: String(payload.birthDate ?? "").trim(),
    education: String(payload.education ?? "").trim(),
    idNumber: String(payload.idNumber ?? "").trim(),
    address: String(payload.address ?? "").trim(),
    emergencyContact: String(payload.emergencyContact ?? "").trim(),
    emergencyPhone: String(payload.emergencyPhone ?? "").trim(),
    notes: String(payload.notes ?? "").trim()
  };
}

app.get("/api/health", (_req, res) => {
  res.json(ok({ serverTime: new Date().toISOString() }));
});

app.get("/api/employees", (req, res) => {
  const q = String(req.query.q ?? "").trim();

  let rows;
  if (q) {
    const keyword = `%${q}%`;
    rows = db
      .prepare(`
        SELECT *
        FROM employees
        WHERE name LIKE ?
           OR employee_code LIKE ?
           OR department LIKE ?
        ORDER BY updated_at DESC
      `)
      .all(keyword, keyword, keyword);
  } else {
    rows = db.prepare("SELECT * FROM employees ORDER BY updated_at DESC").all();
  }

  res.json(ok(rows.map(mapEmployee)));
});

app.post("/api/employees", (req, res) => {
  const payload = sanitizePayload(req.body);
  const error = validateEmployee(payload);

  if (error) {
    return res.status(400).json(fail(error));
  }

  const existed = db
    .prepare("SELECT id FROM employees WHERE employee_code = ?")
    .get(payload.employeeCode);

  if (existed) {
    return res.status(409).json(fail("工号已存在", 409));
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(`
      INSERT INTO employees (
        employee_code, name, gender, phone, email, department, position, status,
        hire_date, birth_date, education, id_number, address, emergency_contact,
        emergency_phone, notes, created_at, updated_at
      ) VALUES (
        @employeeCode, @name, @gender, @phone, @email, @department, @position, @status,
        @hireDate, @birthDate, @education, @idNumber, @address, @emergencyContact,
        @emergencyPhone, @notes, @createdAt, @updatedAt
      )
    `)
    .run({
      ...payload,
      createdAt: now,
      updatedAt: now
    });

  const created = db.prepare("SELECT * FROM employees WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json(ok(mapEmployee(created), "创建成功"));
});

app.put("/api/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const payload = sanitizePayload(req.body);
  const error = validateEmployee(payload);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json(fail("无效的员工 ID"));
  }

  if (error) {
    return res.status(400).json(fail(error));
  }

  const current = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  if (!current) {
    return res.status(404).json(fail("员工不存在", 404));
  }

  const duplicate = db
    .prepare("SELECT id FROM employees WHERE employee_code = ? AND id != ?")
    .get(payload.employeeCode, id);
  if (duplicate) {
    return res.status(409).json(fail("工号已存在", 409));
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE employees
    SET employee_code = @employeeCode,
        name = @name,
        gender = @gender,
        phone = @phone,
        email = @email,
        department = @department,
        position = @position,
        status = @status,
        hire_date = @hireDate,
        birth_date = @birthDate,
        education = @education,
        id_number = @idNumber,
        address = @address,
        emergency_contact = @emergencyContact,
        emergency_phone = @emergencyPhone,
        notes = @notes,
        updated_at = @updatedAt
    WHERE id = @id
  `).run({
    ...payload,
    id,
    updatedAt: now
  });

  const updated = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  return res.json(ok(mapEmployee(updated), "更新成功"));
});

app.delete("/api/employees/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json(fail("无效的员工 ID"));
  }

  const current = db.prepare("SELECT id FROM employees WHERE id = ?").get(id);
  if (!current) {
    return res.status(404).json(fail("员工不存在", 404));
  }

  db.prepare("DELETE FROM employees WHERE id = ?").run(id);
  return res.json(ok({ id }, "删除成功"));
});

app.listen(port, () => {
  console.log(`Employee roster backend listening on http://localhost:${port}`);
});
