import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";


const ERROR_MESSAGES: Record<string, string> = {
  "Not Found": "The requested resource was not found. Please check the URL or try again later.",
  "Internal Server Error": "An unexpected error occurred on the server. Please try again later.",
  "Unauthorized": "You are not authorized to access this resource. Please log in and try again.",
  "Forbidden": "You do not have permission to access this resource. Please contact support if you believe this is an error.",
  // Add more status codes and messages as needed
};
const ERROR_NAME_TO_ERROR_CODE: Record<string, string> = {
  "Bad Request": "400",
  "Unauthorized": "401",
  "Forbidden": "403",
  "Not Found": "404",
  "Request Timeout": "408",
  "Internal Server Error": "500"
};


const normalizeError = (error: unknown): {status:string, data:any} => {
  if (isRouteErrorResponse(error)) {
    return {status: error.statusText, data: error.data};
  } else if (error instanceof Error){
    return {status: error.message, data: {name: error.name, stack: error.stack, message: error.message}};
  }
  return {status: "Unknown Error", data: {name: "Unknown", error}};
};

// TODO
// Error title : status + message
// Error detailed description
// solution or suggestion (if any)
// brand identity (logo, color, etc) for user reassurance
// Go Home button
// Go Back button
// Maybe a button to report the error (copy error detail to clipboard and open github issue page)

const ErrorPage = () => {
  let error = normalizeError(useRouteError());
  const navigate = useNavigate();
  return <div>
    ERROR PAGE!!!
    <p>{error.status} {error.data.name}</p>
    <pre>{JSON.stringify(error.data, null, 2)}</pre>
    <button onClick={()=>navigate('/')}>Go Home</button>
    <button onClick={()=>navigate(-1)}>Go Back</button>
  </div>

};
export default ErrorPage;