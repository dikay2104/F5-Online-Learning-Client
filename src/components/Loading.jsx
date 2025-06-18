import { Spin } from 'antd';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <Spin size="large" />
    </div>
  );
}
