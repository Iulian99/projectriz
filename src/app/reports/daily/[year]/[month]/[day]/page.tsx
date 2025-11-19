import React from "react";
import DailyReportClient from "./DailyReportClient";

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
}

// Server component that receives the params and passes them to the client component
export default async function DailyReportPage({ params }: PageProps) {
  const { year, month, day } = await params;
  return <DailyReportClient year={year} month={month} day={day} />;
}
