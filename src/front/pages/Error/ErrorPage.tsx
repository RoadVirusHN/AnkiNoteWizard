import useLocale from "@/front/utils/useLocale";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";


const ERROR_MESSAGES: Record<string, string> = {
  "Not Found": "The requested resource was not found. Please check the URL or try again later.",
  "Internal Server Error": "An unexpected error occurred on the server. Please try again later.",
  "Unauthorized": "You are not authorized to access this resource. Please log in and try again.",
  "Forbidden": "You do not have permission to access this resource. Please contact support if you believe this is an error.",
  // Add more status codes and messages as needed
};

interface ErrorGuide {
  status: string;
  statusText: string;
  description: string;
  solution: string;
};

const ERROR_GUIDE: Record<string, ErrorGuide> = {
  "400": {status:"", statusText:"", description:"", solution:""},
  "401": {status:"", statusText:"", description:"", solution:""},
  "403": {status:"", statusText:"", description:"", solution:""},
  "404": {status:"", statusText:"", description:"", solution:""},
  "408": {status: "", statusText: "", description:"", solution:""},
  "500": {status:"", statusText: "", description:"", solution:""},
  "StorageError": {status:"Storage Error", statusText: "Failed to access storage", description:"An error occurred while trying to access the storage. This may be due to insufficient permissions or a problem with the storage system.", solution:"Please check your permissions and try again. If the problem persists, contact support."},
  "DEFAULT": {
    status: "DEFAULT",
    statusText: "Unknown Error",
    description:"An unexpected error occurred.",
    solution:"Please try again"
  }
};

const getErrorGuid = (status:string,tl:(key: string, altKey?: string) => string)=>{
  const altKey = "pages.ErrorPage.codes." + status;
  return {status:status,statusText:tl("statusText",altKey),description: tl("description",altKey), solution: tl("solution",altKey)};
};


const getErrorCode = (error: unknown): string => {
  console.log("error: ",error);
  if (isRouteErrorResponse(error)) {
    console.log(error.data);
    return String(error.status);
  } else if (error instanceof Error){
    return error.message;
  }
  return "DEFAULT";
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
  let error = getErrorCode(useRouteError());
  const tl = useLocale('pages.ErrorPage');
  const guide = getErrorGuid(error, tl);
  const navigate = useNavigate();
  return <div>
    ERROR PAGE!!!
    <p>{guide.status} {guide.statusText}</p>
    <pre>{guide.description}</pre>
    <pre>{guide.solution}</pre>
    <button onClick={()=>navigate('/')}>Go Home</button>
    <button onClick={()=>navigate(-1)}>Go Back</button>
  </div>

};
export default ErrorPage;