import type { Metadata } from "next";
import { SectionEditor } from "@/admin/screens/SectionEditor";

export const metadata: Metadata = { title: "Settings · Admin" };

export default function SettingsPage() {
  return <SectionEditor id="site" />;
}
