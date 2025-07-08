import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { message } from "antd";

export default function PaymentCallback() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get("vnp_ResponseCode");
    if (responseCode === "00") {
      message.success("Thanh toán thành công!");
    } else {
      message.error("Thanh toán thất bại!");
    }
  }, [location]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Kết quả thanh toán</h2>
      {/* Có thể hiển thị thêm thông tin chi tiết ở đây */}
    </div>
  );
} 