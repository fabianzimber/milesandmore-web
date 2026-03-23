import LoadingPlane from "@/components/ui/LoadingPlane";

export default function Loading() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <LoadingPlane text="Miles & More lädt" />
    </div>
  );
}
