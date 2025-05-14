export default async function Video({ params }) {
  const { id } = await params;
  return (
    <div>
      <h2>Video ID: {id}</h2>
      <p>Video page content goes here.</p>
    </div>
  );
}
