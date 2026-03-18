import { useEffect, useState } from "react";
import type { Employee, EmployeeFormData } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const emptyForm: EmployeeFormData = {
  employeeCode: "",
  name: "",
  gender: "",
  phone: "",
  email: "",
  department: "",
  position: "",
  status: "active",
  hireDate: "",
  birthDate: "",
  education: "",
  idNumber: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  notes: ""
};

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchEmployees(keyword = "") {
    setLoading(true);
    setErrorMessage("");

    try {
      const url = keyword
        ? `${API_BASE_URL}/employees?q=${encodeURIComponent(keyword)}`
        : `${API_BASE_URL}/employees`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "获取人员列表失败");
      }

      setEmployees(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "获取人员列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function openCreateModal() {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setModalOpen(true);
    setErrorMessage("");
  }

  function openEditModal(employee: Employee) {
    setEditingEmployee(employee);
    setFormData({
      employeeCode: employee.employeeCode,
      name: employee.name,
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      status: employee.status,
      hireDate: employee.hireDate,
      birthDate: employee.birthDate,
      education: employee.education,
      idNumber: employee.idNumber,
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      notes: employee.notes
    });
    setModalOpen(true);
    setErrorMessage("");
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
  }

  function updateField<K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const isEditing = Boolean(editingEmployee);
      const response = await fetch(
        isEditing ? `${API_BASE_URL}/employees/${editingEmployee!.id}` : `${API_BASE_URL}/employees`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "保存失败");
      }

      await fetchEmployees(query);
      closeModal();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(`确认删除 ${employee.name}（${employee.employeeCode}）吗？`);
    if (!confirmed) return;

    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employee.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "删除失败");
      }

      await fetchEmployees(query);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除失败");
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchEmployees(query);
  }

  return (
    <div className="page-shell">
      <div className="bg-orb orb-left" />
      <div className="bg-orb orb-right" />

      <main className="page">
        <section className="hero-card">
          <div>
            <p className="eyebrow">HR Workspace</p>
            <h1>人事管理花名册</h1>
            <p className="hero-copy">
              管理人员档案、维护组织基础数据，并为入转调离流程提供统一入口。
            </p>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span>当前人数</span>
              <strong>{employees.length}</strong>
            </div>
            <div className="metric-card">
              <span>模块能力</span>
              <strong>增删改查</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>员工档案列表</h2>
              <p>支持按姓名、工号、部门搜索。</p>
            </div>
            <button className="primary-btn" onClick={openCreateModal}>
              新增人员
            </button>
          </div>

          <form className="toolbar" onSubmit={handleSearchSubmit}>
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="请输入姓名 / 工号 / 部门"
            />
            <button className="secondary-btn" type="submit">
              搜索
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setQuery("");
                fetchEmployees("");
              }}
            >
              重置
            </button>
          </form>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>工号</th>
                  <th>姓名</th>
                  <th>部门</th>
                  <th>岗位</th>
                  <th>手机号</th>
                  <th>邮箱</th>
                  <th>入职日期</th>
                  <th>状态</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="empty-cell">
                      正在加载人员数据...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="empty-cell">
                      暂无人员数据
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.employeeCode}</td>
                      <td>{employee.name}</td>
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.email || "-"}</td>
                      <td>{employee.hireDate}</td>
                      <td>
                        <span className={employee.status === "active" ? "status-active" : "status-inactive"}>
                          {employee.status === "active" ? "在职" : "离职"}
                        </span>
                      </td>
                      <td>{formatDateTime(employee.updatedAt)}</td>
                      <td>
                        <div className="actions">
                          <button className="link-btn" onClick={() => openEditModal(employee)}>
                            编辑
                          </button>
                          <button className="link-btn danger-text" onClick={() => handleDelete(employee)}>
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modalOpen ? (
        <div className="modal-mask" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingEmployee ? "编辑人员" : "新增人员"}</h3>
                <p>维护员工基础档案信息。</p>
              </div>
              <button className="ghost-btn" onClick={closeModal}>
                关闭
              </button>
            </div>

            <form className="employee-form" onSubmit={handleSubmit}>
              <label>
                <span>工号</span>
                <input
                  required
                  value={formData.employeeCode}
                  onChange={(event) => updateField("employeeCode", event.target.value)}
                />
              </label>
              <label>
                <span>姓名</span>
                <input required value={formData.name} onChange={(event) => updateField("name", event.target.value)} />
              </label>
              <label>
                <span>性别</span>
                <select value={formData.gender} onChange={(event) => updateField("gender", event.target.value)}>
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </label>
              <label>
                <span>手机号</span>
                <input
                  required
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </label>
              <label>
                <span>邮箱</span>
                <input value={formData.email} onChange={(event) => updateField("email", event.target.value)} />
              </label>
              <label>
                <span>部门</span>
                <input
                  required
                  value={formData.department}
                  onChange={(event) => updateField("department", event.target.value)}
                />
              </label>
              <label>
                <span>岗位</span>
                <input
                  required
                  value={formData.position}
                  onChange={(event) => updateField("position", event.target.value)}
                />
              </label>
              <label>
                <span>入职日期</span>
                <input
                  required
                  type="date"
                  value={formData.hireDate}
                  onChange={(event) => updateField("hireDate", event.target.value)}
                />
              </label>
              <label>
                <span>状态</span>
                <select value={formData.status} onChange={(event) => updateField("status", event.target.value as Employee["status"])}>
                  <option value="active">在职</option>
                  <option value="inactive">离职</option>
                </select>
              </label>
              <label>
                <span>出生日期</span>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(event) => updateField("birthDate", event.target.value)}
                />
              </label>
              <label>
                <span>学历</span>
                <input value={formData.education} onChange={(event) => updateField("education", event.target.value)} />
              </label>
              <label>
                <span>身份证号</span>
                <input value={formData.idNumber} onChange={(event) => updateField("idNumber", event.target.value)} />
              </label>
              <label className="full">
                <span>家庭住址</span>
                <input value={formData.address} onChange={(event) => updateField("address", event.target.value)} />
              </label>
              <label>
                <span>紧急联系人</span>
                <input
                  value={formData.emergencyContact}
                  onChange={(event) => updateField("emergencyContact", event.target.value)}
                />
              </label>
              <label>
                <span>紧急联系人电话</span>
                <input
                  value={formData.emergencyPhone}
                  onChange={(event) => updateField("emergencyPhone", event.target.value)}
                />
              </label>
              <label className="full">
                <span>备注</span>
                <textarea value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} />
              </label>

              <div className="form-actions">
                <button className="ghost-btn" type="button" onClick={closeModal}>
                  取消
                </button>
                <button className="primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : editingEmployee ? "保存修改" : "确认新增"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
