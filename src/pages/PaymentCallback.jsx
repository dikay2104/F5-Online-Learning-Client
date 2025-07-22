import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get("vnp_ResponseCode");
    const orderId = params.get("vnp_TxnRef");
    if (responseCode === "00" && orderId) {
      axios.post(
        process.env.REACT_APP_API_BASE_URL + "/enrollments/confirm",
        { orderId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(() => {
        message.success("Thanh toán thành công!");
        navigate("/student/home");
      }).catch(() => {
        message.error("Có lỗi khi xác nhận tham gia khóa học!");
        navigate("/student/home");
      });
    } else {
      message.error("Thanh toán thất bại!");
      navigate("/student/home");
    }
  }, [location, navigate]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Đang xử lý kết quả thanh toán...</h2>
    </div>
  );
} 