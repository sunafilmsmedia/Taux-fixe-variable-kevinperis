import ResultView from "@/components/buyer/ResultView";

export default function ResultsPage({ params }: { params: { id: string } }) {
  return <ResultView leadId={params.id} />;
}
