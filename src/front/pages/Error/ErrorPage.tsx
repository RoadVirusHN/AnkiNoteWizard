import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

const normalizeError = (error: unknown): {status:string, data:any} => {
  if (isRouteErrorResponse(error)) {
    return {status: error.statusText, data: error.data};
  } else if (error instanceof Error){
    return {status: error.message, data: {name: error.name, stack: error.stack, message: error.message}};
  }
  return {status: "Unknown Error", data: {error}};
};


const ErrorPage = () => {
  let error = normalizeError(useRouteError());
  const navigate = useNavigate();
  return <div>
    ERROR PAGE!!!
    <p>Status: {error.status}</p>
    <pre>{JSON.stringify(error.data, null, 2)}</pre>
    <button onClick={()=>navigate('/')}>Go Home</button>
    <button onClick={()=>navigate(-1)}>Go Back</button>
  </div>

};
export default ErrorPage;