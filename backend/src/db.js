import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "data", "employees.db");

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    gender TEXT DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    hire_date TEXT NOT NULL,
    birth_date TEXT DEFAULT '',
    education TEXT DEFAULT '',
    id_number TEXT DEFAULT '',
    address TEXT DEFAULT '',
    emergency_contact TEXT DEFAULT '',
    emergency_phone TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
  CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
  CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
`);

const seedCount = db.prepare("SELECT COUNT(*) AS count FROM employees").get().count;

if (seedCount === 0) {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO employees (
      employee_code, name, gender, phone, email, department, position, status,
      hire_date, birth_date, education, id_number, address, emergency_contact,
      emergency_phone, notes, created_at, updated_at
    ) VALUES (
      @employeeCode, @name, @gender, @phone, @email, @department, @position, @status,
      @hireDate, @birthDate, @education, @idNumber, @address, @emergencyContact,
      @emergencyPhone, @notes, @createdAt, @updatedAt
    )
  `);

  insert.run({
    employeeCode: "HR2026001",
    name: "李晨",
    gender: "男",
    phone: "13800000001",
    email: "lichen@example.com",
    department: "人力资源部",
    position: "HRBP",
    status: "active",
    hireDate: "2024-08-01",
    birthDate: "1993-05-12",
    education: "本科",
    idNumber: "",
    address: "上海市浦东新区",
    emergencyContact: "李梅",
    emergencyPhone: "13900000001",
    notes: "首批示例数据",
    createdAt: now,
    updatedAt: now
  });

  insert.run({
    employeeCode: "PRD2026002",
    name: "王璐",
    gender: "女",
    phone: "13800000002",
    email: "wanglu@example.com",
    department: "产品部",
    position: "高级产品经理",
    status: "active",
    hireDate: "2025-02-10",
    birthDate: "1995-09-21",
    education: "硕士",
    idNumber: "",
    address: "上海市徐汇区",
    emergencyContact: "王军",
    emergencyPhone: "13900000002",
    notes: "负责组织管理系统",
    createdAt: now,
    updatedAt: now
  });
}

