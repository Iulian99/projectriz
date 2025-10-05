import React from "react";
import DailyReportClient from "./DailyReportClient";

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
}

// This is a server component that receives the params and passes them to the client component
export default async function DailyReportPage({ params }: PageProps) {
  const { year, month, day } = await params;

  // In a server component, we can directly use the params without dynamic imports
  return <DailyReportClient year={year} month={month} day={day} />;
}
