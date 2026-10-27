import { notFound } from "next/navigation";
import { DemoProvider } from "@/components/workspace-context";
import { Workspace } from "@/components/workspace";
import { supportedRoots } from "@/lib/routes";
export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const parts = slug ?? ["dashboard"];
  if (!supportedRoots.includes(parts[0]) || parts.length > 3) notFound();
  return (
    <DemoProvider>
      <Workspace path={`/${parts.join("/")}`} />
    </DemoProvider>
  );
}
