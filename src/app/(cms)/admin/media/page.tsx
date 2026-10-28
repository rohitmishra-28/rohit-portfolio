import type { Metadata } from "next";
import { Media } from "@/admin/screens/Media";

export const metadata: Metadata = { title: "Media · Admin" };

export default function MediaPage() {
  return <Media />;
}
