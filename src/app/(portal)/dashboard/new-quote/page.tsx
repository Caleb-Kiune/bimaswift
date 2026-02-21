export default async function NewQuote() {

  await new Promise((resolve) => setTimeout(resolve, 2000))
  
  return <h1>Calculate New Quote</h1>;
}