interface fetAnkiRequestBody {
  action: string;
  params?: Record<string, unknown>;
}
// TODO : change the type of result to a generic type T
interface fetchAnkiResponseBody<T = unknown> {
  result: T;
  error: string | null;
}
const fetchAnki = async <T>(request: fetAnkiRequestBody): Promise<fetchAnkiResponseBody<T>> => {
  const res = await fetch('http://127.0.0.1:8765', {
    method: 'POST',
    body: JSON.stringify({ ...request, version: 5 }),
  }).catch((err) => {
    throw err;
  });
  return res.json();
}
export default fetchAnki;
