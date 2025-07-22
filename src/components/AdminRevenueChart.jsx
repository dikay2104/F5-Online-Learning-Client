import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getMonthlyRevenue } from "../services/adminService";

const AdminRevenueChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await getMonthlyRevenue(token);
        setData(res.data);
      } catch {
        setData([]);
      }
    };
    fetchRevenue();
  }, []);

  const options = {
    chart: { type: "bar" },
    xaxis: { categories: data.map(item => item.month) },
    title: { text: "Doanh thu theo tháng" }
  };
  const series = [
    { name: "Doanh thu", data: data.map(item => item.revenue) }
  ];

  return (
    <div style={{ marginTop: 32 }}>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default AdminRevenueChart; 