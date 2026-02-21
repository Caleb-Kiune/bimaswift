interface CompaniesParams {
  params: Promise<{ companies: string[] }>;
}

export default async function CompaniesPage({ params }: CompaniesParams) {
  const { companies } = await params;

  return <h1>Companies compared are {companies.join(",")}</h1>;
}
