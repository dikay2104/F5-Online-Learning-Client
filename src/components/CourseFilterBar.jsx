import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * props:
 * - search: string
 * - status: string
 * - sort: string
 * - onSearchChange, onStatusChange, onSortChange
 * - showStatusFilter: boolean
 * - statusOptions: [{ value: string, label: string }]
 */
export default function CourseFilterBar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
  showStatusFilter = false,
  statusOptions = [],
  showSort = true,
}) {
  return (
    <Space style={{ marginBottom: 24 }} wrap>
      <Input
        placeholder="Tìm kiếm khóa học"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
      />

      {showStatusFilter && (
        <Select
          placeholder="Trạng thái"
          value={status}
          onChange={onStatusChange}
          style={{ width: 160 }}
          allowClear
        >
          {statusOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      )}

      {showSort && (
        <Select
          placeholder="Sắp xếp"
          value={sort}
          onChange={onSortChange}
          style={{ width: 160 }}
        >
          <Option value="-createdAt">Mới nhất</Option>
          <Option value="createdAt">Cũ nhất</Option>
        </Select>
      )}
    </Space>
  );
}


// Dùng cho student course page
// <CourseFilterBar
//   search={search}
//   sort={sort}
//   onSearchChange={(val) => {
//     setPage(1);
//     setSearch(val);
//   }}
//   onSortChange={(val) => {
//     setPage(1);
//     setSort(val);
//   }}
//   showStatusFilter={false} //student không cần filter theo status
// />
